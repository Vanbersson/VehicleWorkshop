import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { lastValueFrom } from 'rxjs';
import { ConciergeBudgetDocument } from '@/app/models/concierge.budget.document';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
@Component({ selector: 'p-concierge-budget-documents', standalone: true, imports: [CommonModule, ButtonModule], templateUrl: './concierge.budget.documents.component.html', styleUrl: './concierge.budget.documents.component.scss' })
export class ConciergeBudgetDocumentsComponent implements OnChanges, OnDestroy {
    @Input() budgetId: number | null = null;
    @Output() documentChanged = new EventEmitter<void>();
    @Input() revision: unknown;
    @Input() readOnly = false;
    @Input() disabled = false;
    readonly documents = signal<ConciergeBudgetDocument[]>([]);
    readonly loading = signal(false);
    readonly uploading = signal(false);
    readonly removing = signal(false);
    readonly downloading = signal(false);
    readonly sharing = signal(false);
    readonly shareUrl = signal('');
    readonly shareExpiresAt = signal('');
    async share(): Promise<void> {
        const id = this.budgetId;
        if (!id || this.readOnly || this.busy || !this.documents().length) return;
        const request = this.request;
        this.sharing.set(true);
        this.error.set('');
        this.shareUrl.set('');
        this.shareExpiresAt.set('');
        this.success.set('');
        try {
            const result = await lastValueFrom(this.service.share(id));
            if (request === this.request) {
                this.shareUrl.set(new URL(result.path, window.location.origin).href);
                this.shareExpiresAt.set(result.expiresAt);
            }
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao gerar o link de aprovação.'));
        } finally {
            this.sharing.set(false);
        }
    }
    async copyLink(): Promise<void> {
        if (!this.shareUrl()) return;
        try {
            await navigator.clipboard.writeText(this.shareUrl());
            this.success.set('Link copiado.');
        } catch {
            this.error.set('Selecione e copie o link abaixo.');
        }
    }
    readonly error = signal('');
    readonly success = signal('');
    private request = 0;
    get busy(): boolean {
        return this.disabled || this.loading() || this.uploading() || this.removing() || this.sharing();
    }
    constructor(private service: ConciergeBudgetService) {}
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['budgetId'] || changes['revision']) {
            this.uploading.set(false);
            this.removing.set(false);
            void this.load();
        }
    }
    ngOnDestroy(): void {
        ++this.request;
    }
    async load(): Promise<void> {
        const request = ++this.request,
            id = this.budgetId;
        this.documents.set([]);
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
            const items = await lastValueFrom(this.service.documents(id));
            if (request === this.request) this.documents.set(items);
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao carregar o documento.'));
        } finally {
            if (request === this.request) this.loading.set(false);
        }
    }
    async selectFile(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (file) await this.upload(file);
    }
    async upload(file: File): Promise<void> {
        const id = this.budgetId;
        if (!id || this.readOnly || this.busy || this.documents().length) return;
        this.error.set('');
        this.success.set('');
        if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf') || !file.size || file.size > 5 * 1024 * 1024) {
            this.error.set('Envie apenas PDF de até 5 MB.');
            return;
        }
        const request = this.request;
        this.uploading.set(true);
        try {
            const item = await lastValueFrom(this.service.uploadDocument(id, file));
            if (request === this.request) {
                this.documents.set([item]);
                this.success.set('Documento anexado ao orçamento.');
                this.documentChanged.emit();
            }
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao enviar o PDF.'));
        } finally {
            if (request === this.request) this.uploading.set(false);
        }
    }
    async remove(item: ConciergeBudgetDocument): Promise<void> {
        const id = this.budgetId;
        if (!id || this.readOnly || this.busy || !window.confirm('Remover o documento ' + item.fileName + ' do orçamento?')) return;
        const request = this.request;
        this.error.set('');
        this.success.set('');
        this.removing.set(true);
        try {
            await lastValueFrom(this.service.removeDocument(id, item.id));
            if (request === this.request) {
                this.documents.set([]);
                this.shareUrl.set('');
                this.shareExpiresAt.set('');
                this.success.set('Documento removido.');
                this.documentChanged.emit();
            }
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao remover o documento.'));
        } finally {
            if (request === this.request) this.removing.set(false);
        }
    }
    async download(item: ConciergeBudgetDocument): Promise<void> {
        const id = this.budgetId;
        if (!id || this.downloading()) return;
        const request = this.request;
        this.downloading.set(true);
        this.error.set('');
        try {
            const blob = await lastValueFrom(this.service.downloadDocument(id, item.id));
            if (request !== this.request) return;
            const url = URL.createObjectURL(blob),
                link = document.createElement('a');
            link.href = url;
            link.download = item.fileName;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            if (request === this.request) this.error.set(this.message(error, 'Falha ao baixar o documento.'));
        } finally {
            this.downloading.set(false);
        }
    }
    private message(error: unknown, fallback: string): string {
        if (!(error instanceof HttpErrorResponse)) return fallback;
        const body: unknown = error.error;
        if (body && typeof body === 'object') {
            const details = body as Record<string, unknown>;
            for (const key of ['message', 'emessage', 'detail', 'reason']) {
                const value = details[key];
                if (typeof value === 'string' && value.trim()) return value;
            }
        }
        switch (error.status) {
            case 0:
                return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
            case 401:
                return 'Sua sessão expirou. Entre novamente para continuar.';
            case 403:
                return 'Acesso negado pela API. Entre novamente e, se persistir, solicite a verificação do acesso à empresa/revenda do usuário.';
            default:
                return `${fallback} (HTTP ${error.status})`;
        }
    }
}
