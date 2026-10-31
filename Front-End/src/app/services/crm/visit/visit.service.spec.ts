import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VisitService } from './visit.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { VisitAgendaNew, VisitAgendaUpdate } from '@/app/models/crm/visit/visit.agenda';
import { environment } from '@/environments/environment';

describe('VisitService agenda endpoints', () => {
    let service: VisitService;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: StorageService, useValue: { token: 'test-token' } }] });
        service = TestBed.inject(VisitService);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => http.verify());

    it('creates an appointment using the controller route and bearer authentication', () => {
        const payload: VisitAgendaNew = { dateVisit: '2026-11-04T17:35:00.000Z', salespersonId: 7, salespersonName: 'Vendedor', clientId: 3, clientName: 'Cliente', informationAgenda: '' };
        service.agendaNew(payload).subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/salesperson/visit/agenda/new`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual(payload);
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        request.flush({ status: 'Success.' }, { status: 201, statusText: 'Created' });
    });

    it('uses the agenda update route with the record identifier', () => {
        const payload: VisitAgendaUpdate = { id: 42, dateVisit: '2026-11-05T19:10:00.000Z', salespersonId: 7, salespersonName: 'Vendedor', clientId: 3, clientName: 'Cliente', informationAgenda: 'Novo horário' };
        service.agendaUpdate(payload).subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/salesperson/visit/agenda/update`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body.id).toBe(42);
        expect(request.request.body).toEqual(payload);
        request.flush({ status: 'Success.' });
    });

    it('loads agenda records from the agenda endpoint', () => {
        service.listAllAgenda('2026-11-04').subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/salesperson/visit/agenda/day`);
        expect(request.request.method).toBe('POST');
        expect(request.request.body).toEqual({ day: '2026-11-04' });
        request.flush([]);
    });

    it('loads overdue visits without restricting the selected calendar day', () => {
        service.listOverdueAgenda().subscribe();
        const request = http.expectOne(`${environment.apiuUrl}/salesperson/visit/agenda/overdue`);
        expect(request.request.method).toBe('GET');
        expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
        request.flush([]);
    });
});
