import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
//PrimeNG
import { PopoverModule } from 'primeng/popover';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

import { YesNotEnum } from '@/app/models/yes.not.enum';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { NotificationService } from '@/app/services/notification/notification.service';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { ShareWhatsappService } from '@/app/services/share/share.whatsapp.service';
import { Notification } from '@/app/models/notification/notification';

interface IDelNotification {
    companyId: number;
    resaleId: number;
    notificationId: number;
}

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule, PopoverModule, ButtonModule, BadgeModule, ToastModule, PaginatorModule, ConfirmDialogModule, OverlayBadgeModule],
    templateUrl: './notification.component.html',
    styleUrl: './notification.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class NotificationComponent implements OnInit {
    listMessage = signal<Notification[]>([]);
    Yes = YesNotEnum.YES;
    Not = YesNotEnum.NOT;
    readonly loading = signal(false);
    readonly working = signal(false);
    readonly loadError = signal('');
    readonly panelVisible = signal(false);
    readonly selectedFilter = signal<'ALL' | 'ENTRY' | 'EXIT'>('ALL');
    readonly first = signal(0);
    readonly filteredMessages = computed(() => this.listMessage().filter((item) => this.selectedFilter() === 'ALL' || this.notificationKind(item) === this.selectedFilter()));
    readonly pageMessages = computed(() => this.filteredMessages().slice(this.first(), this.first() + 8));

    notificationKind(item: Notification): 'ALL' | 'ENTRY' | 'EXIT' {
        if (item.origNotificationMenu === 'Concierge_Vehicle_Entry') return 'ENTRY';
        if (item.origNotificationMenu === 'Concierge_Vehicle_Exit') return 'EXIT';
        return 'ALL';
    }
    changeFilter(value: 'ALL' | 'ENTRY' | 'EXIT'): void {
        this.selectedFilter.set(value);
        this.first.set(0);
    }

    constructor(
        private loadingService: LoadingService,
        private confirmationService: ConfirmationService,
        private shareWhatsAppService: ShareWhatsappService,
        private storageService: StorageService,
        private permissionUserService: PermissionUserService,
        private messageService: MessageService,
        private router: Router,
        private notificationService: NotificationService,
        private vehicleService: VehicleEntryService
    ) {}

    ngOnInit(): void {
        this.init(true);
    }

    async init(_click: boolean): Promise<void> {
        if (this.loading()) return;
        this.loading.set(true);
        this.loadError.set('');
        try {
            this.listMessage.set(await lastValueFrom(this.notificationService.filterUser(this.storageService.id)));
            if (this.first() >= this.filteredMessages().length) this.first.set(0);
        } catch (error: unknown) {
            this.loadError.set('Não foi possível carregar as notificações. Tente novamente.');
        } finally {
            this.loading.set(false);
        }
    }
    getTempoDecorrido(value: string | Date): string {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return 'Data não informada';
        const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
        if (!minutes) return 'Agora';
        if (minutes < 60) return minutes + ' min atrás';
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + ' h atrás';
        const days = Math.floor(hours / 24);
        return days + (days === 1 ? ' dia atrás' : ' dias atrás');
    }
    formatDateTime(date: Date): string {
        const datePipe = new DatePipe('en-US');

        // Obtém o fuso horário local no formato ±hh:mm
        const tzOffset = -date.getTimezoneOffset();
        const sign = tzOffset >= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(tzOffset) / 60)
            .toString()
            .padStart(2, '0');
        const minutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
        const timezone = `${sign}${hours}:${minutes}`;

        // Formata a data e adiciona o fuso horário
        return datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") + timezone;
    }
    firstName(name: string): string {
        return name.split(' ')[0];
    }
    async editVehicle(id: string) {
        /* PERMISSION - 100 */
        /* EDITAR ENTRADA DO VEÍCULO */
        const permission = await this.searchPermission(100);
        if (!permission) {
            return;
        }
        // this.overlayPanel.hide();
        this.router.navigateByUrl(`concierge/vehicle/maintenance/${id}`);
    }
    private async searchPermission(permission: number): Promise<boolean> {
        try {
            const result = await lastValueFrom(this.permissionUserService.filterPermission(this.storageService.companyId, this.storageService.resaleId, this.storageService.id, permission));
            if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
                return true;
            } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
                this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
            }
            return false;
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return false;
        }
    }

    async shareVehicle(id: string) {
        //Show load
        this.loadingService.show();
        const result = await this.getVehicleEntry(Number.parseInt(id));
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
            this.shareNotification(result.body.data);
        }
        //Close load
        this.loadingService.hide();
    }
    /* Share vehicle data via WhatsApp */
    private shareNotification(vehicle: VehicleEntry) {
        this.shareWhatsAppService.shareVehicle(vehicle);
    }
    /* delete notification   */
    async deleteMessage(no: Notification) {
        if (this.working() || this.loading()) return;
        this.working.set(true);
        try {
            let not: IDelNotification = {
                companyId: no.companyId!,
                resaleId: no.resaleId!,
                notificationId: no.id!
            };
            const result = await this.deleteNotitication(not);
            if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
                this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
                await this.init(false);
            } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
                this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
            }
        } finally {
            this.working.set(false);
        }
    }
    /* Delete All notification   */
    async deleteAllMessage() {
        if (this.working() || this.loading()) return;
        this.working.set(true);
        try {
            for (let no of this.listMessage()) {
                let not: IDelNotification = {
                    companyId: no.companyId!,
                    resaleId: no.resaleId!,
                    notificationId: no.id!
                };
                const result = await this.deleteNotitication(not);
                if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
                    this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
                } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
                    this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
                }
            }
            await this.init(false);
        } finally {
            this.working.set(false);
        }
    }
    private async getVehicleEntry(vehicleId: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entryFilterId(vehicleId));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return error;
        }
    }

    private async deleteNotitication(no: any): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.notificationService.deleteNotification(no));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return error;
        }
    }

    confirm() {
        this.confirmationService.confirm({
            header: 'Apagar todas as notificações?',
            message: 'As ' + this.listMessage().length + ' notificações serão removidas, incluindo as de outros filtros.',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Apagar todas',
            rejectLabel: 'Voltar',
            acceptButtonStyleClass: 'p-button-danger',
            rejectButtonStyleClass: 'p-button-text p-button-secondary',
            accept: () => {
                this.deleteAllMessage();
            },
            reject: () => {}
        });
    }
}
