import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, computed, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AttendanceDocument, AttendanceDocumentStage } from '@/app/models/crm/attendance.document';
import { AttendanceStatus, CustomerAttendance, isAttendanceReadOnly } from '@/app/models/crm/customer.attendance';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';

@Component({
    selector: 'p-attendance-documents',
    standalone: true,
    imports: [CommonModule, ButtonModule, FormsModule, InputNumberModule],
    templateUrl: './attendance.documents.component.html',
    styleUrl: './attendance.documents.component.scss'
})
export class AttendanceDocumentsComponent implements OnChanges, OnDestroy {
    @Input() attendance: CustomerAttendance | null = null;
    @Input({ required: true }) stage: Exclude<AttendanceDocumentStage, 'PAYMENT'> = 'DOCUMENTS';
    readonly documents = signal<AttendanceDocument[]>([]);
    readonly loading = signal(false);
    readonly uploading = signal(false);
    readonly sharingId = signal<number | null>(null);
    readonly shareUrl = signal('');
    readonly shareExpiresAt = signal('');
    readonly whatsappUrl = computed(() => 'https://wa.me/?text=' + encodeURIComponent('Olá! Segue o documento ' + (this.stage === 'PROPOSAL' ? 'da sua proposta' : 'do seu pedido') + ' para download e aprovação: ' + this.shareUrl()));
    readonly localShare = computed(() => {
        const url = this.shareUrl();
        return !!url && ['localhost', '127.0.0.1'].includes(new URL(url).hostname);
    });
    readonly removingId = signal<number | null>(null);
    readonly downloadingId = signal<number | null>(null);
    readonly error = signal('');
    readonly success = signal('');
    readonly maxSize = 5 * 1024 * 1024;
    readonly amounts = signal<Record<number, number | null>>({});
    readonly savingAmountId = signal<number | null>(null);
    get busy(): boolean {
        return this.loading() || this.uploading() || this.removingId() !== null || this.savingAmountId() !== null;
    }
    validAmount(value: number | null | undefined): value is number {
        return typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 999999999999.99 && value === Number(value.toFixed(2));
    }
    setAmount(id: number, value: number | null): void {
        if (!this.readOnly && !this.busy) this.amounts.update((values) => ({ ...values, [id]: value }));
    }
    async saveAmount(item: AttendanceDocument): Promise<void> {
        const id = this.attendance?.id;
        const amount = this.amounts()[item.id];
        if (!id || this.stage !== 'INVOICING' || item.stage !== 'INVOICING' || this.readOnly || this.busy || !this.validAmount(amount)) return;
        const request = this.request;
        this.savingAmountId.set(item.id);
        this.error.set('');
        this.success.set('');
        try {
            const result = await lastValueFrom(this.service.updateInvoicingDocumentValue(id, item.id, amount));
            if (request !== this.request) return;
            this.documents.update((items) => items.map((entry) => (entry.id === item.id ? result : entry)));
            this.amounts.update((values) => ({ ...values, [item.id]: result.receiptAmount ?? null }));
            this.success.set('Valor da nota salvo.');
        } catch (error: unknown) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao salvar o valor da nota.'));
        } finally {
            this.savingAmountId.set(null);
        }
    }
    private request = 0;
    get readOnly(): boolean {
        return isAttendanceReadOnly(this.attendance?.status);
    }
    constructor(private service: CustomerAttendanceService) {}

    ngOnChanges(changes: SimpleChanges): void {
        const attendance = changes['attendance'];
        const stage = changes['stage'];
        if (stage || (attendance && (attendance.firstChange || attendance.previousValue?.id !== attendance.currentValue?.id || attendance.previousValue?.status !== attendance.currentValue?.status))) {
            void this.load();
        }
    }
    ngOnDestroy(): void {
        ++this.request;
    }

    async load(): Promise<void> {
        const request = ++this.request;
        const id = this.attendance?.id;
        this.documents.set([]);
        this.amounts.set({});
        this.shareUrl.set('');
        this.shareExpiresAt.set('');
        this.error.set('');
        this.success.set('');
        if (!id) {
            this.loading.set(false);
            return;
        }
        this.loading.set(true);
        try {
            const documents = await lastValueFrom(this.service.documents(id, this.stage));
            if (request === this.request) {
                const filtered = documents.filter((document) => (document.stage ?? 'DOCUMENTS') === this.stage);
                this.documents.set(filtered);
                this.amounts.set(Object.fromEntries(filtered.map((item) => [item.id, item.receiptAmount ?? null])));
            }
        } catch (error: unknown) {
            if (request === this.request) this.error.set(this.message(error, 'Não foi possível carregar os documentos.'));
        } finally {
            if (request === this.request) this.loading.set(false);
        }
    }

    async selectFiles(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files ?? []);
        input.value = '';
        await this.upload(files);
    }

    async upload(files: File[]): Promise<void> {
        const id = this.attendance?.id;
        if (!id || this.readOnly || this.busy || !files.length) return;
        this.error.set('');
        this.success.set('');
        if (this.stage !== 'INVOICING' && (files.length > 1 || this.documents().length > 0)) {
            this.error.set((this.stage === 'DELIVERY' ? 'A entrega' : this.stage === 'PROPOSAL' ? 'A proposta' : 'O pedido') + ' permite apenas um documento. Remova o arquivo atual antes de adicionar outro.');
            return;
        }
        const extensions: Record<string, string[]> = { pdf: ['application/pdf'], jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'] };
        for (const file of files) {
            const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (this.stage !== 'DELIVERY' && (extension !== 'pdf' || (file.type && file.type !== 'application/pdf'))) {
                this.error.set((this.stage === 'INVOICING' ? 'O faturamento' : this.stage === 'PROPOSAL' ? 'A proposta' : 'O pedido') + ' aceita apenas um arquivo PDF de até 5 MB.');
                return;
            }
            if (!file.size || file.size > this.maxSize || !extensions[extension] || (file.type && !extensions[extension].includes(file.type))) {
                this.error.set(`Arquivo inválido: ${file.name}. Envie um PDF ou imagem JPG, PNG ou WebP de até 5 MB.`);
                return;
            }
        }
        const request = this.request;
        const stage = this.stage;
        this.uploading.set(true);
        let count = 0;
        try {
            for (const file of files) {
                if (request !== this.request || this.readOnly) return;
                const saved = await lastValueFrom(this.service.uploadDocument(id, file, stage));
                if (request !== this.request) return;
                this.documents.update((documents) => [saved, ...documents]);
                count++;
            }
            this.success.set(count === 1 ? 'Documento salvo no atendimento.' : `${count} documentos salvos no atendimento.`);
        } catch (error: unknown) {
            if (request === this.request) this.error.set(this.message(error, 'Não foi possível enviar o documento. Tente novamente.') + (count ? ` ${count} arquivo(s) já foram salvos.` : ''));
        } finally {
            this.uploading.set(false);
        }
    }

    async share(item: AttendanceDocument): Promise<void> {
        const id = this.attendance?.id;
        if (!id || (this.stage !== 'PROPOSAL' && this.stage !== 'DOCUMENTS') || this.readOnly || (item.stage ?? 'DOCUMENTS') !== this.stage || this.sharingId() !== null || this.removingId() !== null) return;
        const request = this.request;
        this.sharingId.set(item.id);
        this.error.set('');
        this.shareUrl.set('');
        try {
            const result = await lastValueFrom(this.stage === 'PROPOSAL' ? this.service.shareProposalDocument(id, item.id) : this.service.shareOrderDocument(id, item.id));
            if (request !== this.request) return;
            this.shareUrl.set(window.location.origin + result.path);
            this.shareExpiresAt.set(result.expiresAt);
        } catch (error: unknown) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao gerar o link. Tente novamente.'));
        } finally {
            this.sharingId.set(null);
        }
    }

    async copyShareLink(): Promise<void> {
        if (!this.shareUrl()) return;
        try {
            await navigator.clipboard.writeText(this.shareUrl());
            this.success.set('Link copiado.');
        } catch {
            this.error.set('Selecione e copie o link abaixo.');
        }
    }

    async remove(item: AttendanceDocument): Promise<void> {
        const id = this.attendance?.id;
        if (!id || this.readOnly || (item.stage ?? 'DOCUMENTS') !== this.stage || this.busy) return;
        const confirmation =
            this.stage === 'DELIVERY'
                ? `Remover o documento do motorista "${item.fileName}"?`
                : this.stage === 'INVOICING'
                  ? `Remover o documento fiscal "${item.fileName}" do faturamento?`
                  : this.stage === 'DOCUMENTS'
                    ? `Remover o documento "${item.fileName}" do pedido${item.signedFileName ? ` e o pedido assinado "${item.signedFileName}"` : ''}? O link compartilhado e a aprovação vinculada serão removidos.`
                    : item.signedFileName
                      ? `Remover o documento "${item.fileName}" e a proposta assinada "${item.signedFileName}"? Os dois arquivos e a aprovação vinculada serão excluídos.`
                      : `Remover o documento "${item.fileName}" da proposta?`;
        if (!window.confirm(confirmation)) return;
        const request = this.request;
        this.removingId.set(item.id);
        this.error.set('');
        this.success.set('');
        try {
            await lastValueFrom(
                this.stage === 'DELIVERY'
                    ? this.service.removeDeliveryDocument(id, item.id)
                    : this.stage === 'INVOICING'
                      ? this.service.removeInvoicingDocument(id, item.id)
                      : this.stage === 'PROPOSAL'
                        ? this.service.removeProposalDocument(id, item.id)
                        : this.service.removeOrderDocument(id, item.id)
            );
            if (request !== this.request) return;
            this.documents.update((documents) => documents.filter((document) => document.id !== item.id));
            this.shareUrl.set('');
            this.success.set(
                this.stage === 'DELIVERY'
                    ? 'Documento do motorista removido.'
                    : this.stage === 'INVOICING'
                      ? 'Documento fiscal removido do faturamento.'
                      : this.stage === 'DOCUMENTS'
                        ? 'Documento removido do pedido.'
                        : item.signedFileName
                          ? 'Documento da proposta e arquivo assinado removidos.'
                          : 'Documento removido da proposta.'
            );
        } catch (error: unknown) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao remover o documento. Tente novamente.'));
        } finally {
            this.removingId.set(null);
        }
    }

    async download(item: AttendanceDocument, signed = false): Promise<void> {
        if (!this.attendance?.id || this.downloadingId() !== null) return;
        this.downloadingId.set(item.id);
        this.error.set('');
        try {
            const blob = await lastValueFrom(
                signed ? (this.stage === 'PROPOSAL' ? this.service.downloadSignedProposal(this.attendance.id, item.id) : this.service.downloadSignedOrder(this.attendance.id, item.id)) : this.service.downloadDocument(this.attendance.id, item.id)
            );
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = signed ? (item.signedFileName ?? item.fileName) : item.fileName;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error: unknown) {
            this.error.set(this.message(error, 'Não foi possível baixar o documento.'));
        } finally {
            this.downloadingId.set(null);
        }
    }

    private message(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
}
