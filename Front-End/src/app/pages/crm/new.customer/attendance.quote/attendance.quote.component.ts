import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AttendanceStatus, CustomerAttendance, isAttendanceReadOnly } from '@/app/models/crm/customer.attendance';
import { AttendanceQuoteItem, calculateQuoteItem, QuoteAmounts, QuoteDiscountType } from '@/app/models/crm/attendance.quote';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';

function itemForm(item?: AttendanceQuoteItem) {
    return new FormGroup({
        productName: new FormControl(item?.productName ?? '', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
        quantity: new FormControl(item?.quantity ?? 1, { nonNullable: true, validators: [Validators.required, Validators.min(0.001)] }),
        unitPrice: new FormControl(item?.unitPrice ?? 0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
        discountType: new FormControl<QuoteDiscountType>(item?.discountType ?? 'PERCENTAGE', { nonNullable: true }),
        discountValue: new FormControl(item?.discountValue ?? 0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] })
    });
}

@Component({
    selector: 'p-attendance-quote',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule, SelectModule, TextareaModule, ProgressSpinnerModule],
    templateUrl: './attendance.quote.component.html',
    styleUrl: './attendance.quote.component.scss'
})
export class AttendanceQuoteComponent implements OnChanges {
    @Input() attendance: CustomerAttendance | null = null;
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() saved = new EventEmitter<CustomerAttendance>();
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    readonly saveError = signal('');
    readonly submitted = signal(false);
    readonly cancelled = signal(false);
    readonly quoteId = signal<number | null>(null);
    private quoteVersion: number | null = null;
    private currentAttendance: CustomerAttendance | null = null;
    private request = 0;
    readonly discountOptions = [
        { label: '%', value: 'PERCENTAGE' },
        { label: 'R$', value: 'FIXED' }
    ];
    readonly form = new FormGroup({ items: new FormArray<ReturnType<typeof itemForm>>([]), notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(2000)] }) });
    get items() {
        return this.form.controls.items;
    }

    ngOnChanges(): void {
        if (this.visible && this.attendance) void this.load();
    }

    async load(): Promise<void> {
        if (!this.attendance || this.saving()) return;
        const request = ++this.request;
        const id = this.attendance.id;
        this.loading.set(true);
        this.loadError.set('');
        this.saveError.set('');
        this.submitted.set(false);
        this.currentAttendance = null;
        this.cancelled.set(isAttendanceReadOnly(this.attendance.status));
        this.quoteId.set(null);
        this.quoteVersion = null;
        this.items.clear();
        try {
            const response = await lastValueFrom(this.service.getQuote(id));
            if (request !== this.request || !this.visible) return;
            if (response?.attendance?.id !== id) throw new Error('O servidor não retornou o atendimento solicitado.');
            this.currentAttendance = response.attendance;
            this.cancelled.set(isAttendanceReadOnly(response.attendance.status));
            this.quoteId.set(response.quote?.id ?? null);
            this.quoteVersion = response.quote?.version ?? null;
            this.form.controls.notes.setValue(response.quote?.notes ?? '');
            for (const item of response.quote?.items ?? []) this.items.push(itemForm(item));
            if (!this.items.length) this.items.push(itemForm());
            if (this.cancelled()) this.form.disable({ emitEvent: false });
            else this.form.enable({ emitEvent: false });
            this.form.markAsPristine();
        } catch (error: unknown) {
            if (request === this.request) this.loadError.set(this.message(error, 'Não foi possível carregar o orçamento.'));
        } finally {
            if (request === this.request) this.loading.set(false);
        }
    }

    constructor(private service: CustomerAttendanceService) {}

    addItem(): void {
        if (!this.saving() && !this.cancelled() && this.items.length < 100) this.items.push(itemForm());
    }
    removeItem(index: number): void {
        if (!this.saving() && !this.cancelled()) {
            this.items.removeAt(index);
            this.form.markAsDirty();
        }
    }
    amounts(index: number): QuoteAmounts | null {
        try {
            return calculateQuoteItem(this.items.at(index).getRawValue());
        } catch {
            return null;
        }
    }
    itemError(index: number): string {
        try {
            calculateQuoteItem(this.items.at(index).getRawValue());
            return '';
        } catch (error) {
            return this.message(error, 'Revise os valores deste item.');
        }
    }
    totals(): QuoteAmounts | null {
        const totals = { subtotal: 0, discountAmount: 0, total: 0 };
        for (let index = 0; index < this.items.length; index++) {
            const amounts = this.amounts(index);
            if (!amounts) return null;
            totals.subtotal += Math.round(amounts.subtotal * 100);
            totals.discountAmount += Math.round(amounts.discountAmount * 100);
            totals.total += Math.round(amounts.total * 100);
        }
        if (![totals.subtotal, totals.discountAmount, totals.total].every(Number.isSafeInteger)) return null;
        return { subtotal: totals.subtotal / 100, discountAmount: totals.discountAmount / 100, total: totals.total / 100 };
    }

    async save(): Promise<void> {
        if (!this.currentAttendance || this.loading() || this.saving() || this.loadError() || this.cancelled()) return;
        this.submitted.set(true);
        this.saveError.set('');
        this.form.markAllAsTouched();
        if (!this.items.length) {
            this.saveError.set('Adicione pelo menos um produto.');
            return;
        }
        if (this.form.invalid || this.items.getRawValue().some((item) => !item.productName.trim()) || !this.totals()) {
            this.saveError.set('Revise o produto, a quantidade, o preço e o desconto de cada item.');
            return;
        }
        this.saving.set(true);
        try {
            const response = await lastValueFrom(
                this.service.saveQuote({
                    attendanceId: this.currentAttendance.id,
                    attendanceVersion: this.currentAttendance.version,
                    version: this.quoteVersion,
                    notes: this.form.controls.notes.value.trim(),
                    items: this.items.getRawValue().map((item) => ({ ...item, productName: item.productName.trim() }))
                })
            );
            if (!response.quote?.id || response.attendance.id !== this.currentAttendance.id) throw new Error('O servidor não confirmou o orçamento.');
            this.saved.emit(response.attendance);
            this.visible = false;
            this.visibleChange.emit(false);
        } catch (error: unknown) {
            this.saveError.set(this.message(error, 'Não foi possível salvar o orçamento. Seus dados foram mantidos.'));
        } finally {
            this.saving.set(false);
        }
    }

    close(value: boolean): void {
        if (this.saving()) return;
        this.visible = value;
        if (!value) this.request++;
        this.visibleChange.emit(value);
    }
    private message(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
}
