import { VehiclePrintService } from '@/app/services/vehicle/vehicle.print.service';
import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { of, Subject, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import VehicleMaintenanceComponent from './vehicle.maintenance.component';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { Salesperson } from '@/app/models/crm/salesperson';
import { Driver } from '@/app/models/driver';
import { VehicleModel } from '@/app/models/vehicle.model';
import { StatusVehicleEnum } from '@/app/models/status.vehicle.enum';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
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
    let users: jasmine.SpyObj<SalespersonService>;
    let messages: jasmine.SpyObj<MessageService>;
    let loading: jasmine.SpyObj<LoadingService>;
    let vehicle: VehicleEntry;
    const ok = (data: unknown) => new HttpResponse({ status: 200, body: { status: StatusSuccessError.succes, header: '', message: '', data } });
    beforeEach(() => {
        vehicles = jasmine.createSpyObj('Vehicles', ['entryFilterId', 'entryUpdate', 'saveImage', 'deleteImage', 'entryAddAuth', 'entryDeleteAuth1', 'entryDeleteAuth2', 'history']);
        users = jasmine.createSpyObj('Users', ['listAll']);
        messages = jasmine.createSpyObj('Messages', ['add']);
        loading = jasmine.createSpyObj('Loading', ['show', 'hide']);
        const model = Object.assign(new VehicleModel(), { id: 3, description: 'Truck' });
        const attendant = Object.assign(new Salesperson(), { id: 9, name: 'Maria', status: 'Habilitado' });
        vehicle = Object.assign(new VehicleEntry(), {
            id: 42,
            modelId: 3,
            salespersonId: 9,
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
        users.listAll.and.returnValue(of([attendant]) as never);
        TestBed.configureTestingModule({
            providers: [
                VehicleMaintenanceComponent,
                { provide: VehiclePrintService, useValue: { print: () => Promise.resolve() } },
                { provide: VehicleEntryService, useValue: vehicles },
                { provide: SalespersonService, useValue: users },
                { provide: MessageService, useValue: messages },
                { provide: LoadingService, useValue: loading },
                { provide: VehicleModelService, useValue: { getAllEnabled: () => of([model]) } },
                { provide: ActivatedRoute, useValue: { snapshot: { params: {} } } },
                { provide: Router, useValue: { url: '/concierge/vehicle/maintenance', navigateByUrl() {}, navigate() {} } },
                { provide: Location, useValue: { getState: () => ({ vehicleEntry: vehicle }), replaceState() {} } },
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
        component.vehicleEntry = vehicle;
    });
    it('loads the selected attendant before populating the form', async () => {
        const response = new Subject<Salesperson[]>();
        users.listAll.and.returnValue(response as never);
        const pending = component.init();
        expect(component.loading()).toBeTrue();
        expect(vehicles.entryFilterId).not.toHaveBeenCalled();
        response.next([Object.assign(new Salesperson(), { id: 9, name: 'Maria', status: 'Habilitado' })]);
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

    it('loads every passage and orders the most recent entry first', async () => {
        await component.init();
        const older = Object.assign(new VehicleEntry(), { id: 10, entryDate: '2024-01-01T10:00:00Z' });
        vehicles.history.and.returnValue(of([older, vehicle]));
        await component.showHistory();
        expect(vehicles.history).toHaveBeenCalledWith(42);
        expect(component.historyPassages().map((v) => v.id)).toEqual([42, 10]);
        expect(component.timelineVisible).toBeTrue();
        expect(component.historyLoading()).toBeFalse();
    });
    it('builds chronological entry, authorizations and exit events without invalid dates', () => {
        const passage = Object.assign(new VehicleEntry(), {
            entryDate: '2024-01-01T10:00:00Z',
            auth1ExitDate: '2024-01-01T12:00:00Z',
            auth2ExitDate: 'invalid',
            exitDate: '2024-01-01T14:00:00Z',
            entryInformation: 'Arrival note',
            exitInformation: 'Exit note'
        });
        const events = component.historyEvents(passage);
        expect(events.length).toBe(3);
        expect(events.map((e) => e.icon)).toEqual(['pi-sign-in', 'pi-check-circle', 'pi-sign-out']);
        expect(events[0].notes).toBe('Arrival note');
        expect(events[2].notes).toBe('Exit note');
    });
    it('offers retry after history loading fails', async () => {
        await component.init();
        vehicles.history.and.returnValue(throwError(() => new Error('offline')));
        await component.showHistory();
        expect(component.historyError()).toBeTruthy();
        expect(component.historyLoading()).toBeFalse();
        vehicles.history.and.returnValue(of([vehicle]));
        await component.showHistory();
        expect(component.historyError()).toBe('');
        expect(component.historyPassages()).toEqual([vehicle]);
    });
    it('ignores pending history when the dialog closes or the attendance changes', async () => {
        await component.init();
        const response = new Subject<VehicleEntry[]>();
        vehicles.history.and.returnValue(response);
        const pending = component.showHistory();
        component.closeHistory();
        response.next([vehicle]);
        response.complete();
        await pending;
        expect(component.historyPassages()).toEqual([]);
        expect(component.timelineVisible).toBeFalse();
    });
    it('makes the identity limitation explicit for unplated vehicles', async () => {
        vehicle.vehicleNew = YesNotEnum.YES;
        vehicle.vehiclePlate = '';
        await component.init();
        vehicles.history.and.returnValue(of([vehicle]));
        await component.showHistory();
        expect(component.historyLimited()).toBeTrue();
    });
    it('asks before discarding unsaved changes while opening another attendance', async () => {
        await component.init();
        const router = TestBed.inject(Router);
        const navigate = spyOn(component, 'changerVehicle').and.resolveTo();
        const confirmation = TestBed.inject(ConfirmationService);
        confirmation.confirm = jasmine.createSpy('confirm');
        component.formVehicle.markAsDirty();
        await component.openHistoryAttendance(Object.assign(new VehicleEntry(), { id: 10 }));
        expect(navigate).not.toHaveBeenCalled();
        const config = (confirmation.confirm as jasmine.Spy).calls.mostRecent().args[0];
        config.accept();
        expect(navigate).toHaveBeenCalledWith(10);
    });
    it('opens a previous attendance and keeps the current attendance non-navigable', async () => {
        await component.init();
        const navigate = spyOn(component, 'changerVehicle').and.resolveTo();
        await component.openHistoryAttendance(vehicle);
        expect(navigate).not.toHaveBeenCalled();
        await component.openHistoryAttendance(Object.assign(new VehicleEntry(), { id: 10 }));
        expect(navigate).toHaveBeenCalledWith(10);
    });

    it('prints current editable values and disabled fields without saving them', async () => {
        await component.init();
        const print = spyOn(TestBed.inject(VehiclePrintService), 'print').and.resolveTo();
        component.formVehicle.controls.numNfe.setValue('NFE-EDIT');
        component.formVehicle.markAsDirty();
        await component.printVehicle();
        const data = print.calls.mostRecent().args[0];
        expect(data.vehicle.id).toBe(42);
        expect(data.vehicle.numNfe).toBe('NFE-EDIT');
        expect(vehicle.numNfe).toBe('');
        expect(vehicles.entryUpdate).not.toHaveBeenCalled();
        expect(component.printing()).toBeFalse();
    });
    it('prints exited records using raw disabled form values', async () => {
        vehicle.status = StatusVehicleEnum.EXITED;
        await component.init();
        const print = spyOn(TestBed.inject(VehiclePrintService), 'print').and.resolveTo();
        await component.printVehicle();
        expect(print.calls.mostRecent().args[0].vehicle.vehiclePlate).toBe('ABC1234');
        expect(print.calls.mostRecent().args[0].vehicle.status).toBe(StatusVehicleEnum.EXITED);
    });
    it('prevents duplicate printing while preparation or the dialog is pending', async () => {
        await component.init();
        let finish!: () => void;
        const pending = new Promise<void>((resolve) => (finish = resolve));
        const print = spyOn(TestBed.inject(VehiclePrintService), 'print').and.returnValue(pending);
        const first = component.printVehicle();
        await component.printVehicle();
        expect(print).toHaveBeenCalledTimes(1);
        finish();
        await first;
        expect(component.printing()).toBeFalse();
    });
    it('releases the print action and reports failures', async () => {
        await component.init();
        spyOn(TestBed.inject(VehiclePrintService), 'print').and.rejectWith(new Error('Print failed'));
        await component.printVehicle();
        expect(component.printing()).toBeFalse();
        expect(messages.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'Print failed' }));
    });
});
