import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AttendanceLogsComponent } from './attendance.logs.component';
import { AttendanceLog } from '@/app/models/crm/attendance.log';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
describe('AttendanceLogsComponent', () => {
    let component: AttendanceLogsComponent;
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    const entry: AttendanceLog = { id: 1, stage: 'COMMERCIAL_PROPOSAL', action: 'DOCUMENT_REMOVED', userId: 9, userName: 'Operador', occurredAt: '2026-11-06T12:00:00Z', documentId: 8, fileName: 'proposta.pdf' };
    beforeEach(() => {
        service = jasmine.createSpyObj('CustomerAttendanceService', ['logs']);
        TestBed.configureTestingModule({ providers: [AttendanceLogsComponent, { provide: CustomerAttendanceService, useValue: service }] });
        component = TestBed.inject(AttendanceLogsComponent);
        component.attendanceId = 42;
    });
    it('opens the dialog and loads the selected attendance history', async () => {
        service.logs.and.returnValue(of([entry]));
        await component.open();
        expect(component.visible).toBeTrue();
        expect(service.logs).toHaveBeenCalledWith(42);
        expect(component.entries()).toEqual([entry]);
        expect(component.actionLabel(entry.action)).toBe('Documento removido');
        expect(component.stageLabel(entry.stage)).toBe('Proposta');
    });
    it('clears old entries on failure and permits retry', async () => {
        service.logs.and.returnValue(of([entry]));
        await component.open();
        service.logs.and.returnValue(throwError(() => new Error('Offline')));
        await component.open();
        expect(component.entries()).toEqual([]);
        expect(component.error()).toBeTruthy();
        expect(component.loading()).toBeFalse();
        service.logs.and.returnValue(of([]));
        await component.open();
        expect(component.error()).toBe('');
    });
    it('ignores responses received after the dialog closes', async () => {
        const response = new Subject<AttendanceLog[]>();
        service.logs.and.returnValue(response);
        const pending = component.open();
        component.close();
        response.next([entry]);
        response.complete();
        await pending;
        expect(component.visible).toBeFalse();
        expect(component.entries()).toEqual([]);
    });
    it('labels signed proposal uploads and approvals', () => {
        expect(component.actionLabel('SIGNED_DOCUMENT_UPLOADED')).toBe('Cliente enviou a proposta assinada');
        expect(component.actionLabel('PROPOSAL_APPROVED')).toBe('Cliente aprovou a proposta assinada');
    });
    it('labels order signatures and approvals in the order stage', () => {
        expect(component.actionLabel('SIGNED_ORDER_UPLOADED')).toBe('Cliente enviou o pedido assinado');
        expect(component.actionLabel('ORDER_APPROVED')).toBe('Cliente aprovou o pedido assinado');
        expect(component.stageLabel('QUOTATION')).toBe('Pedido');
    });
    it('labels payment amount changes', () => {
        expect(component.actionLabel('RECEIPT_AMOUNT_CHANGED')).toBe('Valor do comprovante alterado');
        expect(component.stageLabel('PAYMENT_PENDING')).toBe('Pagamento');
    });
});
