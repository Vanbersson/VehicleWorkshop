import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { FilterDriverComponent } from './filter.driver.component';
import { Driver } from '@/app/models/driver';
import { DriverService } from '@/app/services/driver/driver.service';
import { MessageService } from 'primeng/api';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';

describe('Driver filter', () => {
    let component: FilterDriverComponent;
    let service: jasmine.SpyObj<DriverService>;
    const client = Object.assign(new Driver(), { id: 7, name: 'Maria', status: StatusEnabDisabEnum.ENABLED });
    const ok = (data: unknown) => new HttpResponse({ body: { status: StatusSuccessError.succes, header: '', message: '', data } });
    beforeEach(() => {
        service = jasmine.createSpyObj('Drivers', ['filterId', 'filterName', 'filterCPF', 'filterRG', 'filterCNHRegister']);
        service.filterId.and.returnValue(of(ok(client)) as never);
        TestBed.configureTestingModule({ providers: [FilterDriverComponent, { provide: DriverService, useValue: service }, { provide: MessageService, useValue: { add() {} } }] });
        component = TestBed.inject(FilterDriverComponent);
    });
    it('normalizes a driver returned by code into a result list', async () => {
        component.formDriver.patchValue({ id: 7 });
        await component.filterDriver();
        expect(component.listDrivers()).toEqual([client]);
        expect(service.filterId).toHaveBeenCalledWith(7);
        expect(component.loading()).toBeFalse();
    });
    it('clears the previous selection before starting another search', async () => {
        component.dialogSelectDriver = client;
        component.formDriver.controls.id.setValue(7);
        await component.filterDriver();
        expect(component.dialogSelectDriver).toBeNull();
    });
    it('ignores results from a search cancelled by clearing the filters', async () => {
        const response = new Subject<ReturnType<typeof ok>>();
        service.filterId.and.returnValue(response as never);
        component.formDriver.controls.id.setValue(7);
        const pending = component.filterDriver();
        component.cleanForm();
        response.next(ok(client));
        response.complete();
        await pending;
        expect(component.listDrivers()).toEqual([]);
        expect(component.searched()).toBeFalse();
    });
    it('keeps disabled clients and disabled controls from emitting selections', async () => {
        const emit = spyOn(component.outputDriver, 'emit');
        component.dialogSelectDriver = Object.assign(new Driver(), { status: StatusEnabDisabEnum.DISABLED });
        await component.selectDriver();
        component.dialogSelectDriver = client;
        component.isDisabled = true;
        await component.selectDriver();
        expect(emit).not.toHaveBeenCalled();
        component.isDisabled = false;
        await component.selectDriver();
        expect(emit).toHaveBeenCalledOnceWith(client);
    });
    it('shows a recoverable error for failed requests and avoids empty searches', async () => {
        await component.filterDriver();
        expect(component.searchError()).toBeTruthy();
        expect(service.filterId).not.toHaveBeenCalled();
        service.filterId.and.returnValue(throwError(() => new Error('offline')));
        component.formDriver.controls.id.setValue(7);
        await component.filterDriver();
        expect(component.searchError()).toBeTruthy();
        expect(component.loading()).toBeFalse();
    });
});
