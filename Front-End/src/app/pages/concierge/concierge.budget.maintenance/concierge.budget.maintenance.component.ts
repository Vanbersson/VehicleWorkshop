import { ConciergeBudgetDocumentsComponent } from '@/app/pages/concierge/concierge.budget.documents/concierge.budget.documents.component';
import { ConciergeBudget, ConciergeBudgetCreate, CONCIERGE_BUDGET_STATUSES, hasConciergeBudgetApproval } from '@/app/models/concierge.budget';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, finalize, catchError, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { TypePayment } from '@/app/models/type.payment';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { TypePaymentService } from '@/app/services/client/type.payment.service';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
function grossMillis(value: { type: number; quantity: number; price: number; hourService: number | null }): number {
    const hours = value.type === 1 ? (value.hourService ?? 0) : 1;
    const units = value.type === 1 ? hours : value.quantity;
    if (![units, value.price].every(Number.isFinite)) return NaN;
    const divisor = 100n;
    const product = BigInt(Math.round(units * 100)) * BigInt(Math.round(value.price * 1000));
    return Number((product + divisor / 2n) / divisor);
}
const lineValidator: ValidatorFn = (control) => {
    const value = control.value as { type: number; description: string; quantity: number; hourService: number | null; price: number; discount: number };
    const valid = (n: number | null, max: number, scale: number, positive = false) => typeof n === 'number' && Number.isFinite(n) && (positive ? n > 0 : n >= 0) && n <= max && n === Number(n.toFixed(scale));
    const gross = grossMillis(value);
    return ![0, 1].includes(value.type) ||
        !value.description?.trim() ||
        (value.type === 0 && !valid(value.quantity, 999999999.99, 2, true)) ||
        !valid(value.price, 99999999.999, 3) ||
        !valid(value.discount, 99999999.999, 3) ||
        (value.type === 1 && !valid(value.hourService, 999999999.99, 2, true)) ||
        !Number.isSafeInteger(gross) ||
        Math.round(value.discount * 1000) > gross
        ? { invalidLine: true }
        : null;
};
function createLine(type: 0 | 1) {
    return new FormGroup(
        {
            type: new FormControl<0 | 1>(type, { nonNullable: true }),
            description: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
            quantity: new FormControl(1, { nonNullable: true, validators: type === 0 ? Validators.required : [] }),
            hourService: new FormControl<number | null>(type === 1 ? 1 : null),
            price: new FormControl(0, { nonNullable: true, validators: Validators.required }),
            discount: new FormControl(0, { nonNullable: true, validators: Validators.required })
        },
        { validators: lineValidator }
    );
}
@Component({
    selector: 'p-concierge-budget-maintenance',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, SelectModule, DatePickerModule, TextareaModule, InputNumberModule, InputTextModule, ConciergeBudgetDocumentsComponent, TagModule, DialogModule],
    templateUrl: './concierge.budget.maintenance.component.html',
    styleUrl: './concierge.budget.maintenance.component.scss'
})
export default class ConciergeBudgetMaintenanceComponent implements OnInit {
    private readonly service = inject(ConciergeBudgetService);
    private readonly vehicleService = inject(VehicleEntryService);
    private readonly paymentService = inject(TypePaymentService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute, { optional: true });
    editId = Number(this.route?.snapshot.queryParamMap.get('id')) || null;
    readonly editing = signal<ConciergeBudget | null>(null);
    readonly hasApproval = hasConciergeBudgetApproval;
    readonly statuses = CONCIERGE_BUDGET_STATUSES;
    get readOnly(): boolean {
        return !!this.editing() && (this.editing()!.canEdit === false || !['OpenBudget', 'Approved'].includes(this.editing()!.status));
    }
    documentChanged(): void {
        const budget = this.editing();
        if (budget?.status === 'Approved') this.editing.set({ ...budget, status: 'OpenBudget', dateAuthorization: null });
    }
    private applyBudget(budget: ConciergeBudget): void {
        this.editing.set(budget);
        this.items.clear();
        for (const entry of [...budget.items].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))) {
            const line = createLine(entry.type);
            line.patchValue(entry);
            this.items.push(line);
        }
        const vehicle = this.vehicles().find((entry) => entry.id === budget.vehicleId);
        const linked = {
            ...new VehicleEntry(),
            ...vehicle,
            id: budget.vehicleId,
            clientCompanyId: budget.clientCompanyId,
            clientCompanyName: budget.clientCompanyName,
            salespersonId: budget.salespersonUserId,
            salespersonName: budget.salespersonUserName ?? '',
            label: vehicle?.label ?? '#' + budget.vehicleId
        };
        this.vehicles.update((entries) => [linked, ...entries.filter((entry) => entry.id !== linked.id)]);
        this.selectedVehicle.set(null);
        this.selectVehicle(budget.vehicleId);
        this.form.patchValue({ vehicleId: budget.vehicleId, paymentTypeId: budget.paymentTypeId, information: budget.information ?? '', dateValidation: budget.dateValidation ? new Date(budget.dateValidation) : null });
        if (budget.paymentTypeId && !this.payments().some((entry) => entry.id === budget.paymentTypeId)) this.payments.update((entries) => [...entries, { ...new TypePayment(), id: budget.paymentTypeId, description: budget.paymentTypeDesc ?? '' }]);
        if (this.readOnly) this.form.disable();
        else this.form.controls.vehicleId.disable();
    }
    private readonly destroyRef = inject(DestroyRef);
    readonly vehicles = signal<(VehicleEntry & { label: string })[]>([]);
    readonly payments = signal<TypePayment[]>([]);
    readonly selectedVehicle = signal<VehicleEntry | null>(null);
    readonly clientName = signal('');
    readonly attendantName = signal('');
    get missingVehicleData(): boolean {
        return !!this.selectedVehicle() && !this.form.controls.clientCompanyId.value;
    }
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    readonly paymentWarning = signal('');
    readonly error = signal('');
    readonly success = signal('');
    readonly items = new FormArray<ReturnType<typeof createLine>>([]);
    addItem(type: 0 | 1): void {
        if (!this.readOnly && !this.saving() && this.items.length < 500) {
            this.items.push(createLine(type));
            this.form.markAsDirty();
        }
    }
    removeItem(index: number): void {
        if (!this.readOnly && !this.saving()) {
            this.items.removeAt(index);
            this.form.markAsDirty();
        }
    }
    lineTotal(index: number): number {
        const item = this.items.at(index).getRawValue();
        return (grossMillis(item) - Math.round(item.discount * 1000)) / 1000;
    }
    get total(): number {
        return this.items.controls.reduce((sum, _, index) => sum + Math.round(this.lineTotal(index) * 1000), 0) / 1000;
    }
    readonly form = new FormGroup({
        items: this.items,
        clientCompanyId: new FormControl<number | null>(null, Validators.required),
        salespersonUserId: new FormControl<number | null>(null, Validators.required),
        vehicleId: new FormControl<number | null>(null, Validators.required),
        dateValidation: new FormControl<Date | null>(null),
        paymentTypeId: new FormControl<number | null>(null),
        information: new FormControl('', { nonNullable: true, validators: Validators.maxLength(255) })
    });
    ngOnInit(): void {
        this.loadOptions();
    }
    loadOptions(): void {
        if (this.loading() || this.saving()) return;
        this.loading.set(true);
        this.loadError.set('');
        this.paymentWarning.set('');
        forkJoin({
            vehicles: this.vehicleService.listAllPlates(),
            creationSalespeople: this.editId ? of([]) : this.service.attendants(),
            budget: this.editId ? this.service.detail(this.editId) : of(null),
            payments: this.paymentService.listAllEnabled().pipe(
                catchError(() => {
                    this.paymentWarning.set('Não foi possível carregar as formas de pagamento. Você pode salvar sem informar esse campo ou tentar carregar novamente.');
                    this.form.controls.paymentTypeId.setValue(null);
                    return of<TypePayment[]>([]);
                })
            )
        })
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: ({ vehicles, payments, budget, creationSalespeople }) => {
                    this.vehicles.set(
                        vehicles
                            .filter((item) => this.editId || creationSalespeople.some((person) => person.id === item.salespersonId))
                            .map((item) => ({ ...item, label: '#' + item.id + ' - ' + (item.vehiclePlate || item.vehicleFleet || 'Sem placa') + (item.modelDescription ? ' - ' + item.modelDescription : '') + ' - ' + item.clientCompanyName }))
                    );
                    this.payments.set(payments);
                    if (budget && !this.editing()) this.applyBudget(budget);
                },
                error: (error: unknown) => this.loadError.set(this.message(error, 'Falha ao carregar veículos e formas de pagamento.'))
            });
    }
    readonly refreshConfirmation = signal(false);
    refreshBudget(discardChanges = false): void {
        if (!this.editId || this.loading() || this.saving()) return;
        if (this.form.dirty && !discardChanges) {
            this.refreshConfirmation.set(true);
            return;
        }
        this.refreshConfirmation.set(false);
        this.loading.set(true);
        this.error.set('');
        this.success.set('');
        this.form.disable();
        this.service
            .detail(this.editId)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.loading.set(false);
                    this.releaseForm();
                })
            )
            .subscribe({
                next: (budget) => {
                    this.applyBudget(budget);
                    this.form.markAsPristine();
                    this.success.set('Informações do orçamento atualizadas.');
                },
                error: (error: unknown) => this.error.set(this.message(error, 'Não foi possível atualizar o orçamento.'))
            });
    }
    selectVehicle(id: number | null): void {
        if (this.selectedVehicle()?.id === id) return;
        const vehicle = this.vehicles().find((item) => item.id === id) ?? null;
        this.selectedVehicle.set(vehicle);
        this.form.controls.clientCompanyId.setValue(vehicle?.clientCompanyId ?? null);
        this.form.controls.salespersonUserId.setValue(vehicle?.salespersonId ?? null);
        this.clientName.set(vehicle?.clientCompanyName ?? '');
        this.attendantName.set(vehicle?.salespersonName ?? '');
    }
    private payload(): ConciergeBudgetCreate {
        const data = this.form.getRawValue();
        const date = data.dateValidation;
        const dateValidation = date ? date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0') + 'T23:59:59' : null;
        return {
            vehicleId: data.vehicleId!,
            clientCompanyId: data.clientCompanyId,
            salespersonUserId: data.salespersonUserId,
            paymentTypeId: data.paymentTypeId,
            dateValidation,
            information: data.information.trim(),
            items: data.items.map((item) => ({ ...item, description: item.description.trim(), quantity: item.type === 1 ? 1 : item.quantity, hourService: item.type === 1 ? item.hourService : null }))
        };
    }
    private releaseForm(): void {
        this.saving.set(false);
        if (this.readOnly) this.form.disable();
        else {
            this.form.enable();
            if (this.editId) this.form.controls.vehicleId.disable();
        }
    }
    readonly cancelling = signal<ConciergeBudget | null>(null);
    readonly cancellationReason = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(1000)] });
    openCancellation(): void {
        if (!this.editing() || this.readOnly || this.loading() || this.saving()) return;
        this.cancellationReason.reset();
        this.error.set('');
        this.success.set('');
        this.cancelling.set(this.editing());
    }
    closeCancellation(): void {
        if (!this.saving()) this.cancelling.set(null);
    }
    confirmCancellation(): void {
        const budget = this.cancelling();
        this.cancellationReason.markAsTouched();
        if (!budget || this.readOnly || this.saving() || this.cancellationReason.invalid) return;
        this.saving.set(true);
        this.form.disable();
        this.error.set('');
        this.success.set('');
        this.service
            .cancel(budget.id, this.cancellationReason.value.trim())
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.releaseForm())
            )
            .subscribe({
                next: (result) => {
                    this.applyBudget(result);
                    this.form.markAsPristine();
                    this.cancelling.set(null);
                    this.cancellationReason.reset();
                    this.success.set('Orçamento cancelado.');
                },
                error: (error: unknown) => this.error.set(this.message(error, 'Falha ao cancelar o orçamento.'))
            });
    }
    readonly completing = signal(false);
    get canComplete(): boolean {
        return this.editing()?.status === 'Approved' && !this.form.dirty && this.form.valid && !this.loading() && !this.saving() && !this.loadError();
    }
    complete(): void {
        const budget = this.editing();
        if (!budget || this.readOnly || this.loading() || this.saving() || this.loadError()) return;
        this.error.set('');
        this.success.set('');
        if (budget.status !== 'Approved') {
            this.error.set('O orçamento precisa estar aprovado para ser concluído.');
            return;
        }
        if (this.form.dirty) {
            this.error.set('Salve as alterações e solicite uma nova aprovação antes de concluir.');
            return;
        }
        this.form.markAllAsTouched();
        if (this.form.invalid) {
            this.error.set('Revise os campos do orçamento antes de concluir.');
            return;
        }
        if (!window.confirm('Concluir o orçamento aprovado #' + budget.id + '? Ele ficará disponível apenas para consulta.')) return;
        this.completing.set(true);
        this.saving.set(true);
        this.form.disable();
        this.service
            .complete(budget.id)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => {
                    this.completing.set(false);
                    this.releaseForm();
                })
            )
            .subscribe({
                next: (result) => {
                    this.applyBudget(result);
                    this.form.markAsPristine();
                    this.success.set('Orçamento concluído.');
                },
                error: (error: unknown) => this.error.set(this.message(error, 'Falha ao concluir o orçamento.'))
            });
    }
    save(): void {
        if (this.readOnly || this.loading() || this.saving()) return;
        this.success.set('');
        this.error.set('');
        if (this.loadError()) {
            this.error.set('Carregue novamente as entradas de veículos antes de salvar.');
            return;
        }
        this.form.markAllAsTouched();
        this.selectVehicle(this.form.controls.vehicleId.value);
        if (!this.form.controls.vehicleId.value || !this.selectedVehicle()) {
            this.error.set('Selecione uma entrada de veículo antes de salvar o orçamento.');
            return;
        }
        if (this.missingVehicleData) {
            this.error.set('A entrada selecionada está sem cliente. Cadastre o cliente na entrada do veículo antes de salvar.');
            return;
        }
        if (this.form.invalid) {
            const index = this.items.controls.findIndex((item) => item.invalid);
            this.error.set(index >= 0 ? `Revise a linha ${index + 1}: descrição, quantidade, horas, preço e desconto.` : 'Revise os campos do orçamento antes de salvar.');
            return;
        }
        this.saving.set(true);
        this.error.set('');
        this.form.disable();
        const payload = this.payload();
        const wasEditing = this.editId !== null;
        const request = this.editId ? this.service.update(this.editId, payload) : this.service.create(payload);
        request
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.releaseForm())
            )
            .subscribe({
                next: (item) => {
                    if (!item?.id) {
                        this.error.set('O servidor não confirmou o salvamento do orçamento.');
                        return;
                    }
                    this.editId = item.id;
                    this.applyBudget(item);
                    this.form.markAsPristine();
                    this.success.set(wasEditing ? 'Orçamento atualizado com sucesso.' : 'Orçamento gerado com sucesso.');
                    if (!wasEditing) {
                        void this.router.navigate([], { relativeTo: this.route, queryParams: { id: item.id }, queryParamsHandling: 'merge', replaceUrl: true });
                    }
                },
                error: (error: unknown) => this.error.set(this.message(error, 'Não foi possível salvar o orçamento.'))
            });
    }
    private message(error: unknown, fallback: string): string {
        return error instanceof HttpErrorResponse ? error.error?.message || error.error?.emessage || fallback : fallback;
    }
}
