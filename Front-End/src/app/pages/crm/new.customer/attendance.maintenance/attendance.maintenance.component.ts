import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

import { TextareaModule } from 'primeng/textarea';

import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ATTENDANCE_STAGES, ATTENDANCE_WORKFLOW, AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';
import { VISIT_PRODUCTS, VISIT_REASONS, VisitCatalogOption } from '@/app/models/crm/visit/visit.catalog';
import { StepperModule } from 'primeng/stepper';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceQuoteComponent } from '@/app/pages/crm/new.customer/attendance.quote/attendance.quote.component';

import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { AttendanceDocumentsComponent } from '@/app/pages/crm/new.customer/attendance.documents/attendance.documents.component';
import { Salesperson } from '@/app/models/crm/salesperson';

import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
    selector: 'p-attendance-maintenance',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonModule, TagModule, SelectModule, TextareaModule, SkeletonModule, ToastModule, AttendanceQuoteComponent, StepperModule, FilterClientComponent, AttendanceDocumentsComponent],
    templateUrl: './attendance.maintenance.component.html',
    styleUrl: './attendance.maintenance.component.scss',
    providers: [MessageService]
})
export default class AttendanceMaintenanceComponent implements OnInit {
    readonly isNew = signal(false);
    private readonly destroyRef = inject(DestroyRef);
    private attendanceId: number | null = null;
    readonly createError = signal('');

    readonly loadingSalespersons = signal(false);

    readonly salespersons = signal<Salesperson[]>([]);

    readonly newClientName = signal('');

    readonly createForm = new FormGroup({
        clientId: new FormControl<number | null>(null, Validators.required),
        salespersonId: new FormControl<number | null>(null, Validators.required),
        notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] })
    });

    readonly stages = ATTENDANCE_STAGES;

    readonly workflow = ATTENDANCE_WORKFLOW;

    readonly activeEditStep = signal(1);

    readonly selectedClientName = signal('');

    readonly selectedClientId = signal<number | null>(null);

    readonly originVisit = signal<Visit | null>(null);

    readonly loadingDetail = signal(false);

    readonly detailError = signal('');

    private detailRequest = 0;

    readonly visitReasons = VISIT_REASONS;

    readonly visitProducts = VISIT_PRODUCTS;

    readonly CANCELLED = AttendanceStatus.CANCELLED;

    readonly saving = signal(false);

    readonly saveError = signal('');

    readonly editing = signal<CustomerAttendance | null>(null);

    readonly readOnly = computed(() => this.editing()?.status === this.CANCELLED);

    budgetVisible = false;

    readonly budgetAttendance = signal<CustomerAttendance | null>(null);

    readonly form = new FormGroup({
        status: new FormControl(AttendanceStatus.VISIT_COMPLETED, { nonNullable: true, validators: [Validators.required] }),
        notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
        documentsNotes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
        proposalNotes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] })
    });

    selectNewClient(client: ClientCompany): void {
        if (this.saving() || !client.id || client.status !== StatusEnabDisabEnum.ENABLED) return;
        this.createForm.controls.clientId.setValue(client.id);
        this.newClientName.set(client.name);
    }

    private resetEditForm(item: CustomerAttendance): void {
        const status = item.status === AttendanceStatus.PAYMENT_PENDING ? AttendanceStatus.APPROVAL_PENDING : item.status;
        this.selectedClientId.set(item.clientId);
        this.selectedClientName.set(item.clientName);
        this.form.reset({ status, notes: item.notes ?? '', documentsNotes: item.documentsNotes ?? '', proposalNotes: item.proposalNotes ?? '' });
        if (item.status === this.CANCELLED) this.form.disable({ emitEvent: false });
        else this.form.enable({ emitEvent: false });
        const index = this.workflow.findIndex((step) => step.value === status);
        this.activeEditStep.set(item.status === this.CANCELLED ? 1 : index >= 0 ? index + 1 : 5);
    }

    async selectAttendanceClient(client: ClientCompany): Promise<void> {
        if (this.readOnly() || this.saving() || this.loadingDetail() || this.detailError() || !this.editing() || !client.id || !client.name.trim() || client.status !== StatusEnabDisabEnum.ENABLED) return;
        if (client.id === this.selectedClientId()) return;
        this.selectedClientId.set(client.id);
        this.selectedClientName.set(client.name);
        this.form.markAsDirty();
        if (!(await this.save(false)) && !this.saveError()) {
            this.saveError.set('O cliente ainda não foi salvo. Revise os campos do atendimento e tente salvar novamente.');
        }
    }

    selectEditStep(value: number): void {
        if (this.saving() || this.loadingDetail() || !this.workflow[value - 1]) return;
        this.activeEditStep.set(value);
        if (!this.readOnly() && (value !== 1 || this.originVisit())) this.form.controls.status.setValue(this.workflow[value - 1].value);
    }

    describeVisitValues(value: string | null | undefined, catalog: readonly VisitCatalogOption[]): string {
        return (value ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
            .map((id) => catalog.find((option) => String(option.id) === id)?.description ?? 'Código ' + id)
            .join(', ');
    }

    async printProposal(): Promise<void> {
        if (this.saving() || this.loadingDetail() || this.detailError() || !this.editing() || this.editing()?.status === this.CANCELLED) return;
        if (!this.form.controls.proposalNotes.value.trim()) {
            this.saveError.set('Informe a descrição da proposta comercial antes de imprimir.');
            return;
        }
        if (this.form.dirty && !(await this.save(false))) return;
        const item = this.editing();
        if (!item) return;
        this.saveError.set('');
        this.saving.set(true);
        try {
            await this.proposalPrinter.print(item, this.originVisit(), (error) => this.saveError.set(this.errorMessage(error, 'Não foi possível imprimir a proposta comercial.')));
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível imprimir a proposta comercial.'));
        } finally {
            this.saving.set(false);
        }
    }

    async openEditingBudget(): Promise<void> {
        if (this.saving() || this.loadingDetail() || this.detailError()) return;
        if (this.form.dirty && !(await this.save(false))) return;
        const item = this.editing();
        if (item) this.openBudget(item);
    }

    openBudget(item: CustomerAttendance): void {
        if (this.saving()) return;
        this.budgetAttendance.set(item);
        this.budgetVisible = true;
    }

    async save(closeAfter = true, nextStep?: number): Promise<boolean> {
        const item = this.editing();
        if (!item || this.saving() || item.status === this.CANCELLED || this.loadingDetail() || this.detailError()) return false;
        this.form.markAllAsTouched();
        if (this.form.invalid) return false;
        this.saving.set(true);
        this.saveError.set('');
        try {
            const status = nextStep ? this.workflow[nextStep - 1].value : this.form.controls.status.value;
            const result = await lastValueFrom(this.service.update({ id: item.id, version: item.version, ...this.form.getRawValue(), status, ...(this.selectedClientId() !== item.clientId ? { clientId: this.selectedClientId()! } : {}) }));
            if (!result?.id) throw new Error('O servidor não confirmou a atualização.');
            this.editing.set(result);
            this.selectedClientId.set(result.clientId);
            this.selectedClientName.set(result.clientName);
            this.form.controls.status.setValue(result.status);
            this.form.markAsPristine();
            if (nextStep) this.activeEditStep.set(nextStep);
            if (closeAfter) await this.router.navigate(['/crm/new/customer']);
            this.messages.add({ severity: 'success', summary: 'Atendimento atualizado', detail: 'Os dados do atendimento foram salvos.' });
            return true;
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível atualizar o atendimento.'));
            return false;
        } finally {
            this.saving.set(false);
        }
    }

    stageFor(status: AttendanceStatus) {
        return this.stages.find((stage) => stage.value === status) ?? this.stages[0];
    }

    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
    constructor(
        private service: CustomerAttendanceService,
        private route: ActivatedRoute,
        private router: Router,
        private messages: MessageService,
        private proposalPrinter: AttendanceProposalPrintService
    ) {}
    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            ++this.detailRequest;
            this.editing.set(null);
            this.originVisit.set(null);
            this.detailError.set('');
            this.saveError.set('');
            this.isNew.set(params.get('id') === 'new');
            const id = Number(params.get('id'));
            this.attendanceId = Number.isSafeInteger(id) && id > 0 ? id : null;
            if (this.isNew()) void this.loadSalespersons();
            else if (this.attendanceId) void this.loadDetail();
            else this.detailError.set('Código de atendimento inválido.');
        });
    }
    async loadSalespersons(): Promise<void> {
        if (this.saving() || this.loadingSalespersons()) return;
        this.createForm.reset();
        this.newClientName.set('');
        this.createError.set('');
        this.salespersons.set([]);
        this.loadingSalespersons.set(true);
        try {
            const people = await lastValueFrom(this.service.creationSalespersons());
            this.salespersons.set(people.filter((person) => person.status === StatusEnabDisabEnum.ENABLED));
            if (this.salespersons().length === 1) this.createForm.controls.salespersonId.setValue(this.salespersons()[0].id);
        } catch (error: unknown) {
            this.createError.set(this.errorMessage(error, 'Não foi possível carregar os vendedores. Feche e tente novamente.'));
        } finally {
            this.loadingSalespersons.set(false);
        }
    }
    async create(): Promise<void> {
        if (this.saving() || this.loadingSalespersons()) return;
        this.createForm.markAllAsTouched();
        if (this.createForm.invalid) return;
        const { clientId, salespersonId, notes } = this.createForm.getRawValue();
        this.saving.set(true);
        this.createError.set('');
        try {
            const created = await lastValueFrom(this.service.create({ clientId: clientId!, salespersonId: salespersonId!, notes: notes.trim() }));
            if (!created?.id) throw new Error('O servidor não confirmou a criação do atendimento.');
            this.saving.set(false);
            await this.router.navigate(['/crm/new/customer'], { replaceUrl: true, queryParams: { createdAttendanceId: created.id } });
        } catch (error: unknown) {
            this.createError.set(this.errorMessage(error, 'Não foi possível criar o atendimento.'));
        } finally {
            this.saving.set(false);
        }
    }
    async loadDetail(): Promise<void> {
        const id = this.attendanceId;
        if (!id || this.saving()) return;
        const request = ++this.detailRequest;
        this.loadingDetail.set(true);
        this.detailError.set('');
        this.saveError.set('');
        try {
            const detail = await lastValueFrom(this.service.detail(id));
            if (request !== this.detailRequest || this.destroyRef.destroyed) return;
            if (detail?.attendance?.id !== id || (detail.attendance.visitId != null && detail.visit?.id !== detail.attendance.visitId)) throw new Error('O servidor não retornou os dados de origem deste atendimento.');
            this.editing.set(detail.attendance);
            this.originVisit.set(detail.visit);
            this.resetEditForm(detail.attendance);
        } catch (error: unknown) {
            if (request === this.detailRequest) this.detailError.set(this.errorMessage(error, 'Não foi possível carregar o atendimento.'));
        } finally {
            if (request === this.detailRequest) this.loadingDetail.set(false);
        }
    }
    budgetSaved(item: CustomerAttendance): void {
        if (this.editing()?.id !== item.id) return;
        this.editing.set(item);
        const selectedStep = this.activeEditStep();
        this.resetEditForm(item);
        this.activeEditStep.set(selectedStep);
        if (!this.readOnly() && (selectedStep !== 1 || this.originVisit())) this.form.controls.status.setValue(this.workflow[selectedStep - 1].value);
        this.messages.add({ severity: 'success', summary: 'Orçamento salvo', detail: 'Os produtos e valores foram salvos no atendimento.' });
    }
}
