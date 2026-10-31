import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { AttendanceDocumentsComponent } from './attendance.documents.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';

describe('Attendance documents', () => {
    let component: AttendanceDocumentsComponent;
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    const attendance: CustomerAttendance = { id: 42, visitId: 1, clientId: 2, clientName: 'Cliente', salespersonId: 3, salespersonName: 'Vendedor', dateCreated: '', dateVisit: null, status: AttendanceStatus.DOCUMENTS_PENDING, notes: '', version: 0 };
    const document: AttendanceDocument = { id: 7, fileName: 'contrato.pdf', contentType: 'application/pdf', size: 10, createdAt: '2026-10-31T12:00:00Z' };
    beforeEach(() => {
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['documents', 'uploadDocument', 'downloadDocument']);
        service.documents.and.returnValue(of([document]));
        service.uploadDocument.and.returnValue(of(document));
        TestBed.configureTestingModule({ providers: [AttendanceDocumentsComponent, { provide: CustomerAttendanceService, useValue: service }] });
        component = TestBed.inject(AttendanceDocumentsComponent);
        component.attendance = attendance;
    });
    it('loads documents saved for the selected attendance', async () => {
        await component.load();
        expect(service.documents).toHaveBeenCalledWith(42);
        expect(component.documents()).toEqual([document]);
    });
    it('uploads a PDF and adds the saved document to the list', async () => {
        const file = new File(['%PDF-1.7'], 'contrato.pdf', { type: 'application/pdf' });
        await component.upload([file]);
        expect(service.uploadDocument).toHaveBeenCalledWith(42, file);
        expect(component.documents()).toEqual([document]);
        expect(component.success()).toContain('salvo');
    });
    it('accepts images and rejects unsupported or oversized files before sending', async () => {
        await component.upload([new File(['image'], 'foto.png', { type: 'image/png' })]);
        expect(service.uploadDocument).toHaveBeenCalledTimes(1);
        service.uploadDocument.calls.reset();
        await component.upload([new File(['script'], 'arquivo.html', { type: 'text/html' })]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        await component.upload([new File([new Uint8Array(component.maxSize + 1)], 'grande.pdf', { type: 'application/pdf' })]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        expect(component.error()).toContain('5 MB');
    });
    it('preserves readable documents after cancellation and prevents uploads', async () => {
        component.attendance = { ...attendance, status: AttendanceStatus.CANCELLED };
        await component.load();
        await component.upload([new File(['%PDF-test'], 'contrato.pdf', { type: 'application/pdf' })]);
        expect(component.readOnly).toBeTrue();
        expect(component.documents()).toEqual([document]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
    });
    it('reports upload errors and allows retrying', async () => {
        service.uploadDocument.and.returnValue(throwError(() => new Error('Offline')));
        await component.upload([new File(['pdf'], 'contrato.pdf', { type: 'application/pdf' })]);
        expect(component.error()).toBe('Offline');
        expect(component.uploading()).toBeFalse();
    });
    it('ignores a stale document list after switching attendances', async () => {
        const previous = new Subject<AttendanceDocument[]>();
        service.documents.and.returnValues(previous, of([]));
        const pending = component.load();
        component.attendance = { ...attendance, id: 99 };
        await component.load();
        previous.next([document]);
        previous.complete();
        await pending;
        expect(component.documents()).toEqual([]);
    });
});
