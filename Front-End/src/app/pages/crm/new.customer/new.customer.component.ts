import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ATTENDANCE_STAGES, ATTENDANCE_WORKFLOW, AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';
import { VISIT_PRODUCTS, VISIT_REASONS, VisitCatalogOption } from '@/app/models/crm/visit/visit.catalog';
import { StepperModule } from 'primeng/stepper';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceQuoteComponent } from '@/app/pages/crm/new.customer/attendance.quote/attendance.quote.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { AttendanceQueryMode } from '@/app/models/crm/customer.attendance';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';

@Component({
    selector: 'p-customer-attendance',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormsModule,
        ButtonModule,
        TagModule,
        SelectModule,
        DialogModule,
        InputTextModule,
        TextareaModule,
        PaginatorModule,
        SkeletonModule,
        ToastModule,
        AttendanceQuoteComponent,
        InputNumberModule,
        StepperModule,
        FilterClientComponent
    ],
    templateUrl: './new.customer.component.html',
    styleUrl: './new.customer.component.scss',
    providers: [MessageService]
})
export default class NewCustomerComponent implements OnInit {
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
    readonly editableStages = ATTENDANCE_STAGES.filter((stage) => stage.value !== AttendanceStatus.CANCELLED);
    readonly CANCELLED = AttendanceStatus.CANCELLED;
    readonly cancelling = signal<CustomerAttendance | null>(null);
    readonly cancelError = signal('');
    cancellationVisible = false;
    readonly cancelForm = new FormGroup({ reason: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }) });
    readonly items = signal<CustomerAttendance[]>([]);
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    readonly saveError = signal('');
    readonly queryMode = signal<AttendanceQueryMode>('ACTIVE');
    readonly queryError = signal('');
    private queryRequest = 0;
    readonly queryForm = new FormGroup({
        id: new FormControl<number | null>(null, Validators.min(1)),
        clientName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
        salespersonName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] })
    });
    readonly queryStages = computed(() =>
        this.stages.filter(
            (stage) =>
                (stage.value !== AttendanceStatus.PAYMENT_PENDING || this.items().some((item) => item.status === AttendanceStatus.PAYMENT_PENDING)) &&
                (this.queryMode() === 'CANCELLED' ? stage.value === this.CANCELLED : stage.value !== this.CANCELLED)
        )
    );
    readonly statusFilter = signal<AttendanceStatus | null>(null);
    readonly first = signal(0);
    readonly editing = signal<CustomerAttendance | null>(null);
    readonly highlightedVisitId: number;
    dialogVisible = false;
    budgetVisible = false;
    readonly budgetAttendance = signal<CustomerAttendance | null>(null);
    readonly form = new FormGroup({
        status: new FormControl(AttendanceStatus.VISIT_COMPLETED, { nonNullable: true, validators: [Validators.required] }),
        notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
        documentsNotes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }),
        proposalNotes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] })
    });
    readonly filteredItems = computed(() => {
        return this.items()
            .filter((item) => (this.queryMode() === 'CANCELLED' ? item.status === this.CANCELLED : item.status !== this.CANCELLED) && (!this.statusFilter() || item.status === this.statusFilter()))
            .sort((a, b) => Number(b.visitId === this.highlightedVisitId) - Number(a.visitId === this.highlightedVisitId) || new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    });
    readonly pageItems = computed(() => this.filteredItems().slice(this.first(), this.first() + 12));
    readonly counts = computed(() => this.queryStages().map((stage) => ({ ...stage, count: this.items().filter((item) => item.status === stage.value).length })));

    constructor(
        private service: CustomerAttendanceService,
        private route: ActivatedRoute,
        private messages: MessageService,
        private proposalPrinter: AttendanceProposalPrintService
    ) {
        this.highlightedVisitId = Number(this.route.snapshot.queryParamMap.get('visitId')) || 0;
    }

    ngOnInit(): void {
        void this.load();
    }

    async load(): Promise<void> {
        if (this.saving()) return;
        const request = ++this.queryRequest;
        this.loading.set(false);
        this.queryError.set('');
        const filters = this.queryForm.getRawValue();
        filters.clientName = filters.clientName.trim();
        filters.salespersonName = filters.salespersonName.trim();
        if (this.queryForm.invalid) {
            this.queryError.set('Revise o código e os nomes informados.');
            return;
        }
        const hasFilters = filters.id !== null || !!filters.clientName || !!filters.salespersonName;
        const mode = this.queryMode();
        if (mode === 'CANCELLED' && !hasFilters) {
            this.items.set([]);
            this.queryError.set('Informe o código do atendimento, cliente ou vendedor para consultar cancelados.');
            return;
        }
        this.loading.set(true);
        this.loadError.set('');
        try {
            const result = await lastValueFrom(hasFilters ? this.service.search(mode, filters) : this.service.list());
            if (request === this.queryRequest) {
                this.items.set(result);
                this.first.set(0);
            }
        } catch (error: unknown) {
            if (request === this.queryRequest) this.loadError.set(this.errorMessage(error, 'Não foi possível carregar os atendimentos.'));
        } finally {
            if (request === this.queryRequest) this.loading.set(false);
        }
    }

    changeQueryMode(mode: AttendanceQueryMode): void {
        if (this.saving() || mode === this.queryMode()) return;
        ++this.queryRequest;
        this.queryMode.set(mode);
        this.loading.set(false);
        this.items.set([]);
        this.loadError.set('');
        this.queryError.set('');
        this.statusFilter.set(null);
        this.first.set(0);
        this.queryForm.reset({ id: null, clientName: '', salespersonName: '' });
        if (mode === 'ACTIVE') void this.load();
    }

    clearQuery(): void {
        ++this.queryRequest;
        this.loading.set(false);
        this.items.set([]);
        this.loadError.set('');
        this.queryError.set('');
        this.statusFilter.set(null);
        this.first.set(0);
        this.queryForm.reset({ id: null, clientName: '', salespersonName: '' });
        if (this.queryMode() === 'ACTIVE') void this.load();
    }
    changeStatus(value: AttendanceStatus | null): void {
        this.statusFilter.set(value);
        this.first.set(0);
    }

    stageFor(status: AttendanceStatus) {
        return this.stages.find((stage) => stage.value === status) ?? this.stages[0];
    }

    async open(item: CustomerAttendance): Promise<void> {
        if (this.saving() || item.status === this.CANCELLED) return;
        const request = ++this.detailRequest;
        this.editing.set(item);
        this.resetEditForm(item);
        this.originVisit.set(null);
        this.detailError.set('');
        this.loadingDetail.set(true);
        this.saveError.set('');
        this.dialogVisible = true;
        try {
            const detail = await lastValueFrom(this.service.detail(item.id));
            if (request !== this.detailRequest || !this.dialogVisible) return;
            if (detail?.attendance?.id !== item.id || detail.visit?.id !== detail.attendance.visitId) throw new Error('O servidor não retornou a visita de origem deste atendimento.');
            if (detail.attendance.status === this.CANCELLED) {
                this.items.update((items) => items.map((current) => (current.id === item.id ? detail.attendance : current)));
                this.dialogVisible = false;
                this.messages.add({ severity: 'info', summary: 'Atendimento cancelado', detail: 'Este atendimento foi cancelado e está disponível apenas para consulta.' });
                return;
            }
            this.editing.set(detail.attendance);
            this.originVisit.set(detail.visit);
            this.resetEditForm(detail.attendance);
        } catch (error: unknown) {
            if (request === this.detailRequest) this.detailError.set(this.errorMessage(error, 'Não foi possível carregar os dados do atendimento e da visita.'));
        } finally {
            if (request === this.detailRequest) this.loadingDetail.set(false);
        }
    }

    private resetEditForm(item: CustomerAttendance): void {
        const status = item.status === AttendanceStatus.PAYMENT_PENDING ? AttendanceStatus.APPROVAL_PENDING : item.status;
        this.selectedClientId.set(item.clientId);
        this.selectedClientName.set(item.clientName);
        this.form.reset({ status, notes: item.notes ?? '', documentsNotes: item.documentsNotes ?? '', proposalNotes: item.proposalNotes ?? '' });
        const index = this.workflow.findIndex((step) => step.value === status);
        this.activeEditStep.set(index >= 0 ? index + 1 : 5);
    }

    async selectAttendanceClient(client: ClientCompany): Promise<void> {
        if (this.saving() || this.loadingDetail() || !this.originVisit() || !client.id || !client.name.trim() || client.status !== StatusEnabDisabEnum.ENABLED) return;
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
        this.form.controls.status.setValue(this.workflow[value - 1].value);
    }

    closeEditor(visible: boolean): void {
        if (this.saving()) return;
        this.dialogVisible = visible;
        if (!visible) {
            ++this.detailRequest;
            this.loadingDetail.set(false);
        }
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
        if (this.saving() || this.loadingDetail() || this.detailError() || !this.originVisit() || !this.editing() || this.editing()?.status === this.CANCELLED) return;
        if (!this.form.controls.proposalNotes.value.trim()) {
            this.saveError.set('Informe a descrição da proposta comercial antes de imprimir.');
            return;
        }
        if (this.form.dirty && !(await this.save(false))) return;
        const item = this.editing();
        if (!item) return;
        this.saveError.set('');
        try {
            this.proposalPrinter.print(item, (error) => this.saveError.set(this.errorMessage(error, 'Não foi possível imprimir a proposta comercial.')));
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível imprimir a proposta comercial.'));
        }
    }

    async openEditingBudget(): Promise<void> {
        if (this.saving() || this.loadingDetail() || this.detailError()) return;
        if (this.form.dirty && !(await this.save(false))) return;
        const item = this.editing();
        if (item) this.openBudget(item);
    }

    openCancellation(item: CustomerAttendance): void {
        if (this.saving() || item.status === this.CANCELLED) return;
        this.cancelling.set(item);
        this.cancelForm.reset({ reason: '' });
        this.cancelError.set('');
        this.cancellationVisible = true;
    }

    async cancel(): Promise<void> {
        const item = this.cancelling();
        if (!item || this.saving() || item.status === this.CANCELLED) return;
        this.cancelForm.markAllAsTouched();
        this.cancelError.set('');
        const reason = this.cancelForm.controls.reason.value.trim();
        if (this.cancelForm.invalid || !reason) {
            this.cancelError.set('Informe o motivo do cancelamento, com até 2000 caracteres.');
            return;
        }
        this.saving.set(true);
        try {
            const result = await lastValueFrom(this.service.cancel({ id: item.id, version: item.version, reason }));
            if (!result?.id || result.status !== this.CANCELLED) throw new Error('O servidor não confirmou o cancelamento.');
            this.items.update((items) => items.map((current) => (current.id === result.id ? result : current)));
            if (this.first() >= this.filteredItems().length) this.first.set(0);
            this.cancellationVisible = false;
            this.cancelling.set(null);
            this.messages.add({ severity: 'success', summary: 'Atendimento cancelado', detail: 'O motivo do cancelamento foi registrado.' });
        } catch (error: unknown) {
            this.cancelError.set(this.errorMessage(error, 'Não foi possível cancelar o atendimento.'));
        } finally {
            this.saving.set(false);
        }
    }

    openBudget(item: CustomerAttendance): void {
        if (this.saving()) return;
        this.budgetAttendance.set(item);
        this.budgetVisible = true;
    }

    budgetSaved(item: CustomerAttendance): void {
        this.items.update((items) => items.map((current) => (current.id === item.id ? item : current)));
        if (this.first() >= this.filteredItems().length) this.first.set(0);
        if (this.dialogVisible && this.editing()?.id === item.id) {
            this.editing.set(item);
            const selectedStep = this.activeEditStep();
            this.resetEditForm(item);
            this.activeEditStep.set(selectedStep);
            this.form.controls.status.setValue(this.workflow[selectedStep - 1].value);
        }
        this.messages.add({ severity: 'success', summary: 'Orçamento salvo', detail: 'Os produtos e os valores foram salvos no atendimento.' });
    }

    async save(closeAfter = true, nextStep?: number): Promise<boolean> {
        const item = this.editing();
        if (!item || this.saving() || item.status === this.CANCELLED || this.loadingDetail() || this.detailError() || !this.originVisit()) return false;
        this.form.markAllAsTouched();
        if (this.form.invalid) return false;
        this.saving.set(true);
        this.saveError.set('');
        try {
            const status = nextStep ? this.workflow[nextStep - 1].value : this.form.controls.status.value;
            const result = await lastValueFrom(this.service.update({ id: item.id, version: item.version, ...this.form.getRawValue(), status, ...(this.selectedClientId() !== item.clientId ? { clientId: this.selectedClientId()! } : {}) }));
            if (!result?.id) throw new Error('O servidor não confirmou a atualização.');
            this.items.update((items) => items.map((current) => (current.id === result.id ? result : current)));
            if (this.first() >= this.filteredItems().length) this.first.set(0);
            this.editing.set(result);
            this.selectedClientId.set(result.clientId);
            this.selectedClientName.set(result.clientName);
            this.form.controls.status.setValue(result.status);
            this.form.markAsPristine();
            if (nextStep) this.activeEditStep.set(nextStep);
            if (closeAfter) {
                this.dialogVisible = false;
                ++this.detailRequest;
            }
            this.messages.add({ severity: 'success', summary: 'Atendimento atualizado', detail: 'Os dados do atendimento foram salvos.' });
            return true;
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível atualizar o atendimento.'));
            return false;
        } finally {
            this.saving.set(false);
        }
    }

    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
}
