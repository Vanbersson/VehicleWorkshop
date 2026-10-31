import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import UserComponent from './user.component';
import { User } from '@/app/models/user';
import { UserRole } from '@/app/models/user.role';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { UserService } from '@/app/services/user/user.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { UserRoleService } from '@/app/services/user/user.role.service';
import { PermissionService } from '@/app/services/permission/permission.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { MenuUserService } from '@/app/services/menu/menu-user.service';
import { PhotoService } from '@/app/services/photo/photo.service';

describe('User profile photo preservation', () => {
    let component: UserComponent;
    let service: jasmine.SpyObj<UserService>;
    let existing: User;
    const response = (data: unknown) => new HttpResponse<MessageResponse>({ status: 200, body: { status: StatusSuccessError.succes, header: '', message: '', data } });

    async function saveChanges(): Promise<void> {
        const updated = new Promise<void>((resolve) => {
            service.updateUser.and.callFake((data) => {
                resolve();
                return of(response(data));
            });
        });
        component.saveData();
        await updated;
    }

    beforeEach(() => {
        service = jasmine.createSpyObj<UserService>('UserService', ['filterId', 'updateUser', 'listAll', 'deleteImage', 'uploadImage']);
        existing = Object.assign(new User(), { id: 7, companyId: 1, resaleId: 1, name: 'Usuário', email: 'usuario@example.com', roleId: 2, photoUrl: '/profile/existing.jpg' });
        service.filterId.and.returnValue(of(response(existing)));
        service.updateUser.and.returnValue(of(response(existing)));
        service.listAll.and.returnValue(of(response([])));
        service.deleteImage.and.returnValue(of(response(null)));
        TestBed.configureTestingModule({
            providers: [
                UserComponent,
                { provide: UserService, useValue: service },
                { provide: LoadingService, useValue: { show() {}, hide() {} } },
                { provide: MessageService, useValue: { add() {} } },
                ...[StorageService, UserRoleService, PermissionService, PermissionUserService, MenuUserService, PhotoService].map((provide) => ({ provide, useValue: {} }))
            ]
        });
        component = TestBed.inject(UserComponent);
        component.roles = [Object.assign(new UserRole(), { id: 2, description: 'Atendente' })];
        spyOn<any>(component, 'getMenusUser').and.resolveTo();
        spyOn<any>(component, 'getPermissionUser').and.resolveTo();
    });

    it('keeps the existing photo when saving only personal data', async () => {
        await component.editUser(7);
        component.formUser.controls.name.setValue('Nome atualizado');
        await saveChanges();
        expect(service.updateUser).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Nome atualizado', photoUrl: '/profile/existing.jpg' }));
        expect(service.deleteImage).not.toHaveBeenCalled();
        expect(service.uploadImage).not.toHaveBeenCalled();
    });

    it('discards a cancelled photo deletion when opening another edit', async () => {
        await component.editUser(7);
        component.deletePhoto();
        component.hideDialogUser();
        await component.editUser(7);
        await saveChanges();
        expect(component.userPhoto()).toBe('/profile/existing.jpg');
        expect(service.deleteImage).not.toHaveBeenCalled();
        expect(service.updateUser).toHaveBeenCalledWith(jasmine.objectContaining({ photoUrl: '/profile/existing.jpg' }));
    });

    it('clears pending photo changes when starting a new registration', () => {
        component.isPhotoNew = true;
        component.isPhotoDelete = true;
        component.showDialogSave();
        expect(component.isPhotoNew).toBeFalse();
        expect(component.isPhotoDelete).toBeFalse();
    });

    it('removes the photo when explicitly requested', async () => {
        await component.editUser(7);
        component.deletePhoto();
        await saveChanges();
        expect(service.deleteImage).toHaveBeenCalled();
        expect(service.updateUser).toHaveBeenCalledWith(jasmine.objectContaining({ photoUrl: '' }));
    });
});
