import { Component, OnInit, signal } from '@angular/core';
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
import { TableModule } from 'primeng/table';
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
  imports: [CommonModule, PopoverModule, ButtonModule, BadgeModule, ToastModule, TableModule, ConfirmDialogModule, OverlayBadgeModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class NotificationComponent implements OnInit {
  listMessage = signal<Notification[]>([]);
  Yes = YesNotEnum.YES;
  Not = YesNotEnum.NOT;
  btnSync: boolean = false;

  constructor(
    private loadingService: LoadingService,
    private confirmationService: ConfirmationService,
    private shareWhatsAppService: ShareWhatsappService,
    private storageService: StorageService,
    private permissionUserService: PermissionUserService,
    private messageService: MessageService,
    private router: Router,
    private notificationService: NotificationService,
    private vehicleService: VehicleEntryService) { }

  ngOnInit(): void {
    this.init(true);
  }

  async init(click: boolean) {
    this.btnSync = click;
    this.listMessage.set(await this.listNotification());
    this.btnSync = false;
  }
  getTempoDecorrido(dataInicialStr: string): string {
    const dataInicial = new Date(dataInicialStr);
    const agora = new Date();

    const diffMs = agora.getTime() - dataInicial.getTime(); // diferença em ms

    const diffMin = Math.floor(diffMs / 1000 / 60);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    const minutos = diffMin % 60;
    const horas = diffHoras % 24;
    const dias = diffDias;

    let resultado = '';

    if (dias > 0) {
      resultado += `${dias} dia${dias > 1 ? 's' : ''} `;
    }
    if (horas > 0) {
      resultado += `${horas} hora${horas > 1 ? 's' : ''} `;
    }
    if (minutos >= 0) {
      resultado += `${minutos} minuto${minutos > 1 ? 's' : ''}`;
    }

    return resultado.trim();
  }
  formatDateTime(date: Date): string {
    const datePipe = new DatePipe('en-US');

    // Obtém o fuso horário local no formato ±hh:mm
    const tzOffset = -date.getTimezoneOffset();
    const sign = tzOffset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
    const timezone = `${sign}${hours}:${minutes}`;

    // Formata a data e adiciona o fuso horário
    return datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") + timezone;
  }
  firstName(name: string): string {
    return name.split(" ")[0];
  }
  async editVehicle(id: string) {
    /* PERMISSION - 100 */
    /* EDITAR ENTRADA DO VEÍCULO */
    const permission = await this.searchPermission(100);
    if (!permission) { return; }
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
    let not: IDelNotification = {
      companyId: no.companyId!,
      resaleId: no.resaleId!,
      notificationId: no.id!
    }
    const result = await this.deleteNotitication(not);
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.init(false);
    } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }
  /* Delete All notification   */
  async deleteAllMessage() {
    for (let no of this.listMessage()) {
      let not: IDelNotification = {
        companyId: no.companyId!,
        resaleId: no.resaleId!,
        notificationId: no.id!
      }
      const result = await this.deleteNotitication(not);
      if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
        this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
      }
    }
    this.init(false);
  }
  private async getVehicleEntry(vehicleId: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryFilterId(vehicleId));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listNotification(): Promise<Notification[]> {
    try {
      return await lastValueFrom(this.notificationService.filterUser(this.storageService.id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
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
      header: 'Apagar todas notificações?',
      message: 'Confirme para apagar.',
      accept: () => {
        this.deleteAllMessage();
      },
      reject: () => {
      }
    });
  }

}
