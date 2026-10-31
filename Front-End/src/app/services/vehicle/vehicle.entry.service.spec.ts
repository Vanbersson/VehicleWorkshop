import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { VehicleEntryService } from './vehicle.entry.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';

describe('Vehicle history API', () => {
    it('uses the current tenant and bearer token for the history request', () => {
        const storage = { companyId: 1, resaleId: 2, token: 'test-token' };
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: StorageService, useValue: storage }] });
        const service = TestBed.inject(VehicleEntryService);
        const http = TestBed.inject(HttpTestingController);
        storage.resaleId = 3;
        service.history(42).subscribe((data) => expect(data).toEqual([]));
        const request = http.expectOne(`${environment.apiuUrl}/vehicle/entry/1/3/history/42`);
        expect(request.request.method).toBe('GET');
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        request.flush([]);
        http.verify();
    });
});
