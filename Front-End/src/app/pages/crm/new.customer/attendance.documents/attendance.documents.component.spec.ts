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
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['documents', 'uploadDocument', 'downloadDocument', 'removeOrderDocument', 'removeProposalDocument', 'shareProposalDocument', 'shareOrderDocument']);
        service.documents.and.returnValue(of([document]));
        service.uploadDocument.and.returnValue(of(document));
        TestBed.configureTestingModule({ providers: [AttendanceDocumentsComponent, { provide: CustomerAttendanceService, useValue: service }] });
        component = TestBed.inject(AttendanceDocumentsComponent);
        component.attendance = attendance;
    });
    it('loads documents saved for the selected attendance', async () => {
        await component.load();
        expect(service.documents).toHaveBeenCalledWith(42, 'DOCUMENTS');
        expect(component.documents()).toEqual([document]);
    });
    it('uploads a PDF and adds the saved document to the list', async () => {
        const file = new File(['%PDF-1.7'], 'contrato.pdf', { type: 'application/pdf' });
        await component.upload([file]);
        expect(service.uploadDocument).toHaveBeenCalledWith(42, file, 'DOCUMENTS');
        expect(component.documents()).toEqual([document]);
        expect(component.success()).toContain('salvo');
    });
    it('rejects images and unsupported or oversized files before sending', async () => {
        await component.upload([new File(['image'], 'foto.png', { type: 'image/png' })]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
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
    it('keeps proposal attachments separate from documents and legacy files', async () => {
        const proposal = { ...document, id: 8, stage: 'PROPOSAL' as const };
        service.documents.and.returnValue(of([document, proposal]));
        component.stage = 'PROPOSAL';
        await component.load();
        expect(service.documents).toHaveBeenCalledWith(42, 'PROPOSAL');
        expect(component.documents()).toEqual([proposal]);
        component.stage = 'DOCUMENTS';
        await component.load();
        expect(component.documents()).toEqual([document]);
    });
    it('uploads with the proposal stage', async () => {
        component.stage = 'PROPOSAL';
        const file = new File(['%PDF-test'], 'proposta.pdf', { type: 'application/pdf' });
        service.uploadDocument.and.returnValue(of({ ...document, stage: 'PROPOSAL' }));
        await component.upload([file]);
        expect(service.uploadDocument).toHaveBeenCalledWith(42, file, 'PROPOSAL');
    });
    it('removes a proposal attachment after confirmation', async () => {
        component.stage = 'PROPOSAL';
        const proposal = { ...document, stage: 'PROPOSAL' as const };
        component.documents.set([proposal]);
        spyOn(window, 'confirm').and.returnValue(true);
        service.removeProposalDocument.and.returnValue(of(undefined));
        await component.remove(proposal);
        expect(service.removeProposalDocument).toHaveBeenCalledWith(42, 7);
        expect(component.documents()).toEqual([]);
    });
    it('keeps the attachment when removal is cancelled or fails', async () => {
        component.stage = 'PROPOSAL';
        const proposal = { ...document, stage: 'PROPOSAL' as const };
        component.documents.set([proposal]);
        const confirm = spyOn(window, 'confirm').and.returnValue(false);
        await component.remove(proposal);
        expect(service.removeProposalDocument).not.toHaveBeenCalled();
        confirm.and.returnValue(true);
        service.removeProposalDocument.and.returnValue(throwError(() => new Error('Offline')));
        await component.remove(proposal);
        expect(component.documents()).toEqual([proposal]);
        expect(component.error()).toBe('Offline');
    });
    it('does not remove documents from another stage or cancelled attendance', async () => {
        await component.remove({ ...document, stage: 'PROPOSAL' });
        component.stage = 'PROPOSAL';
        component.attendance = { ...attendance, status: AttendanceStatus.CANCELLED };
        await component.remove({ ...document, stage: 'PROPOSAL' });
        expect(service.removeProposalDocument).not.toHaveBeenCalled();
    });
    it('rejects multiple proposal files or another file when a proposal attachment exists', async () => {
        component.stage = 'PROPOSAL';
        const file = new File(['%PDF-test'], 'proposta.pdf', { type: 'application/pdf' });
        await component.upload([file, file]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        component.documents.set([{ ...document, stage: 'PROPOSAL' }]);
        await component.upload([file]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        expect(component.error()).toContain('apenas um documento');
    });
    it('rejects multiple PDFs and a second document in the order stage', async () => {
        const file = new File(['%PDF-test'], 'documento.pdf', { type: 'application/pdf' });
        await component.upload([file, file]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        component.documents.set([document]);
        await component.upload([file]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
    });
    it('generates a share link for the proposal and prepares WhatsApp text', async () => {
        component.stage = 'PROPOSAL';
        service.shareProposalDocument.and.returnValue(of({ path: '/public/proposals/test-token', expiresAt: '2026-11-11T12:00:00Z' }));
        await component.share({ ...document, stage: 'PROPOSAL' });
        expect(service.shareProposalDocument).toHaveBeenCalledWith(42, 7);
        expect(component.shareUrl()).toContain('/public/proposals/test-token');
        expect(decodeURIComponent(component.whatsappUrl())).toContain(component.shareUrl());
        expect(component.shareExpiresAt()).toBe('2026-11-11T12:00:00Z');
    });
    it('blocks sharing another stage or a cancelled attendance', async () => {
        await component.share({ ...document, stage: 'PROPOSAL' });
        component.stage = 'PROPOSAL';
        component.attendance = { ...attendance, status: AttendanceStatus.CANCELLED };
        await component.share({ ...document, stage: 'PROPOSAL' });
        expect(service.shareProposalDocument).not.toHaveBeenCalled();
    });
    it('warns that the signed file is also removed before deleting the proposal', async () => {
        component.stage = 'PROPOSAL';
        const proposal = { ...document, stage: 'PROPOSAL' as const, signedFileName: 'assinada.pdf' };
        component.documents.set([proposal]);
        const confirm = spyOn(window, 'confirm').and.returnValue(true);
        service.removeProposalDocument.and.returnValue(of(undefined));
        await component.remove(proposal);
        expect(confirm.calls.mostRecent().args[0]).toContain('assinada.pdf');
        expect(service.removeProposalDocument).toHaveBeenCalledWith(42, 7);
        expect(component.documents()).toEqual([]);
    });
    it('rejects images and renamed image files in the proposal stage', async () => {
        component.stage = 'PROPOSAL';
        await component.upload([new File(['image'], 'foto.png', { type: 'image/png' })]);
        await component.upload([new File(['image'], 'proposta.pdf', { type: 'image/png' })]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        expect(component.error()).toContain('apenas um arquivo PDF');
    });
    it('shares an order using its own endpoint and WhatsApp message', async () => {
        service.shareOrderDocument.and.returnValue(of({ path: '/public/orders/order-token', expiresAt: '2026-11-12T12:00:00Z' }));
        await component.share(document);
        expect(service.shareOrderDocument).toHaveBeenCalledWith(42, 7);
        expect(service.shareProposalDocument).not.toHaveBeenCalled();
        expect(component.shareUrl()).toContain('/public/orders/');
        expect(decodeURIComponent(component.whatsappUrl())).toContain('do seu pedido');
    });
    it('removes the order attachment after confirmation using its own endpoint', async () => {
        component.documents.set([document]);
        spyOn(window, 'confirm').and.returnValue(true);
        service.removeOrderDocument.and.returnValue(of(undefined));
        await component.remove(document);
        expect(service.removeOrderDocument).toHaveBeenCalledWith(42, 7);
        expect(service.removeProposalDocument).not.toHaveBeenCalled();
        expect(component.documents()).toEqual([]);
        expect(component.success()).toContain('pedido');
    });
});
