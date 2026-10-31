import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { of, Subject, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import VehicleMaintenanceComponent from './vehicle.maintenance.component';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { User } from '@/app/models/user';
import { Driver } from '@/app/models/driver';
import { VehicleModel } from '@/app/models/vehicle.model';
import { StatusVehicleEnum } from '@/app/models/status.vehicle.enum';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { UserService } from '@/app/services/user/user.service';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { DriverService } from '@/app/services/driver/driver.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { BudgetService } from '@/app/services/budget/budget.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { ShareWhatsappService } from '@/app/services/share/share.whatsapp.service';

registerLocaleData(localePt);
describe('Vehicle maintenance', () => {
    let component: VehicleMaintenanceComponent;
    let vehicles: jasmine.SpyObj<VehicleEntryService>;
    let users: jasmine.SpyObj<UserService>;
    let messages: jasmine.SpyObj<MessageService>;
    let loading: jasmine.SpyObj<LoadingService>;
    let vehicle: VehicleEntry;
    const ok = (data: unknown) => new HttpResponse({ status: 200, body: { status: StatusSuccessError.succes, header: '', message: '', data } });
    beforeEach(() => {
        vehicles = jasmine.createSpyObj('Vehicles', ['entryFilterId', 'entryUpdate', 'saveImage', 'deleteImage', 'entryAddAuth', 'entryDeleteAuth1', 'entryDeleteAuth2']);
        users = jasmine.createSpyObj('Users', ['filterRoleId']);
        messages = jasmine.createSpyObj('Messages', ['add']);
        loading = jasmine.createSpyObj('Loading', ['show', 'hide']);
        const model = Object.assign(new VehicleModel(), { id: 3, description: 'Truck' });
        const attendant = Object.assign(new User(), { id: 9, name: 'Maria' });
        vehicle = Object.assign(new VehicleEntry(), {
            id: 42,
            modelId: 3,
            attendantUserId: 9,
            entryDate: new Date(Date.now() - 60000),
            exitDate: null,
            exitDatePrevision: null,
            vehiclePlate: 'ABC1234',
            vehicleNew: YesNotEnum.NOT,
            vehicleServiceOrder: YesNotEnum.YES,
            attendantPhoto1Url: '/consultant.jpg',
            entryPhoto1Url: '/entry.jpg'
        });
        vehicles.entryFilterId.and.returnValue(of(ok(vehicle)) as never);
        vehicles.entryUpdate.and.returnValue(of(ok(vehicle)) as never);
        users.filterRoleId.and.returnValue(of(ok([attendant])) as never);
        TestBed.configureTestingModule({
            providers: [
                VehicleMaintenanceComponent,
                { provide: VehicleEntryService, useValue: vehicles },
                { provide: UserService, useValue: users },
                { provide: MessageService, useValue: messages },
                { provide: LoadingService, useValue: loading },
                { provide: VehicleModelService, useValue: { getAllEnabled: () => of([model]) } },
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
                { provide: Router, useValue: { navigateByUrl() {} } },
                { provide: DriverService, useValue: {} },
                { provide: ClientCompanyService, useValue: {} },
                { provide: BudgetService, useValue: {} },
                { provide: PermissionUserService, useValue: {} },
                { provide: PhotoService, useValue: {} },
                { provide: ConfirmationService, useValue: {} },
                { provide: ShareWhatsappService, useValue: {} },
                { provide: StorageService, useValue: { roleFunc: StatusRoleFuncEnum.ADMIN } }
            ]
        });
        component = TestBed.inject(VehicleMaintenanceComponent);
    });
    it('loads the selected attendant before populating the form', async () => {
        const response = new Subject<ReturnType<typeof ok>>();
        users.filterRoleId.and.returnValue(response as never);
        const pending = component.init();
        expect(component.loading()).toBeTrue();
        expect(vehicles.entryFilterId).not.toHaveBeenCalled();
        response.next(ok([Object.assign(new User(), { id: 9, name: 'Maria' })]));
        response.complete();
        await pending;
        expect(component.formVehicle.controls.attendant.value?.id).toBe(9);
        expect(component.ready()).toBeTrue();
    });
    it('keeps entry photos unchanged when removing a consultant photo', async () => {
        await component.init();
        await component.deleteFileVehicle1();
        expect(vehicle.entryPhoto1Url).toBe('/entry.jpg');
        expect(vehicle.attendantPhoto1Url).toBe('/consultant.jpg');
        expect(component.photoVehicle1()).toBe('');
        expect(component.isPhotoDelete1).toBeTrue();
    });
    it('makes exited vehicles read only and blocks mutations', async () => {
        vehicle.status = StatusVehicleEnum.EXITED;
        await component.init();
        expect(component.vehicleExit).toBeTrue();
        expect(component.formVehicle.disabled).toBeTrue();
        await component.save();
        await component.authExit();
        await component.deleteAuth1();
        expect(vehicles.entryUpdate).not.toHaveBeenCalled();
        expect(vehicles.entryAddAuth).not.toHaveBeenCalled();
        expect(vehicles.entryDeleteAuth1).not.toHaveBeenCalled();
    });
    it('resets photo flags and driver data on a new load', async () => {
        await component.init();
        component.isPhotoDelete1 = true;
        component.driverExit = Object.assign(new Driver(), { id: 99 });
        component.driverExitPhoto = '/old.jpg';
        await component.init();
        expect(component.isPhotoDelete1).toBeFalse();
        expect(component.driverExit).toBeNull();
        expect(component.driverExitPhoto).toBe('');
        expect(component.formDriver.controls.driverEntryName.value).toBe('');
    });
    it('shows a recoverable error when loading fails', async () => {
        vehicles.entryFilterId.and.returnValue(throwError(() => new Error('offline')));
        await component.init();
        expect(component.ready()).toBeFalse();
        expect(component.loading()).toBeFalse();
        expect(component.loadError()).toBeTruthy();
        vehicles.entryFilterId.and.returnValue(of(ok(vehicle)) as never);
        await component.init();
        expect(component.ready()).toBeTrue();
        expect(component.loadError()).toBe('');
    });
    it('keeps a failed upload pending without clearing the existing photo', async () => {
        await component.init();
        component.driverEntry = Object.assign(new Driver(), { id: 1 });
        component.photoVehicle1.set('data:image/jpeg;base64,YQ==');
        component.isPhotoNew1 = true;
        vehicles.saveImage.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        expect(component.isPhotoNew1).toBeTrue();
        expect(vehicle.attendantPhoto1Url).toBe('/consultant.jpg');
        expect(vehicles.entryUpdate).not.toHaveBeenCalled();
        expect(component.saving()).toBeFalse();
        expect(loading.hide).toHaveBeenCalled();
    });
    it('prevents duplicate saves while the first request is pending', async () => {
        await component.init();
        component.driverEntry = Object.assign(new Driver(), { id: 1 });
        const response = new Subject<ReturnType<typeof ok>>();
        vehicles.entryUpdate.and.returnValue(response as never);
        const pending = component.save();
        await component.save();
        expect(vehicles.entryUpdate).toHaveBeenCalledTimes(1);
        response.next(ok(vehicle));
        response.complete();
        await pending;
        expect(component.saving()).toBeFalse();
    });
    it('blocks saving when linked driver data cannot be loaded', async () => {
        vehicle.driverEntryId = 5;
        const drivers = TestBed.inject(DriverService);
        drivers.filterId = jasmine.createSpy('filterId').and.returnValue(throwError(() => new Error('offline')));
        await component.init();
        expect(component.ready()).toBeFalse();
        expect(component.loadError()).toBeTruthy();
        await component.save();
        expect(vehicles.entryUpdate).not.toHaveBeenCalled();
    });
    it('rejects invalid dates without submitting the vehicle', async () => {
        await component.init();
        component.driverEntry = Object.assign(new Driver(), { id: 1 });
        component.formVehicle.controls.entryDate.setValue(new Date('invalid'));
        await component.save();
        expect(vehicles.entryUpdate).not.toHaveBeenCalled();
        expect(component.formVehicle.controls.entryDate.touched).toBeTrue();
        expect(component.saving()).toBeFalse();
    });
});
