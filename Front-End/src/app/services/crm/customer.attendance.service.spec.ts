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
