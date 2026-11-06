import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AttendancePaymentComponent } from './attendance.payment.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';
describe('AttendancePaymentComponent', () => {
    let component: AttendancePaymentComponent;
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    const attendance: CustomerAttendance = {
        id: 42,
        visitId: null,
        clientId: 1,
        clientName: 'Cliente',
        salespersonId: 2,
        salespersonName: 'Vendedor',
        dateCreated: '',
        dateVisit: null,
        status: AttendanceStatus.PAYMENT_PENDING,
        notes: '',
        version: 0
    };
    const receipt: AttendanceDocument = { id: 1, fileName: 'recibo.pdf', contentType: 'application/pdf', size: 10, createdAt: '', stage: 'PAYMENT', receiptAmount: 20 };
    function select() {
        component.selectFiles({ target: { files: [new File(['pdf'], 'recibo.pdf', { type: 'application/pdf' }), new File(['png'], 'foto.png', { type: 'image/png' })], value: '' } } as unknown as Event);
    }
    beforeEach(() => {
        service = jasmine.createSpyObj('CustomerAttendanceService', ['removePaymentReceipt', 'documents', 'uploadPaymentReceipt', 'updatePaymentReceiptValue', 'downloadDocument']);
        service.documents.and.returnValue(of([receipt]));
        TestBed.configureTestingModule({ providers: [AttendancePaymentComponent, { provide: CustomerAttendanceService, useValue: service }] });
        component = TestBed.inject(AttendancePaymentComponent);
        component.attendance = { ...attendance };
    });
    it('loads only payment receipts and their total', async () => {
        await component.load();
        expect(service.documents).toHaveBeenCalledWith(42, 'PAYMENT');
        expect(component.total()).toBe(20);
    });
    it('requires a positive value per file', async () => {
        select();
        expect(component.pending().length).toBe(2);
        expect(component.invalidPending()).toBeTrue();
        await component.upload();
        expect(service.uploadPaymentReceipt).not.toHaveBeenCalled();
        expect(component.validAmount(1.234)).toBeFalse();
        expect(component.validAmount(0)).toBeFalse();
    });
    it('retries only remaining files after partial failure', async () => {
        select();
        component.pending().forEach((entry) => component.setPendingAmount(entry.id, 20));
        service.uploadPaymentReceipt.and.returnValues(
            of(receipt),
            throwError(() => new Error('Offline'))
        );
        await component.upload();
        expect(component.receipts().length).toBe(1);
        expect(component.pending().length).toBe(1);
        expect(component.error()).toContain('Offline');
        service.uploadPaymentReceipt.and.returnValue(of({ ...receipt, id: 2, fileName: 'foto.png', contentType: 'image/png' }));
        await component.upload();
        expect(service.uploadPaymentReceipt.calls.count()).toBe(3);
        expect(service.uploadPaymentReceipt.calls.mostRecent().args[1].name).toBe('foto.png');
        expect(component.pending()).toEqual([]);
        expect(component.total()).toBe(40);
    });
    it('saves an edited value and updates the total', async () => {
        await component.load();
        component.setAmount(1, 35.5);
        service.updatePaymentReceiptValue.and.returnValue(of({ ...receipt, receiptAmount: 35.5 }));
        await component.saveAmount(receipt);
        expect(service.updatePaymentReceiptValue).toHaveBeenCalledWith(42, 1, 35.5);
        expect(component.total()).toBe(35.5);
    });
    it('preserves reading but blocks editing cancelled attendances', async () => {
        component.attendance = { ...attendance, status: AttendanceStatus.CANCELLED };
        await component.load();
        select();
        component.setAmount(1, 50);
        await component.saveAmount(receipt);
        expect(component.pending()).toEqual([]);
        expect(service.updatePaymentReceiptValue).not.toHaveBeenCalled();
        expect(component.total()).toBe(20);
    });
    it('calculates the remaining budget from saved receipts with cent precision', async () => {
        component.attendance = { ...attendance, quoteTotal: 50.1 };
        await component.load();
        expect(component.remainingAmount).toBe(30.1);
        component.setAmount(1, 35.5);
        expect(component.remainingAmount).toBe(30.1);
        service.updatePaymentReceiptValue.and.returnValue(of({ ...receipt, receiptAmount: 35.5 }));
        await component.saveAmount(receipt);
        expect(component.remainingAmount).toBe(14.6);
        component.attendance = { ...attendance, quoteTotal: 10 };
        expect(component.remainingAmount).toBe(0);
        component.attendance = { ...attendance, quoteTotal: 0 };
        expect(component.remainingAmount).toBe(0);
        component.attendance = { ...attendance, quoteTotal: null };
        expect(component.remainingAmount).toBeNull();
    });
    it('removes a saved receipt and recalculates totals', async () => {
        component.attendance = { ...attendance, quoteTotal: 50 };
        await component.load();
        service.removePaymentReceipt.and.returnValue(of(undefined));
        await component.remove(receipt);
        expect(service.removePaymentReceipt).toHaveBeenCalledWith(42, 1);
        expect(component.receipts()).toEqual([]);
        expect(component.amounts()[1]).toBeUndefined();
        expect(component.total()).toBe(0);
        expect(component.remainingAmount).toBe(50);
    });
    it('preserves the receipt and total when removal fails', async () => {
        await component.load();
        service.removePaymentReceipt.and.returnValue(throwError(() => new Error('Offline')));
        await component.remove(receipt);
        expect(component.receipts()).toEqual([receipt]);
        expect(component.total()).toBe(20);
        expect(component.removingId()).toBeNull();
        expect(component.error()).toContain('Offline');
    });
    it('blocks removal from cancelled attendances and other stages', async () => {
        await component.remove({ ...receipt, stage: 'PROPOSAL' });
        component.attendance = { ...attendance, status: AttendanceStatus.CANCELLED };
        await component.remove(receipt);
        expect(service.removePaymentReceipt).not.toHaveBeenCalled();
    });
});
