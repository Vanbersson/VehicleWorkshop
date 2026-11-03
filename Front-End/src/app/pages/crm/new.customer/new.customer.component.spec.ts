import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import NewCustomerComponent from './new.customer.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';

describe('Customer attendance cards', () => {
    let component: NewCustomerComponent;
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    let printer: jasmine.SpyObj<AttendanceProposalPrintService>;
    const first: CustomerAttendance = {
        id: 1,
        visitId: 42,
        clientId: null,
        clientName: 'João',
        salespersonId: 7,
        salespersonName: 'Maria',
        dateCreated: '2026-10-30T12:00:00Z',
        dateVisit: '2026-10-30T11:00:00Z',
        status: AttendanceStatus.VISIT_COMPLETED,
        notes: '',
        version: 0
    };
    const second: CustomerAttendance = { ...first, id: 2, visitId: 43, clientName: 'Pedro', status: AttendanceStatus.DOCUMENTS_PENDING };

    beforeEach(() => {
        printer = jasmine.createSpyObj<AttendanceProposalPrintService>('ProposalPrinter', ['print']);
        printer.print.and.resolveTo();
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['list', 'detail', 'search', 'update', 'cancel', 'create']);
        service.list.and.returnValue(of([first, second]));
        service.search.and.returnValue(of([first, second]));
        service.detail.and.callFake((id) => {
            const item = id === first.id ? first : second;
            return of({ attendance: item, visit: Object.assign(new Visit(), { id: item.visitId, clientName: item.clientName, salespersonName: item.salespersonName, reasonVisit: '1', products: '2' }) });
        });
        TestBed.configureTestingModule({
            providers: [
                NewCustomerComponent,
                { provide: SalespersonService, useValue: { listAll: () => of([]) } },
                { provide: AttendanceProposalPrintService, useValue: printer },
                { provide: CustomerAttendanceService, useValue: service },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ visitId: '42' }) } } },
                { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }
            ]
        });
        component = TestBed.inject(NewCustomerComponent);
    });

    it('highlights the completed visit and filters the active results by stage', async () => {
        await component.load();
        expect(component.filteredItems()[0].visitId).toBe(42);
        component.changeStatus(AttendanceStatus.DOCUMENTS_PENDING);
        expect(component.filteredItems().map((item) => item.id)).toEqual([2]);
        expect(component.counts().map((stage) => stage.count)).toEqual([1, 1, 0, 0, 0, 0]);
    });

    it('hides cancelled attendances in the active query', () => {
        const cancelled = { ...second, status: AttendanceStatus.CANCELLED };
        component.items.set([first, cancelled]);
        expect(component.filteredItems().map((item) => item.id)).toEqual([1]);
        component.changeStatus(AttendanceStatus.CANCELLED);
        expect(component.filteredItems()).toEqual([]);
    });

    it('uses the dedicated cancelled query only after an identifying filter is supplied', async () => {
        component.changeQueryMode('CANCELLED');
        await component.load();
        expect(service.search).not.toHaveBeenCalled();
        expect(component.queryError()).toContain('Informe');
        component.queryForm.patchValue({ id: 123, clientName: ' José ', salespersonName: ' Carla ' });
        service.search.and.returnValue(of([{ ...second, id: 123, status: AttendanceStatus.CANCELLED }]));
        await component.load();
        expect(service.search).toHaveBeenCalledWith('CANCELLED', { id: 123, clientName: 'José', salespersonName: 'Carla' });
        expect(component.filteredItems().map((item) => item.id)).toEqual([123]);
        component.clearQuery();
        expect(component.filteredItems()).toEqual([]);
    });

    it('uses the non-cancelled query for active filters', async () => {
        component.queryForm.patchValue({ clientName: 'João' });
        await component.load();
        expect(service.search).toHaveBeenCalledWith('ACTIVE', { id: null, clientName: 'João', salespersonName: '' });
    });

    it('ignores an older query response after switching to cancelled attendance', async () => {
        const result = new Subject<CustomerAttendance[]>();
        service.list.and.returnValue(result);
        const pending = component.load();
        component.changeQueryMode('CANCELLED');
        result.next([first]);
        result.complete();
        await pending;
        expect(component.items()).toEqual([]);
    });

    it('requires a nonblank cancellation reason and preserves it if the request fails', async () => {
        component.openCancellation(first);
        component.cancelForm.controls.reason.setValue('   ');
        await component.cancel();
        expect(service.cancel).not.toHaveBeenCalled();
        component.cancelForm.controls.reason.setValue('Cliente desistiu');
        service.cancel.and.returnValue(throwError(() => new Error('Offline')));
        await component.cancel();
        expect(component.cancellationVisible).toBeTrue();
        expect(component.cancelForm.controls.reason.value).toBe('Cliente desistiu');
        expect(component.cancelError()).toBe('Offline');
    });

    it('updates the card with the cancellation reason and keeps the quotation amount', async () => {
        await component.load();
        component.openCancellation(first);
        component.cancelForm.controls.reason.setValue('  Cliente desistiu  ');
        service.cancel.and.returnValue(of({ ...first, status: AttendanceStatus.CANCELLED, cancellationReason: 'Cliente desistiu', cancelledAt: '2026-10-30T12:00:00Z', cancelledByName: 'Maria', quoteTotal: 180, version: 1 }));
        await component.cancel();
        expect(service.cancel).toHaveBeenCalledWith({ id: 1, version: 0, reason: 'Cliente desistiu' });
        expect(component.items()[0].status).toBe(AttendanceStatus.CANCELLED);
        expect(component.items()[0].quoteTotal).toBe(180);
        expect(component.cancellationVisible).toBeFalse();
    });
});
