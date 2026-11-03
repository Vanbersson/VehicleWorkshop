import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import NewCustomerComponent from './new.customer.component';

describe('Attendance card navigation', () => {
    it('links creation and editing to the attendance page without opening an editor dialog', async () => {
        const item: CustomerAttendance = {
            id: 17,
            visitId: null,
            clientId: 5,
            clientName: 'Cliente',
            salespersonId: 7,
            salespersonName: 'Vendedor',
            dateCreated: '2026-11-02T12:00:00Z',
            dateVisit: null,
            status: AttendanceStatus.DOCUMENTS_PENDING,
            notes: '',
            version: 0
        };
        TestBed.configureTestingModule({
            imports: [NewCustomerComponent],
            providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: CustomerAttendanceService, useValue: { list: () => of([item]) } }]
        });
        const fixture = TestBed.createComponent(NewCustomerComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        await fixture.componentInstance.load();
        fixture.detectChanges();
        expect(fixture.componentInstance.loadError()).toBe('');
        expect(fixture.componentInstance.pageItems().map((attendance) => attendance.id)).toEqual([17]);
        const links = fixture.debugElement.queryAll(By.directive(RouterLink)).map((element) => element.injector.get(RouterLink).urlTree?.toString());
        expect(links).toContain('/crm/new/customer/maintenance/new');
        expect(links).toContain('/crm/new/customer/maintenance/17');
        expect(fixture.nativeElement.querySelector('#attendanceDocuments')).toBeNull();
        expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
    });
});
