import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PrimeNG } from 'primeng/config';
import DashboardComponent from './dashboard.component';
import { DashboardService } from '@/app/services/dashboard/dashboard.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { ClientCompany } from '@/app/models/client.company';

describe('Dashboard indicators and filters', () => {
    let component: DashboardComponent;
    let service: jasmine.SpyObj<DashboardService>;
    beforeEach(() => {
        service = jasmine.createSpyObj<DashboardService>('DashboardService', ['countVehiclePenAuth', 'countVehicleFilterYear', 'countYesServiceFilterYear', 'countVehicleFilterYearClient', 'countYesServiceFilterYearClient']);
        service.countVehiclePenAuth.and.returnValue(of(new HttpResponse({ status: 200, body: [9, 2] })));
        service.countVehicleFilterYear.and.returnValue(of(new HttpResponse({ status: 200, body: [2, 3] })));
        service.countYesServiceFilterYear.and.returnValue(of(new HttpResponse({ status: 200, body: [1, 2] })));
        service.countVehicleFilterYearClient.and.returnValue(of(new HttpResponse({ status: 200, body: [7, 8] })));
        service.countYesServiceFilterYearClient.and.returnValue(of(new HttpResponse({ status: 200, body: [4, 1] })));
        TestBed.configureTestingModule({ providers: [DashboardComponent, { provide: DashboardService, useValue: service }, { provide: PrimeNG, useValue: { setTranslation() {} } }, { provide: LoadingService, useValue: { show() {}, hide() {} } }] });
        component = TestBed.inject(DashboardComponent);
    });
    it('shows annual totals from actual chart data and preserves the vehicle counters', async () => {
        await component.ngOnInit();
        expect(component.countVehicle()).toEqual([9, 2]);
        expect(component.annualTotal(component.clientData1)).toBe(5);
        expect(component.annualTotal(component.clientData2)).toBe(3);
        expect(component.annualTotal(undefined)).toBeNull();
        expect(component.annualTotal({ datasets: [{ data: [] }, { data: [] }] })).toBeNull();
        expect(component.loadingDashboard()).toBeFalse();
    });
    it('refreshes the selected customer and restores all customers when clearing the filter', async () => {
        await component.ngOnInit();
        component.clientCompany = Object.assign(new ClientCompany(), { id: 7, name: 'Cliente' });
        component.clientName = 'Cliente';
        component.isSearchClient = true;
        await component.refreshDashboard();
        expect(service.countVehicleFilterYearClient).toHaveBeenCalledWith(component.yearNow(), 7);
        expect(component.annualTotal(component.clientData1)).toBe(15);
        expect(component.countVehicle()).toEqual([9, 2]);
        expect(component.clientName).toBe('Cliente');
        await component.init();
        expect(component.isSearchClient).toBeFalse();
        expect(component.clientName).toBe('');
        expect(component.annualTotal(component.clientData1)).toBe(5);
    });
    it('reports partial loading failures and allows another refresh', async () => {
        await component.ngOnInit();
        service.countVehicleFilterYear.and.returnValue(throwError(() => new Error('Offline')));
        await component.refreshDashboard();
        expect(component.loadError()).toBeTruthy();
        expect(component.loadingDashboard()).toBeFalse();
        expect(component.annualTotal(component.clientData1)).toBeNull();
        service.countVehicleFilterYear.and.returnValue(of(new HttpResponse({ status: 200, body: [2, 3] })));
        await component.refreshDashboard();
        expect(component.loadError()).toBe('');
        expect(component.annualTotal(component.clientData1)).toBe(5);
    });
});
