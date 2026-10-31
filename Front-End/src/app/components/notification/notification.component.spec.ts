import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NotificationComponent } from './notification.component';
import { Notification } from '@/app/models/notification/notification';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { NotificationService } from '@/app/services/notification/notification.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { ShareWhatsappService } from '@/app/services/share/share.whatsapp.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';

describe('Vehicle notifications', () => {
    let component: NotificationComponent;
    let notifications: jasmine.SpyObj<NotificationService>;
    let permissions: jasmine.SpyObj<PermissionUserService>;
    let vehicles: jasmine.SpyObj<VehicleEntryService>;
    let share: jasmine.SpyObj<ShareWhatsappService>;
    let confirm: jasmine.SpyObj<ConfirmationService>;
    let router: jasmine.SpyObj<Router>;
    const entry = Object.assign(new Notification(), { id: 1, companyId: 1, resaleId: 2, origId: '42', origNotificationMenu: 'Concierge_Vehicle_Entry', header: 'Entrada de Veículo' });
    const exit = Object.assign(new Notification(), { id: 2, companyId: 1, resaleId: 2, origId: '43', origNotificationMenu: 'Concierge_Vehicle_Exit', header: 'Saída de Veículo' });
    const success = { status: StatusSuccessError.succes, header: '', message: '', data: null };
    beforeEach(() => {
        notifications = jasmine.createSpyObj<NotificationService>('Notifications', ['filterUser', 'deleteNotification']);
        permissions = jasmine.createSpyObj<PermissionUserService>('Permissions', ['filterPermission']);
        vehicles = jasmine.createSpyObj<VehicleEntryService>('Vehicles', ['entryFilterId']);
        share = jasmine.createSpyObj<ShareWhatsappService>('Share', ['shareVehicle']);
        confirm = jasmine.createSpyObj<ConfirmationService>('Confirmation', ['confirm']);
        router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
        notifications.filterUser.and.returnValue(of([entry, exit]));
        notifications.deleteNotification.and.returnValue(of(new HttpResponse({ body: success })));
        TestBed.configureTestingModule({
            providers: [
                NotificationComponent,
                { provide: NotificationService, useValue: notifications },
                { provide: PermissionUserService, useValue: permissions },
                { provide: VehicleEntryService, useValue: vehicles },
                { provide: ShareWhatsappService, useValue: share },
                { provide: ConfirmationService, useValue: confirm },
                { provide: MessageService, useValue: { add() {} } },
                { provide: Router, useValue: router },
                { provide: LoadingService, useValue: { show() {}, hide() {} } },
                { provide: StorageService, useValue: { id: 7, companyId: 1, resaleId: 2 } }
            ]
        });
        component = TestBed.inject(NotificationComponent);
    });
    it('filters entries and exits without losing the complete list', async () => {
        await component.init(true);
        expect(notifications.filterUser).toHaveBeenCalledWith(7);
        component.first.set(8);
        component.changeFilter('ENTRY');
        expect(component.pageMessages()).toEqual([entry]);
        expect(component.first()).toBe(0);
        component.changeFilter('EXIT');
        expect(component.filteredMessages()).toEqual([exit]);
        component.changeFilter('ALL');
        expect(component.filteredMessages()).toEqual([entry, exit]);
    });
    it('preserves the last loaded messages on failure and allows retrying', async () => {
        await component.init(true);
        notifications.filterUser.and.returnValue(throwError(() => new Error('Offline')));
        await component.init(true);
        expect(component.loadError()).toBeTruthy();
        expect(component.listMessage()).toEqual([entry, exit]);
        expect(component.loading()).toBeFalse();
        notifications.filterUser.and.returnValue(of([]));
        await component.init(true);
        expect(component.loadError()).toBe('');
        expect(component.listMessage()).toEqual([]);
    });
    it('checks vehicle permissions before navigation', async () => {
        permissions.filterPermission.and.returnValue(of(new HttpResponse({ body: { ...success, status: StatusSuccessError.error } })));
        await component.editVehicle('42');
        expect(router.navigateByUrl).not.toHaveBeenCalled();
        permissions.filterPermission.and.returnValue(of(new HttpResponse({ body: success })));
        await component.editVehicle('42');
        expect(permissions.filterPermission).toHaveBeenCalledWith(1, 2, 7, 100);
        expect(router.navigateByUrl).toHaveBeenCalledWith('concierge/vehicle/maintenance/42');
    });
    it('preserves sharing and refreshes after removing a notification', async () => {
        const vehicle = new VehicleEntry();
        vehicles.entryFilterId.and.returnValue(of(new HttpResponse({ body: { ...success, data: vehicle } })));
        await component.shareVehicle('42');
        expect(share.shareVehicle).toHaveBeenCalledWith(vehicle);
        await component.deleteMessage(entry);
        expect(notifications.deleteNotification).toHaveBeenCalledWith(jasmine.objectContaining({ companyId: 1, resaleId: 2, notificationId: 1 }));
        expect(notifications.filterUser).toHaveBeenCalled();
        expect(component.working()).toBeFalse();
    });
    it('makes clear that deleting all affects all filters', async () => {
        await component.init(true);
        component.changeFilter('ENTRY');
        component.confirm();
        expect(confirm.confirm.calls.mostRecent().args[0].message).toContain('2 notificações');
        expect(confirm.confirm.calls.mostRecent().args[0].message).toContain('outros filtros');
        expect(notifications.deleteNotification).not.toHaveBeenCalled();
    });
    it('formats relative timestamps for both Date and string values', () => {
        expect(component.getTempoDecorrido(new Date())).toBe('Agora');
        expect(component.getTempoDecorrido(new Date(Date.now() - 2 * 60_000).toISOString())).toBe('2 min atrás');
        expect(component.getTempoDecorrido('invalid')).toBe('Data não informada');
    });
});
