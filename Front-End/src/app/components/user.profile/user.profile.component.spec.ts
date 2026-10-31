import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { UserProfileComponent } from './user.profile.component';
import { User } from '@/app/models/user';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { UserService } from '@/app/services/user/user.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';

describe('User profile', () => {
    let component: UserProfileComponent;
    let users: jasmine.SpyObj<UserService>;
    beforeEach(() => {
        users = jasmine.createSpyObj<UserService>('Users', ['updateUser', 'uploadImage', 'deleteImage']);
        TestBed.configureTestingModule({
            providers: [
                UserProfileComponent,
                { provide: UserService, useValue: users },
                { provide: PhotoService, useValue: {} },
                { provide: StorageService, useValue: { companyId: 1, resaleId: 2, id: 7 } },
                { provide: LoadingService, useValue: { show() {}, hide() {} } },
                { provide: MessageService, useValue: { add() {} } }
            ]
        });
        component = TestBed.inject(UserProfileComponent);
    });
    it('keeps the existing photo when saving personal data', async () => {
        const user = Object.assign(new User(), { name: 'Maria', photoUrl: '/photos/profile.jpg' });
        users.updateUser.and.returnValue(of(new HttpResponse({ body: { status: StatusSuccessError.succes, header: '', message: '', data: user } })));
        component.showUser(user);
        component.userForm.controls.name.setValue('Maria Silva');
        await component.save();
        expect(users.updateUser).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Maria Silva', photoUrl: '/photos/profile.jpg' }));
        expect(users.deleteImage).not.toHaveBeenCalled();
        expect(users.uploadImage).not.toHaveBeenCalled();
    });
    it('resets pending photo changes when opening a profile', () => {
        component.isDeletePhoto = true;
        component.isAddPhoto = true;
        component.showUser(Object.assign(new User(), { name: 'Maria', photoUrl: '/photos/profile.jpg' }));
        expect(component.isDeletePhoto).toBeFalse();
        expect(component.isAddPhoto).toBeFalse();
        expect(component.userPhotoUrl()).toBe('/photos/profile.jpg');
    });
    it('reveals required fields without saving an invalid form', async () => {
        component.showUser(new User());
        await component.save();
        expect(component.userForm.controls.name.touched).toBeTrue();
        expect(users.updateUser).not.toHaveBeenCalled();
    });
});
