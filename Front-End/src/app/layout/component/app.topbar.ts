import { Component, inject, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';
import { LogoutComponent } from '@/app/components/logout/logout.component';
import { UserProfileComponent } from '@/app/components/user.profile/user.profile.component';
import { UserService } from '@/app/services/user/user.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { MessageResponse } from '@/app/models/message-response';
import { lastValueFrom } from 'rxjs';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';

import { NotificationComponent } from '@/app/components/notification/notification.component';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, LogoutComponent, UserProfileComponent, NotificationComponent],
    template: `
        <header class="layout-topbar" aria-label="Barra superior">
            <div class="topbar-start layout-topbar-logo-container">
                <button
                    type="button"
                    class="layout-menu-button layout-topbar-action"
                    (click)="layoutService.onMenuToggle()"
                    aria-label="Alternar menu lateral"
                    title="Menu lateral"
                    [attr.aria-expanded]="layoutService.isSidebarActive() || (!layoutService.layoutState().staticMenuDesktopInactive && !layoutService.isOverlay() && layoutService.isDesktop())"
                >
                    <i class="pi pi-bars" aria-hidden="true"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/" aria-label="ATENA TRUCK - P?gina inicial"
                    ><span class="topbar-brand-icon"><i class="pi pi-truck" aria-hidden="true"></i></span
                    ><span class="topbar-brand-text"
                        ><strong>ATENA <span>TRUCK</span></strong
                        ><small>Gestão de oficinas</small></span
                    ></a
                >
            </div>
            <div class="topbar-workspace"><span class="workspace-dot" aria-hidden="true"></span><span>Seu espaço de trabalho</span></div>
            <div class="layout-topbar-actions">
                <div class="layout-config-menu" aria-label="Apar?ncia">
                    <button
                        type="button"
                        class="layout-topbar-action"
                        (click)="toggleDarkMode()"
                        [attr.aria-label]="layoutService.isDarkTheme() ? 'Ativar tema claro' : 'Ativar tema escuro'"
                        [title]="layoutService.isDarkTheme() ? 'Ativar tema claro' : 'Ativar tema escuro'"
                    >
                        <i [class]="layoutService.isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true"></i>
                    </button>
                    <div class="relative">
                        <button
                            type="button"
                            class="layout-topbar-action"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                            aria-label="Personalizar apar?ncia"
                            title="Personalizar apar?ncia"
                        >
                            <i class="pi pi-palette" aria-hidden="true"></i>
                        </button>
                        <app-configurator />
                    </div>
                </div>
                <div class="topbar-divider" aria-hidden="true"></div>
                <button
                    type="button"
                    class="layout-topbar-menu-button layout-topbar-action"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                    aria-label="Abrir op??es da conta"
                    title="Op??es da conta"
                >
                    <i class="pi pi-ellipsis-v" aria-hidden="true"></i>
                </button>
                <div class="layout-topbar-menu hidden">
                    <div class="layout-topbar-menu-content">
                        <app-notification />
                        <button type="button" class="topbar-user-button" (click)="profile()" [attr.aria-label]="'Abrir perfil de ' + (storageService.name || 'usu?rio')" title="Meu perfil">
                            <span class="topbar-avatar" aria-hidden="true">{{ userInitials() }}</span
                            ><span class="topbar-user-info"
                                ><strong>{{ storageService.name || 'Usu?rio' }}</strong
                                ><small>{{ storageService.roleDesc || 'Meu perfil' }}</small></span
                            ><i class="pi pi-angle-down topbar-user-chevron" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="layout-topbar-action topbar-logout" (click)="logout()" aria-label="Sair do sistema" title="Sair do sistema"><i class="pi pi-sign-out" aria-hidden="true"></i><span>Sair</span></button>
                    </div>
                </div>
            </div>
        </header>
        <app-logout #applogout />
        <app-userprofile #appuserprofile />
    `
})
export class AppTopbar {
    layoutService = inject(LayoutService);

    loading = inject(LoadingService);
    userService = inject(UserService);
    storageService = inject(StorageService);

    @ViewChild('applogout') appLogout!: LogoutComponent;

    @ViewChild('appuserprofile') appuserprofile!: UserProfileComponent;

    userInitials(): string {
        const names = (this.storageService.name || 'Usu?rio').trim().split(/\s+/).filter(Boolean);
        return (names[0]?.charAt(0) || 'U').toUpperCase() + (names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '');
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    logout() {
        this.appLogout.exit();
    }

    async profile() {
        this.loading.show();
        const restult = await this.finterUserId(this.storageService.id);
        this.loading.hide();
        if (restult.status == 200 && restult.body?.status == StatusSuccessError.succes) {
            this.appuserprofile.showUser(restult.body.data);
        }
    }

    private async finterUserId(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.userService.filterId(id));
        } catch (error) {
            let er: MessageResponse = new MessageResponse();
            er.header = 'Atenção';
            er.status = StatusSuccessError.error;
            if (error instanceof HttpErrorResponse) {
                er.message = error.error?.message ?? error.message;
            } else {
                er.message = 'Erro ao atualizar o usuário.';
            }
            return new HttpResponse<MessageResponse>({
                body: er,
                status: 401
            });
        }
    }
}
