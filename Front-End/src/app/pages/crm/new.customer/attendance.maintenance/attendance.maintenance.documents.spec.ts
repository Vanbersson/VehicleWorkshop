import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import AttendanceMaintenanceComponent from './attendance.maintenance.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
describe('Attendance document panel requests', () => {
    it('creates a single document panel and reloads only when the selected stage changes', async () => {
        const service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['documents']);
        service.documents.and.returnValue(of([]));
        TestBed.configureTestingModule({
            imports: [AttendanceMaintenanceComponent],
            providers: [provideRouter([]), MessageService, { provide: CustomerAttendanceService, useValue: service }, { provide: AttendanceProposalPrintService, useValue: { print: () => Promise.resolve() } }]
        });
        const fixture = TestBed.createComponent(AttendanceMaintenanceComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        const page = fixture.componentInstance;
        const item: CustomerAttendance = {
            id: 16,
            visitId: null,
            clientId: 1,
            clientName: 'Cliente',
            salespersonId: 1,
            salespersonName: 'Vendedor',
            dateCreated: '2026-11-06',
            dateVisit: null,
            status: AttendanceStatus.QUOTATION,
            notes: '',
            version: 0
        };
        page.detailError.set('');
        page.editing.set(item);
        page.activeEditStep.set(3);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(service.documents.calls.allArgs()).toEqual([[16, 'DOCUMENTS']]);
        expect(fixture.nativeElement.querySelectorAll('p-attendance-documents').length).toBe(1);
        page.editing.set({ ...item, quoteTotal: 100 });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.count()).toBe(1);
        page.activeEditStep.set(4);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.allArgs()).toEqual([
            [16, 'DOCUMENTS'],
            [16, 'PAYMENT']
        ]);
        expect(fixture.nativeElement.querySelectorAll('p-attendance-payment').length).toBe(1);
        page.activeEditStep.set(3);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.allArgs()).toEqual([
            [16, 'DOCUMENTS'],
            [16, 'PAYMENT'],
            [16, 'DOCUMENTS']
        ]);
    });
});
