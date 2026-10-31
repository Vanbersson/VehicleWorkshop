import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import NewCustomerComponent from './new.customer.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';

describe('Attendance editor dialog rendering', () => {
    it('renders the original visit and binds the documents field inside the Stepper panel', async () => {
        const attendance: CustomerAttendance = {
            id: 1,
            visitId: 42,
            clientId: 3,
            clientName: 'Cliente de teste',
            salespersonId: 7,
            salespersonName: 'Vendedor',
            dateCreated: '2026-10-30T12:00:00Z',
            dateVisit: '2026-10-30T11:00:00Z',
            status: AttendanceStatus.VISIT_COMPLETED,
            notes: '',
            version: 0
        };
        const visit = Object.assign(new Visit(), { id: 42, clientName: attendance.clientName, salespersonName: attendance.salespersonName, clientCNPJ: '12345678000100', reasonVisit: '1', products: '2' });
        const service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['list', 'detail']);
        service.list.and.returnValue(of([attendance]));
        service.detail.and.returnValue(of({ attendance, visit }));
        TestBed.configureTestingModule({
            imports: [NewCustomerComponent],
            providers: [provideZonelessChangeDetection(), provideRouter([]), { provide: ClientCompanyService, useValue: {} }, { provide: StorageService, useValue: {} }, { provide: CustomerAttendanceService, useValue: service }]
        });
        const fixture = TestBed.createComponent(NewCustomerComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        await fixture.componentInstance.open(attendance);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(fixture.nativeElement.textContent).toContain('Visita que originou o atendimento');
        expect(fixture.nativeElement.textContent).toContain('Implemento Librelato');
        fixture.componentInstance.selectEditStep(2);
        fixture.componentInstance.form.controls.documentsNotes.setValue('Documentos conferidos');
        fixture.detectChanges();
        await fixture.whenStable();
        const textarea = fixture.nativeElement.querySelector('#attendanceDocuments') as HTMLTextAreaElement;
        expect(textarea).not.toBeNull();
        expect(textarea.value).toBe('Documentos conferidos');
    });
});
