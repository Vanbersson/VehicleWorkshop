import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AttendanceQuoteComponent } from './attendance.quote.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { AttendanceQuoteResponse } from '@/app/models/crm/attendance.quote';

describe('Attendance quote dialog', () => {
    let component: AttendanceQuoteComponent;
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    const attendance: CustomerAttendance = { id: 1, visitId: 42, clientId: 3, clientName: 'Cliente', salespersonId: 7, salespersonName: 'Vendedor', dateCreated: '', dateVisit: null, status: AttendanceStatus.VISIT_COMPLETED, notes: '', version: 2 };
    const quote = {
        id: 5,
        version: 0,
        notes: 'Detalhes',
        dateCreated: '',
        dateUpdated: '',
        subtotal: 200,
        discountTotal: 20,
        total: 180,
        items: [{ productName: 'Produto', quantity: 2, unitPrice: 100, discountType: 'PERCENTAGE' as const, discountValue: 10 }]
    };

    beforeEach(() => {
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['getQuote', 'saveQuote']);
        service.getQuote.and.returnValue(of({ attendance, quote: null }));
        TestBed.configureTestingModule({ providers: [AttendanceQuoteComponent, { provide: CustomerAttendanceService, useValue: service }] });
        component = TestBed.inject(AttendanceQuoteComponent);
        component.attendance = attendance;
        component.visible = true;
    });

    it('reopens saved items with the quotation version', async () => {
        service.getQuote.and.returnValue(of({ attendance, quote }));
        await component.load();
        expect(component.items.getRawValue()).toEqual(quote.items);
        expect(component.totals()?.total).toBe(180);
        expect(component.form.controls.notes.value).toBe('Detalhes');
        service.saveQuote.and.returnValue(of({ attendance, quote }));
        await component.save();
        expect(service.saveQuote.calls.mostRecent().args[0].version).toBe(0);
    });

    it('requires at least one named product and prevents excessive discounts', async () => {
        await component.load();
        await component.save();
        expect(service.saveQuote).not.toHaveBeenCalled();
        component.items.at(0).patchValue({ productName: 'Produto', discountValue: 101 });
        await component.save();
        expect(service.saveQuote).not.toHaveBeenCalled();
        component.removeItem(0);
        await component.save();
        expect(component.saveError()).toContain('pelo menos um');
    });

    it('saves once with the attendance version and keeps the data when the server fails', async () => {
        await component.load();
        component.items.at(0).patchValue({ productName: 'Produto', unitPrice: 100 });
        const response = new Subject<AttendanceQuoteResponse>();
        service.saveQuote.and.returnValue(response);
        const first = component.save();
        await component.save();
        expect(service.saveQuote).toHaveBeenCalledTimes(1);
        expect(service.saveQuote.calls.mostRecent().args[0].attendanceVersion).toBe(2);
        response.error(new Error('Conflito de versão'));
        await first;
        expect(component.visible).toBeTrue();
        expect(component.items.at(0).controls.productName.value).toBe('Produto');
        expect(component.saveError()).toBe('Conflito de versão');
    });

    it('closes and emits the updated attendance after a confirmed save', async () => {
        await component.load();
        component.items.at(0).patchValue({ productName: 'Produto', unitPrice: 100 });
        const updated = { ...attendance, status: AttendanceStatus.QUOTATION, version: 3 };
        service.saveQuote.and.returnValue(of({ attendance: updated, quote }));
        const saved = jasmine.createSpy('saved');
        component.saved.subscribe(saved);
        await component.save();
        expect(saved).toHaveBeenCalledWith(updated);
        expect(component.visible).toBeFalse();
    });

    it('does not allow saving if loading the existing quotation failed', async () => {
        service.getQuote.and.returnValue(throwError(() => new Error('Offline')));
        await component.load();
        await component.save();
        expect(component.loadError()).toBe('Offline');
        expect(service.saveQuote).not.toHaveBeenCalled();
    });

    it('keeps a cancelled attendance quotation available only for reading', async () => {
        service.getQuote.and.returnValue(of({ attendance: { ...attendance, status: AttendanceStatus.CANCELLED }, quote }));
        await component.load();
        expect(component.cancelled()).toBeTrue();
        component.addItem();
        component.removeItem(0);
        await component.save();
        expect(component.items.length).toBe(1);
        expect(service.saveQuote).not.toHaveBeenCalled();
    });
});
