import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AttendanceLog } from '@/app/models/crm/attendance.log';
import { ATTENDANCE_STAGES } from '@/app/models/crm/customer.attendance';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
@Component({
    selector: 'p-attendance-logs',
    standalone: true,
    imports: [CommonModule, ButtonModule, DialogModule],
    templateUrl: './attendance.logs.component.html',
    styleUrl: './attendance.logs.component.scss'
})
export class AttendanceLogsComponent implements OnDestroy {
    @Input({ required: true }) attendanceId!: number;
    visible = false;
    readonly entries = signal<AttendanceLog[]>([]);
    readonly loading = signal(false);
    readonly error = signal('');
    private request = 0;
    constructor(private service: CustomerAttendanceService) {}
    async open(): Promise<void> {
        if (!this.attendanceId) return;
        const request = ++this.request;
        this.visible = true;
        this.loading.set(true);
        this.error.set('');
        this.entries.set([]);
        try {
            const entries = await lastValueFrom(this.service.logs(this.attendanceId));
            if (request === this.request) this.entries.set(entries);
        } catch (error) {
            if (request === this.request) this.error.set(error instanceof HttpErrorResponse ? error.error?.emessage || error.error?.message || 'Não foi possível carregar o histórico.' : 'Não foi possível carregar o histórico.');
        } finally {
            if (request === this.request) this.loading.set(false);
        }
    }
    close(): void {
        this.visible = false;
        ++this.request;
        this.loading.set(false);
    }
    ngOnDestroy(): void {
        ++this.request;
    }
    actionLabel(action: string): string {
        return (
            (
                {
                    DOCUMENT_ADDED: 'Documento adicionado',
                    DOCUMENT_REMOVED: 'Documento removido',
                    SIGNED_DOCUMENT_UPLOADED: 'Cliente enviou a proposta assinada',
                    PROPOSAL_APPROVED: 'Cliente aprovou a proposta assinada',
                    SIGNED_ORDER_UPLOADED: 'Cliente enviou o pedido assinado',
                    ORDER_APPROVED: 'Cliente aprovou o pedido assinado',
                    INVOICE_AMOUNT_CHANGED: 'Valor da nota alterado',
                    RECEIPT_AMOUNT_CHANGED: 'Valor do comprovante alterado'
                } as Record<string, string>
            )[action] ?? action
        );
    }
    stageLabel(stage: string): string {
        return ATTENDANCE_STAGES.find((item) => item.value === stage)?.label ?? stage;
    }
}
