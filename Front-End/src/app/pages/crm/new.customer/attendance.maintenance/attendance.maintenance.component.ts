import { AttendanceLogsComponent } from '@/app/pages/crm/new.customer/attendance.logs/attendance.logs.component';
import { AttendancePaymentComponent } from '@/app/pages/crm/new.customer/attendance.payment/attendance.payment.component';
import { parseAttendanceDate, serializeAttendanceDate } from '@/app/models/crm/attendance.date';
import { InputTextModule } from 'primeng/inputtext';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { Component, OnInit, computed, effect, signal, untracked } from '@angular/core';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';
import { AttendanceQuote, calculateQuoteItem } from '@/app/models/crm/attendance.quote';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

import { TextareaModule } from 'primeng/textarea';

import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ATTENDANCE_STAGES, ATTENDANCE_WORKFLOW, AttendanceStatus, CustomerAttendance, isAttendanceReadOnly } from '@/app/models/crm/customer.attendance';
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
import { ISalespersonType } from '@/app/interfaces/salesperson/i.salesperson.type';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
@Component({
    selector: 'p-attendance-maintenance',
    standalone: true,
    imports: [
        AttendanceLogsComponent,
        InputTextModule,
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        DatePickerModule,
        ButtonModule,
        TagModule,
        SelectModule,
        TextareaModule,
        SkeletonModule,
        ToastModule,
        ConfirmDialogModule,
        AttendanceQuoteComponent,
        StepperModule,
        FilterClientComponent,
        AttendancePaymentComponent,
        AttendanceDocumentsComponent
    ],
    templateUrl: './attendance.maintenance.component.html',
    styleUrl: './attendance.maintenance.component.scss',
    providers: [MessageService, ConfirmationService]
})
export default class AttendanceMaintenanceComponent implements OnInit {
    readonly isNew = signal(false);
    private readonly destroyRef = inject(DestroyRef);
    private readonly confirmations = inject(ConfirmationService);
    readonly confirmingCompletion = signal(false);
    private attendanceId: number | null = null;
    readonly createError = signal('');

    readonly loadingSalespersons = signal(false);
    readonly salespersonsError = signal('');

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

    readonly completed = computed(() => this.editing()?.status === AttendanceStatus.COMPLETED);
    readonly readOnly = computed(() => isAttendanceReadOnly(this.editing()?.status));
    readonly hasRegisteredClient = computed(() => {
        const id = this.selectedClientId() ?? this.editing()?.clientId;
        return typeof id === 'number' && Number.isSafeInteger(id) && id > 0;
    });

    readonly loadingSummary = signal(false);
    readonly summaryQuote = signal<AttendanceQuote | null | undefined>(undefined);
    readonly summaryQuoteError = signal('');
    readonly quoteItemAmounts = calculateQuoteItem;
    private summaryRequest = 0;
    private readonly summaryAttendanceId = signal<number | null>(null);
    private readonly summaryDocuments = signal<AttendanceDocument[]>([]);
    private readonly summaryErrors = signal<Partial<Record<'PAYMENT' | 'INVOICING', string>>>({});
    readonly financialSummaries = computed(() => {
        const quoteTotal = this.editing()?.quoteTotal;
        return (
            [
                { stage: 'PAYMENT', label: 'Pagamento', step: 4 },
                { stage: 'INVOICING', label: 'Faturamento', step: 5 }
            ] as const
        ).map((entry) => {
            const documents = this.summaryDocuments().filter((document) => document.stage === entry.stage);
            const valid = (amount: number | null | undefined): amount is number => typeof amount === 'number' && Number.isFinite(amount) && amount > 0 && amount <= 999999999999.99 && amount === Number(amount.toFixed(2));
            const totalCents = documents.reduce((sum, document) => sum + (valid(document.receiptAmount) ? Math.round(document.receiptAmount * 100) : 0), 0);
            const difference = quoteTotal == null ? null : Math.round(quoteTotal * 100) - totalCents;
            return {
                ...entry,
                count: documents.length,
                total: totalCents / 100,
                remaining: difference == null ? null : Math.max(0, difference) / 100,
                excess: difference == null ? 0 : Math.max(0, -difference) / 100,
                missingValues: documents.filter((document) => !valid(document.receiptAmount)).map((document) => document.fileName),
                error: this.summaryErrors()[entry.stage]
            };
        });
    });
    readonly canComplete = computed(() => {
        const item = this.editing();
        return (
            !!item &&
            this.hasRegisteredClient() &&
            !this.readOnly() &&
            !this.loadingSummary() &&
            this.summaryAttendanceId() === item.id &&
            !this.summaryQuoteError() &&
            this.financialSummaries().every((summary) => !summary.error && summary.count > 0 && summary.remaining === 0 && summary.excess === 0 && summary.missingValues.length === 0)
        );
    });

    get summarySalespersonName(): string {
        return this.salespersons().find((person) => person.id === this.form.controls.salespersonId.value)?.name ?? this.editing()?.salespersonName ?? 'Não informado';
    }

    get summarySalesperson(): Salesperson | undefined {
        return this.salespersons().find((person) => person.id === this.form.controls.salespersonId.value);
    }

    async loadCompletionSummary(): Promise<void> {
        const request = ++this.summaryRequest;
        const id = this.editing()?.id;
        this.summaryAttendanceId.set(null);
        this.summaryDocuments.set([]);
        this.summaryErrors.set({});
        this.summaryQuote.set(undefined);
        this.summaryQuoteError.set('');
        this.loadingSummary.set(false);
        if (!id || this.activeEditStep() !== 7) return;
        this.loadingSummary.set(true);
        const stages = ['PAYMENT', 'INVOICING'] as const;
        const [results, quoteResult] = await Promise.all([Promise.allSettled(stages.map((stage) => lastValueFrom(this.service.documents(id, stage)))), Promise.allSettled([lastValueFrom(this.service.getQuote(id))])]);
        if (request !== this.summaryRequest || this.destroyRef.destroyed) return;
        const documents: AttendanceDocument[] = [];
        const errors: Partial<Record<'PAYMENT' | 'INVOICING', string>> = {};
        results.forEach((result, index) => {
            const stage = stages[index];
            if (result.status === 'fulfilled') documents.push(...result.value.filter((document) => document.stage === stage));
            else errors[stage] = this.errorMessage(result.reason, 'Não foi possível consultar os valores desta etapa.');
        });
        this.summaryDocuments.set(documents);
        this.summaryErrors.set(errors);
        const quote = quoteResult[0];
        if (quote.status === 'fulfilled' && quote.value?.attendance?.id === id) this.summaryQuote.set(quote.value.quote);
        else this.summaryQuoteError.set(quote.status === 'rejected' ? this.errorMessage(quote.reason, 'Não foi possível consultar os itens do orçamento.') : 'O servidor não retornou o orçamento deste atendimento.');
        this.loadingSummary.set(false);
        this.summaryAttendanceId.set(id);
    }

    budgetVisible = false;

    readonly budgetAttendance = signal<CustomerAttendance | null>(null);

    readonly form = new FormGroup({
        expectedDeliveryDate: new FormControl<Date | null>(null),
        scheduledDeliveryDate: new FormControl<Date | null>(null),
        pickupDate: new FormControl<Date | null>(null),
        salespersonId: new FormControl<number | null>(null, Validators.required),
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
        const status = item.status === AttendanceStatus.APPROVAL_PENDING ? AttendanceStatus.COMMERCIAL_PROPOSAL : item.status === AttendanceStatus.DOCUMENTS_PENDING ? AttendanceStatus.QUOTATION : item.status;
        this.selectedClientId.set(item.clientId);
        this.selectedClientName.set(item.clientName);
        this.form.reset({
            scheduledDeliveryDate: parseAttendanceDate(item.scheduledDeliveryDate),
            pickupDate: parseAttendanceDate(item.pickupDate),
            expectedDeliveryDate: parseAttendanceDate(item.expectedDeliveryDate),
            salespersonId: item.salespersonId,
            status,
            notes: item.notes ?? '',
            documentsNotes: item.documentsNotes ?? '',
            proposalNotes: item.proposalNotes ?? ''
        });
        if (isAttendanceReadOnly(item.status)) this.form.disable({ emitEvent: false });
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
        // On the final step, linking a client must not bypass completion confirmation.
        if (this.activeEditStep() === this.workflow.length) {
            this.saveError.set('');
            return;
        }
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

    saveCurrentStep(): void {
        if (this.activeEditStep() === this.workflow.length) this.requestCompletion();
        else void this.save(false);
    }

    requestCompletion(): void {
        const item = this.editing();
        if (!item || this.activeEditStep() !== this.workflow.length || this.saving() || this.loadingDetail() || this.detailError() || !this.canComplete() || this.confirmingCompletion()) return;
        this.form.markAllAsTouched();
        if (this.form.invalid) return;
        this.confirmingCompletion.set(true);
        this.confirmations.confirm({
            key: 'completeAttendance',
            header: 'Concluir atendimento?',
            message: `Deseja concluir o atendimento #${item.id}? Após a conclusão, os dados, valores, orçamento e documentos ficarão disponíveis apenas para consulta e não poderão ser alterados.`,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Sim, concluir', icon: 'pi pi-check' },
            rejectButtonProps: { label: 'Voltar', severity: 'secondary', outlined: true },
            reject: () => this.confirmingCompletion.set(false),
            accept: () => {
                this.confirmingCompletion.set(false);
                if (this.editing()?.id !== item.id || this.editing()?.version !== item.version || this.activeEditStep() !== this.workflow.length || !this.canComplete()) return;
                void this.save(true);
            }
        });
    }

    async save(closeAfter = true, nextStep?: number): Promise<boolean> {
        const item = this.editing();
        if (!item || this.saving() || isAttendanceReadOnly(item.status) || this.loadingDetail() || this.detailError()) return false;
        if (!this.hasRegisteredClient()) {
            this.saveError.set('Selecione um cliente cadastrado antes de salvar a etapa do atendimento.');
            return false;
        }
        // Advancing from delivery opens the review without completing the attendance.
        const status = nextStep ? this.workflow[nextStep === this.workflow.length ? nextStep - 2 : nextStep - 1].value : this.form.controls.status.value;
        if (status === AttendanceStatus.COMPLETED && !this.canComplete()) {
            this.saveError.set('Resolva as pendências de Pagamento e Faturamento e atualize o resumo antes de concluir o atendimento.');
            return false;
        }
        this.form.markAllAsTouched();
        if (this.form.invalid) return false;
        this.saving.set(true);
        this.saveError.set('');
        try {
            const result = await lastValueFrom(
                this.service.update({
                    id: item.id,
                    version: item.version,
                    ...this.form.getRawValue(),
                    expectedDeliveryDate: serializeAttendanceDate(this.form.controls.expectedDeliveryDate.value),
                    scheduledDeliveryDate: serializeAttendanceDate(this.form.controls.scheduledDeliveryDate.value),
                    pickupDate: serializeAttendanceDate(this.form.controls.pickupDate.value),
                    salespersonId: this.form.controls.salespersonId.value!,
                    status,
                    ...(this.selectedClientId() !== item.clientId ? { clientId: this.selectedClientId()! } : {})
                })
            );
            if (!result?.id) throw new Error('O servidor não confirmou a atualização.');
            this.editing.set(result);
            if (isAttendanceReadOnly(result.status)) this.form.disable({ emitEvent: false });
            this.selectedClientId.set(result.clientId);
            this.selectedClientName.set(result.clientName);
            this.form.controls.salespersonId.setValue(result.salespersonId);
            this.form.controls.status.setValue(result.status);
            this.form.markAsPristine();
            if (nextStep) {
                this.activeEditStep.set(nextStep);
                this.form.controls.status.setValue(this.workflow[nextStep - 1].value);
            }
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
        private salespersonService: SalespersonService,
        private route: ActivatedRoute,
        private router: Router,
        private messages: MessageService,
        private proposalPrinter: AttendanceProposalPrintService
    ) {
        effect(() => {
            this.activeEditStep();
            this.editing();
            untracked(() => void this.loadCompletionSummary());
        });
    }

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
            else if (this.attendanceId) {
                void this.loadDetail();
                void this.loadSalespersons();
            } else this.detailError.set('Código de atendimento inválido.');
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

            const types: ISalespersonType = { typeSalesPart: YesNotEnum.NOT, typeSalesService: YesNotEnum.NOT, typeSalesVehicle: YesNotEnum.YES };
            const salespeople = await lastValueFrom(this.salespersonService.filterType(types));
            this.salespersons.set(salespeople);

            if (this.salespersons().length === 1) this.createForm.controls.salespersonId.setValue(this.salespersons()[0].id);
        } catch (error: unknown) {
            const message = this.errorMessage(error, 'Falha ao carregar vendedores. Tente novamente.');
            if (this.isNew()) this.createError.set(message);
            else this.salespersonsError.set(message);
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
            console.log('Detail loaded:', detail);
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
