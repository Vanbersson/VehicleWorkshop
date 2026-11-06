import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';

interface PendingReceipt {
    id: number;
    file: File;
    amount: number | null;
}
@Component({
    selector: 'p-attendance-payment',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule],
    templateUrl: './attendance.payment.component.html',
    styleUrl: './attendance.payment.component.scss'
})
export class AttendancePaymentComponent implements OnChanges, OnDestroy {
    @Input() attendance: CustomerAttendance | null = null;
    readonly receipts = signal<AttendanceDocument[]>([]);
    readonly pending = signal<PendingReceipt[]>([]);
    readonly amounts = signal<Record<number, number | null>>({});
    readonly loading = signal(false);
    readonly uploading = signal(false);
    readonly removingId = signal<number | null>(null);
    readonly savingId = signal<number | null>(null);
    readonly downloadingId = signal<number | null>(null);
    readonly error = signal('');
    readonly success = signal('');
    readonly total = computed(() => this.receipts().reduce((sum, item) => sum + Math.round((item.receiptAmount ?? 0) * 100), 0) / 100);
    readonly invalidPending = computed(() => !this.pending().length || this.pending().some((item) => !this.validAmount(item.amount)));
    private request = 0;
    private nextId = 0;
    get remainingAmount(): number | null {
        const quoteTotal = this.attendance?.quoteTotal;
        return quoteTotal == null ? null : Math.max(0, Math.round(quoteTotal * 100) - Math.round(this.total() * 100)) / 100;
    }
    get readOnly() {
        return this.attendance?.status === AttendanceStatus.CANCELLED;
    }
    get busy() {
        return this.loading() || this.uploading() || this.savingId() !== null || this.removingId() !== null;
    }
    constructor(private service: CustomerAttendanceService) {}
    ngOnChanges(changes: SimpleChanges): void {
        const change = changes['attendance'];
        if (change && (change.firstChange || change.previousValue?.id !== change.currentValue?.id || change.previousValue?.status !== change.currentValue?.status)) {
            ++this.request;
            this.uploading.set(false);
            this.removingId.set(null);
            this.savingId.set(null);
            this.downloadingId.set(null);
            void this.load();
        }
    }
    ngOnDestroy(): void {
        ++this.request;
    }
    validAmount(value: number | null | undefined): value is number {
        return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 999999999999.99 && value === Number(value.toFixed(2));
    }
    async load(): Promise<void> {
        if (this.uploading() || this.savingId() !== null || this.removingId() !== null) return;
        const request = ++this.request,
            id = this.attendance?.id;
        this.receipts.set([]);
        this.amounts.set({});
        this.error.set('');
        this.success.set('');
        this.pending.set([]);
        if (!id) {
            this.loading.set(false);
            return;
        }
        this.loading.set(true);
        try {
            const list = await lastValueFrom(this.service.documents(id, 'PAYMENT'));
            if (request !== this.request) return;
            const receipts = list.filter((item) => item.stage === 'PAYMENT');
            this.receipts.set(receipts);
            this.amounts.set(Object.fromEntries(receipts.map((item) => [item.id, item.receiptAmount ?? null])));
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error));
        } finally {
            if (request === this.request) this.loading.set(false);
        }
    }
    selectFiles(event: Event): void {
        const input = event.target as HTMLInputElement,
            files = Array.from(input.files ?? []);
        input.value = '';
        if (this.readOnly || this.busy || !files.length) return;
        this.error.set('');
        this.success.set('');
        const allowed: Record<string, string[]> = { pdf: ['application/pdf'], jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'] };
        for (const file of files) {
            const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!file.size || file.size > 5 * 1024 * 1024 || !allowed[extension] || (file.type && !allowed[extension].includes(file.type))) {
                this.error.set('Arquivo inválido: ' + file.name + '. Envie PDF, JPG, PNG ou WebP de até 5 MB.');
                return;
            }
        }
        this.pending.update((list) => [...list, ...files.map((file) => ({ id: ++this.nextId, file, amount: null }))]);
    }
    setPendingAmount(id: number, amount: number | null): void {
        if (!this.busy && !this.readOnly) this.pending.update((list) => list.map((item) => (item.id === id ? { ...item, amount } : item)));
    }
    removePending(id: number): void {
        if (!this.busy) this.pending.update((list) => list.filter((item) => item.id !== id));
    }
    setAmount(id: number, amount: number | null): void {
        if (!this.busy && !this.readOnly) this.amounts.update((values) => ({ ...values, [id]: amount }));
    }
    private storeReceipt(item: AttendanceDocument): void {
        this.receipts.update((list) => [item, ...list.filter((entry) => entry.id !== item.id)]);
        this.amounts.update((values) => ({ ...values, [item.id]: item.receiptAmount ?? null }));
    }
    async upload(): Promise<void> {
        const id = this.attendance?.id;
        if (!id || this.readOnly || this.busy || this.invalidPending()) return;
        const request = this.request,
            files = this.pending();
        let count = 0;
        this.uploading.set(true);
        this.error.set('');
        this.success.set('');
        try {
            for (const entry of files) {
                if (request !== this.request || this.readOnly) return;
                const result = await lastValueFrom(this.service.uploadPaymentReceipt(id, entry.file, entry.amount!));
                if (request !== this.request) return;
                this.storeReceipt(result);
                this.pending.update((list) => list.filter((item) => item.id !== entry.id));
                count++;
            }
            this.success.set(count + ' comprovante(s) salvo(s).');
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error) + (count ? ' ' + count + ' comprovante(s) já foram salvos; envie apenas os restantes.' : ''));
        } finally {
            if (request === this.request) this.uploading.set(false);
        }
    }
    async saveAmount(item: AttendanceDocument): Promise<void> {
        const id = this.attendance?.id,
            amount = this.amounts()[item.id];
        if (!id || this.readOnly || this.busy || !this.validAmount(amount)) return;
        const request = this.request;
        this.savingId.set(item.id);
        this.error.set('');
        this.success.set('');
        try {
            const result = await lastValueFrom(this.service.updatePaymentReceiptValue(id, item.id, amount));
            if (request === this.request) {
                this.storeReceipt(result);
                this.success.set('Valor do comprovante atualizado.');
            }
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error));
        } finally {
            if (request === this.request) this.savingId.set(null);
        }
    }
    async remove(item: AttendanceDocument): Promise<void> {
        const id = this.attendance?.id;
        if (!id || this.readOnly || this.busy || item.stage !== 'PAYMENT') return;
        const request = this.request;
        this.removingId.set(item.id);
        this.error.set('');
        this.success.set('');
        try {
            await lastValueFrom(this.service.removePaymentReceipt(id, item.id));
            if (request !== this.request) return;
            this.receipts.update((list) => list.filter((entry) => entry.id !== item.id));
            this.amounts.update((values) => {
                const updated = { ...values };
                delete updated[item.id];
                return updated;
            });
            this.success.set('Comprovante removido.');
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error));
        } finally {
            if (request === this.request) this.removingId.set(null);
        }
    }
    async download(item: AttendanceDocument): Promise<void> {
        if (!this.attendance?.id || this.downloadingId() !== null) return;
        const request = this.request;
        this.downloadingId.set(item.id);
        this.error.set('');
        try {
            const blob = await lastValueFrom(this.service.downloadDocument(this.attendance.id, item.id));
            if (request !== this.request) return;
            const url = URL.createObjectURL(blob),
                anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = item.fileName;
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error));
        } finally {
            if (request === this.request) this.downloadingId.set(null);
        }
    }
    private message(error: unknown): string {
        return error instanceof HttpErrorResponse ? error.error?.emessage || error.error?.message || 'Não foi possível salvar o comprovante. Tente novamente.' : error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.';
    }
}
