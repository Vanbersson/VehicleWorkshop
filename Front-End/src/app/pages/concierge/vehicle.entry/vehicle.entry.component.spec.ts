import { TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { HttpResponse } from '@angular/common/http';
import { of, throwError, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import VehicleEntryComponent from './vehicle.entry.component';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';
import { VehicleModel } from '@/app/models/vehicle.model';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { UserService } from '@/app/services/user/user.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { ModuleConciergeService } from '@/app/services/module/module.concierge.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
registerLocaleData(localePt);
describe('Vehicle entry', () => {
    let component: VehicleEntryComponent;
    let vehicles: jasmine.SpyObj<VehicleEntryService>;
    let messages: jasmine.SpyObj<MessageService>;
    const ok = (data: unknown, status = 200) => new HttpResponse({ status, body: { status: StatusSuccessError.succes, header: '', message: '', data } });
    const pendingVehicle = () => Object.assign(new VehicleEntry(), { companyId: 1, resaleId: 2, vehiclePlate: 'ABC1234', modelDescription: 'Truck' });
    beforeEach(() => {
        vehicles = jasmine.createSpyObj('Vehicles', ['entrySave', 'saveChecklist', 'saveImage', 'updateImage', 'filterFreeAdmission']);
        messages = jasmine.createSpyObj('Messages', ['add']);
        vehicles.filterFreeAdmission.and.returnValue(of(ok(null)) as never);
        vehicles.entrySave.and.returnValue(of(ok({ id: 42 }, 201)) as never);
        vehicles.saveChecklist.and.returnValue(of(ok({ id: 8 }, 201)) as never);
        vehicles.updateImage.and.returnValue(of(null));
        vehicles.saveImage.and.returnValue(of(ok({ url: '/photos/image.jpg' })) as never);
        TestBed.configureTestingModule({
            providers: [
                VehicleEntryComponent,
                { provide: VehicleEntryService, useValue: vehicles },
                { provide: MessageService, useValue: messages },
                { provide: PermissionUserService, useValue: { filterPermission: () => of(ok(null)) } },
                { provide: LoadingService, useValue: { show() {}, hide() {} } },
                { provide: StorageService, useValue: { companyId: 1, resaleId: 2, id: 9, name: 'Maria' } },
                { provide: VehicleModelService, useValue: {} },
                { provide: UserService, useValue: {} },
                { provide: PhotoService, useValue: {} },
                { provide: ModuleConciergeService, useValue: {} }
            ]
        });
        component = TestBed.inject(VehicleEntryComponent);
        component.clientCompany = Object.assign(new ClientCompany(), { id: 1, name: 'Owner' });
        component.driver = Object.assign(new Driver(), { id: 2, name: 'Driver' });
        component.formVehicle.patchValue({ vehiclePlate: 'abc1234', modelVehicle: Object.assign(new VehicleModel(), { id: 3, description: 'Truck' }), entryDate: new Date(Date.now() - 60000) });
        component.addRequirePlaca();
        spyOn(component, 'scrollTop');
    });
    it('treats company without registration as a boolean and resets its identity', () => {
        component.formClientCompany.controls.clientCompanyNot.setValue(true);
        component.validationClientCompany();
        expect(component.clientCompany.id).toBeNull();
        component.formClientCompany.controls.clientCompanyNot.setValue(false);
        component.validationClientCompany();
        expect(component.clientCompany).toBeNull();
    });
    it('adds a normalized plate and clears the mileage for the next vehicle', async () => {
        component.formVehicle.controls.vehicleKmEntry.setValue(1234);
        await component.addVehicleEntry();
        expect(component.listVehicleEntry[0].vehiclePlate).toBe('ABC1234');
        expect(component.listVehicleEntry[0].vehicleKmEntry).toBe('1234');
        expect(component.formVehicle.controls.vehicleKmEntry.value).toBeNull();
        expect(component.listChecklist.length).toBe(1);
    });
    it('rejects repeated plates in the pending list', async () => {
        component.listVehicleEntry = [pendingVehicle()];
        await component.addVehicleEntry();
        expect(component.listVehicleEntry.length).toBe(1);
        expect(vehicles.filterFreeAdmission).not.toHaveBeenCalled();
    });
    it('requires owner and driver before adding a vehicle', async () => {
        component.driver = null!;
        await component.addVehicleEntry();
        expect(component.listVehicleEntry.length).toBe(0);
        expect(vehicles.filterFreeAdmission).not.toHaveBeenCalled();
    });
    it('rejects future entry dates and an exit prediction before entry', async () => {
        component.formVehicle.controls.entryDate.setValue(new Date(Date.now() + 60000));
        await component.addVehicleEntry();
        component.formVehicle.patchValue({ entryDate: new Date(), exitDatePrevision: new Date(Date.now() - 60000) });
        await component.addVehicleEntry();
        expect(component.listVehicleEntry.length).toBe(0);
        expect(vehicles.filterFreeAdmission).not.toHaveBeenCalled();
    });
    it('prevents duplicate additions while plate verification is pending', async () => {
        const response = new Subject<ReturnType<typeof ok>>();
        vehicles.filterFreeAdmission.and.returnValue(response as never);
        const pending = component.addVehicleEntry();
        await component.addVehicleEntry();
        expect(vehicles.filterFreeAdmission).toHaveBeenCalledTimes(1);
        component.formVehicle.controls.modelVehicle.setValue(null);
        response.next(ok(null));
        response.complete();
        await pending;
        expect(component.listVehicleEntry.length).toBe(1);
        expect(component.listVehicleEntry[0].modelId).toBe(3);
    });
    it('does not create entries for an empty queue', async () => {
        await component.save();
        expect(vehicles.entrySave).not.toHaveBeenCalled();
    });
    it('preserves photos when vehicle registration fails and reuses the saved checklist', async () => {
        const vehicle = Object.assign(pendingVehicle(), { entryPhoto1Url: 'data:image/jpeg;base64,YQ==' });
        component.listVehicleEntry = [vehicle];
        component.listChecklist = [new VehicleEntryChecklist()];
        vehicles.entrySave.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        expect(vehicle.entryPhoto1Url).toContain('base64');
        expect(vehicle.checklistId).toBe(8);
        expect(component.listVehicleEntry).toEqual([vehicle]);
        expect(component.saving()).toBeFalse();
    });
    it('retries pending photo linkage without creating the entry again', async () => {
        const vehicle = Object.assign(pendingVehicle(), { entryPhoto1Url: 'data:image/jpeg;base64,YQ==' });
        component.listVehicleEntry = [vehicle];
        component.listChecklist = [new VehicleEntryChecklist()];
        vehicles.updateImage.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        expect(vehicle.id).toBe(42);
        expect(component.listVehicleEntry.length).toBe(1);
        expect(vehicles.entrySave.calls.mostRecent().args[0].entryPhoto1Url).toBe('');
        vehicles.updateImage.and.returnValue(of(null));
        await component.save();
        expect(vehicles.entrySave).toHaveBeenCalledTimes(1);
        expect(vehicles.saveChecklist).toHaveBeenCalledTimes(1);
        expect(vehicles.saveImage).toHaveBeenCalledTimes(1);
        expect(vehicles.updateImage).toHaveBeenCalledTimes(2);
        expect(component.listVehicleEntry.length).toBe(0);
    });
    it('retains a failed upload for retry and protects already registered entries from removal', async () => {
        const vehicle = Object.assign(pendingVehicle(), { entryPhoto1Url: 'data:image/jpeg;base64,YQ==' });
        component.listVehicleEntry = [vehicle];
        component.listChecklist = [new VehicleEntryChecklist()];
        vehicles.saveImage.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        expect(vehicle.entryPhoto1Url).toContain('base64');
        component.deleteVehicleEntry(0);
        expect(component.listVehicleEntry.length).toBe(1);
        expect(vehicles.updateImage).not.toHaveBeenCalled();
    });
});
