import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { AppTopbar } from './app.topbar';
import { LayoutService } from '@/app/layout/service/layout.service';
import { UserService } from '@/app/services/user/user.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { UserProfileComponent } from '@/app/components/user.profile/user.profile.component';
import { LogoutComponent } from '@/app/components/logout/logout.component';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { User } from '@/app/models/user';

describe('Topbar account actions', () => {
    let component: AppTopbar;
    let users: jasmine.SpyObj<UserService>;
    let storage: { name: string; id: number };
    const config = signal({ darkTheme: false });
    beforeEach(() => {
        config.set({ darkTheme: false });
        storage = { name: 'Maria da Silva', id: 7 };
        users = jasmine.createSpyObj<UserService>('UserService', ['filterId']);
        TestBed.configureTestingModule({
            providers: [
                AppTopbar,
                { provide: LayoutService, useValue: { layoutConfig: config } },
                { provide: UserService, useValue: users },
                { provide: StorageService, useValue: storage },
                { provide: LoadingService, useValue: { show() {}, hide() {} } }
            ]
        });
        component = TestBed.inject(AppTopbar);
    });
    it('shows the first and last initials and handles an empty user name', () => {
        expect(component.userInitials()).toBe('MS');
        storage.name = 'João';
        expect(component.userInitials()).toBe('J');
        storage.name = '   ';
        expect(component.userInitials()).toBe('U');
    });
    it('preserves the light and dark theme toggle', () => {
        component.toggleDarkMode();
        expect(config().darkTheme).toBeTrue();
        component.toggleDarkMode();
        expect(config().darkTheme).toBeFalse();
    });
    it('loads the current user before opening the profile and keeps the logout flow', async () => {
        const user = Object.assign(new User(), { id: 7, name: storage.name });
        users.filterId.and.returnValue(of(new HttpResponse({ status: 200, body: { status: StatusSuccessError.succes, header: '', message: '', data: user } })));
        component.appuserprofile = jasmine.createSpyObj<UserProfileComponent>('UserProfile', ['showUser']);
        component.appLogout = jasmine.createSpyObj<LogoutComponent>('Logout', ['exit']);
        await component.profile();
        expect(users.filterId).toHaveBeenCalledWith(7);
        expect(component.appuserprofile.showUser).toHaveBeenCalledWith(user);
        component.logout();
        expect(component.appLogout.exit).toHaveBeenCalled();
    });
});
