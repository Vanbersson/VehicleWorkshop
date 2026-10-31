import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { FilterClientComponent } from './filter.client.component';
import { ClientCompany } from '@/app/models/client.company';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';

describe('Client filter', () => {
    let component: FilterClientComponent;
    let service: jasmine.SpyObj<ClientCompanyService>;
    const client = Object.assign(new ClientCompany(), { id: 7, name: 'Maria', status: StatusEnabDisabEnum.ENABLED });
    const ok = (data: unknown) => new HttpResponse({ body: { status: StatusSuccessError.succes, header: '', message: '', data } });
    beforeEach(() => {
        service = jasmine.createSpyObj('Clients', ['filterId', 'filterJFantasia', 'filterFFantasia', 'filterJName', 'filterFName', 'filterCNPJ', 'filterCPF']);
        service.filterId.and.returnValue(of(ok(client)) as never);
        TestBed.configureTestingModule({ providers: [FilterClientComponent, { provide: ClientCompanyService, useValue: service }, { provide: StorageService, useValue: {} }] });
        component = TestBed.inject(FilterClientComponent);
    });
    it('normalizes an individual client returned by code into a result list', async () => {
        component.formClientCompanyFilter.patchValue({ clientCompanyTipo: 'f', clientCompanyId: 7 });
        await component.filterClientCompany();
        expect(component.dialogListClientCompany()).toEqual([client]);
        expect(service.filterId).toHaveBeenCalledWith(7);
        expect(component.loading()).toBeFalse();
    });
    it('clears the previous selection before starting another search', async () => {
        component.dialogSelectClientCompany = client;
        component.formClientCompanyFilter.controls.clientCompanyId.setValue(7);
        await component.filterClientCompany();
        expect(component.dialogSelectClientCompany).toBeNull();
    });
    it('ignores results from a search cancelled by clearing the filters', async () => {
        const response = new Subject<ReturnType<typeof ok>>();
        service.filterId.and.returnValue(response as never);
        component.formClientCompanyFilter.controls.clientCompanyId.setValue(7);
        const pending = component.filterClientCompany();
        component.cleanAll();
        response.next(ok(client));
        response.complete();
        await pending;
        expect(component.dialogListClientCompany()).toEqual([]);
        expect(component.searched()).toBeFalse();
    });
    it('keeps disabled clients and disabled controls from emitting selections', async () => {
        const emit = spyOn(component.outputClient, 'emit');
        component.dialogSelectClientCompany = Object.assign(new ClientCompany(), { status: StatusEnabDisabEnum.DISABLED });
        await component.selectClientCompany();
        component.dialogSelectClientCompany = client;
        component.isDisabled = true;
        await component.selectClientCompany();
        expect(emit).not.toHaveBeenCalled();
        component.isDisabled = false;
        await component.selectClientCompany();
        expect(emit).toHaveBeenCalledOnceWith(client);
    });
    it('shows a recoverable error for failed requests and avoids empty searches', async () => {
        await component.filterClientCompany();
        expect(component.searchError()).toBeTruthy();
        expect(service.filterId).not.toHaveBeenCalled();
        service.filterId.and.returnValue(throwError(() => new Error('offline')));
        component.formClientCompanyFilter.controls.clientCompanyId.setValue(7);
        await component.filterClientCompany();
        expect(component.searchError()).toBeTruthy();
        expect(component.loading()).toBeFalse();
    });
});
