import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import VehicleEntryReportComponent from './vehicle.entry.report.component';
import { VehicleEntry } from '@/app/models/vehicle.entry';

describe('Vehicle entry report', () => {
    let component: VehicleEntryReportComponent;
    let filter: jasmine.Spy;
    beforeEach(() => {
        filter = jasmine.createSpy('filterVehicle').and.returnValue(of(new HttpResponse({ body: [] })));
        component = new VehicleEntryReportComponent(
            {} as never,
            {} as never,
            {} as never,
            {} as never,
            { filterVehicle: filter } as never,
            {} as never,
            { show: () => {}, hide: () => {} } as never,
            { companyId: 1, resaleId: 2 } as never,
            { add: () => {} } as never,
            {} as never
        );
    });
    it('rejects reversed periods without closing the filters', async () => {
        component.dialogVisible = true;
        component.formFilter.patchValue({ dateInit: new Date(2026, 10, 10), dateFinal: new Date(2026, 10, 1) });
        await component.searchFilter();
        expect(filter).not.toHaveBeenCalled();
        expect(component.dialogVisible).toBeTrue();
    });
    it('keeps original dates and full owner names in results', async () => {
        const vehicle = Object.assign(new VehicleEntry(), { id: 7, entryDate: '2026-11-01T10:00:00', clientCompanyName: 'Owner Full Company Name' });
        filter.and.returnValue(of(new HttpResponse({ body: [vehicle] })));
        await component.searchFilter();
        expect(component.listVehicleEntry()[0].entryDate).toBe(vehicle.entryDate);
        expect(component.listVehicleEntry()[0].clientCompanyName).toBe('Owner Full Company Name');
    });
    it('sends disabled client controls and a complete unplated flag', async () => {
        component.formFilter.controls.clientCompanyId.disable();
        component.formFilter.patchValue({ clientCompanyId: 5, vehicleNew: true, vehiclePlate: 'abc-1234' });
        await component.searchFilter();
        expect(filter).toHaveBeenCalledWith(jasmine.objectContaining({ clientId: 5, vehicleNew: 'yes', vehiclePlate: 'ABC1234', dateInit: null, dateFinal: null }));
    });
    it('preserves results on a failed refresh and releases loading', async () => {
        const previous = new VehicleEntry();
        component.listVehicleEntry.set([previous]);
        filter.and.returnValue(throwError(() => new Error('offline')));
        await component.searchFilter();
        expect(component.listVehicleEntry()).toEqual([previous]);
        expect(component.searchError()).toBeTruthy();
        expect(component.searching()).toBeFalse();
    });
});
