import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';

@Component({
    selector: 'p-attendance-documents',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './attendance.documents.component.html',
    styleUrl: './attendance.documents.component.scss'
})
export class AttendanceDocumentsComponent implements OnChanges, OnDestroy {
    @Input() attendance: CustomerAttendance | null = null;
    readonly documents = signal<AttendanceDocument[]>([]);
    readonly loading = signal(false);
    readonly uploading = signal(false);
    readonly downloadingId = signal<number | null>(null);
    readonly error = signal('');
    readonly success = signal('');
    readonly maxSize = 5 * 1024 * 1024;
    private request = 0;
    get readOnly(): boolean {
        return this.attendance?.status === AttendanceStatus.CANCELLED;
    }
    constructor(private service: CustomerAttendanceService) {}

    ngOnChanges(): void {
        void this.load();
    }
    ngOnDestroy(): void {
        ++this.request;
    }

    async load(): Promise<void> {
        const request = ++this.request;
        const id = this.attendance?.id;
        this.documents.set([]);
        this.error.set('');
        this.success.set('');
        if (!id) {
            this.loading.set(false);
            return;
        }
        this.loading.set(true);
        try {
            const documents = await lastValueFrom(this.service.documents(id));
            if (request === this.request) this.documents.set(documents);
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
        if (!id || this.readOnly || this.uploading() || this.loading() || !files.length) return;
        this.error.set('');
        this.success.set('');
        const extensions: Record<string, string[]> = { pdf: ['application/pdf'], jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'], webp: ['image/webp'] };
        for (const file of files) {
            const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
            if (!file.size || file.size > this.maxSize || !extensions[extension] || (file.type && !extensions[extension].includes(file.type))) {
                this.error.set(`Arquivo inválido: ${file.name}. Envie PDF, JPG, PNG ou WebP, com até 5 MB por arquivo.`);
                return;
            }
        }
        const request = this.request;
        this.uploading.set(true);
        let count = 0;
        try {
            for (const file of files) {
                if (request !== this.request || this.readOnly) return;
                const saved = await lastValueFrom(this.service.uploadDocument(id, file));
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

    async download(item: AttendanceDocument): Promise<void> {
        if (!this.attendance?.id || this.downloadingId() !== null) return;
        this.downloadingId.set(item.id);
        this.error.set('');
        try {
            const blob = await lastValueFrom(this.service.downloadDocument(this.attendance.id, item.id));
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = item.fileName;
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
