import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CustomerAttendanceService } from './customer.attendance.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';

describe('Attendance query endpoints', () => {
    let service: CustomerAttendanceService;
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: StorageService, useValue: { token: 'test-token' } }] });
        service = TestBed.inject(CustomerAttendanceService);
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());

    it('sends payment receipts with an individual amount and updates it', () => {
        const file = new File(['%PDF-test'], 'recibo.pdf', { type: 'application/pdf' });
        service.uploadPaymentReceipt(42, file, 125.5).subscribe();
        const upload = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42/documents`);
        expect(upload.request.body.get('file')).toBe(file);
        expect(upload.request.body.get('stage')).toBe('PAYMENT');
        expect(upload.request.body.get('receiptAmount')).toBe('125.50');
        expect(upload.request.headers.get('Authorization')).toBe('Bearer test-token');
        upload.flush({ id: 7 });
        service.updatePaymentReceiptValue(42, 7, 200).subscribe();
        const update = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42/documents/7/payment-value`);
        expect(update.request.method).toBe('POST');
        expect(update.request.body).toEqual({ receiptAmount: 200 });
        expect(update.request.headers.get('Authorization')).toBe('Bearer test-token');
        update.flush({ id: 7, receiptAmount: 200 });
    });

    it('removes a payment receipt with authentication', () => {
        service.removePaymentReceipt(42, 7).subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42/documents/7/payment-remove`);
        expect(request.request.method).toBe('POST');
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        request.flush(null);
    });
    it('uploads a document as authenticated multipart data', () => {
        const file = new File(['%PDF-test'], 'contrato.pdf', { type: 'application/pdf' });
        service.uploadDocument(42, file, 'PROPOSAL').subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42/documents`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body.get('file')).toBe(file);
        expect(request.request.body.get('stage')).toBe('PROPOSAL');
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        expect(request.request.headers.has('Content-Type')).toBeFalse();
        request.flush({ id: 7 });
    });

    it('lists document metadata and downloads file bytes with authentication', () => {
        service.documents(42, 'PROPOSAL').subscribe();
        const list = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42/documents?stage=PROPOSAL`);
        expect(list.request.headers.get('Authorization')).toBe('Bearer test-token');
        list.flush([]);
        service.downloadDocument(42, 7).subscribe();
        const download = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42/documents/7`);
        expect(download.request.responseType).toBe('blob');
        expect(download.request.headers.get('Authorization')).toBe('Bearer test-token');
        download.flush(new Blob(['pdf']));
    });

    it('loads the default non-cancelled list', () => {
        service.list().subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance`);
        expect(request.request.method).toBe('GET');
        request.flush([]);
    });

    it('loads attendance details including the originating visit', () => {
        service.detail(42).subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/42`);
        expect(request.request.method).toBe('GET');
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        request.flush({ attendance: { id: 42 }, visit: { id: 7 } });
    });

    for (const mode of ['ACTIVE', 'CANCELLED'] as const) {
        it(`uses a dedicated ${mode} query with the supplied filters`, () => {
            const filters = { id: 42, clientName: 'Cliente', salespersonName: 'Vendedor' };
            service.search(mode, filters).subscribe();
            const endpoint = mode === 'CANCELLED' ? 'cancelled' : 'active';
            const request = http.expectOne(`${environment.apiuUrl}/crm/customer-attendance/${endpoint}/search`);
            expect(request.request.method).toBe('POST');
            expect(request.request.body).toEqual(filters);
            expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
            request.flush([]);
        });
    }
});
