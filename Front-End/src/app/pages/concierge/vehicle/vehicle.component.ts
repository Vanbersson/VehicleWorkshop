import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { PrimeNG } from 'primeng/config';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { StatusVehicleAuthEnum } from '@/app/models/status.vehicle.auth.enum';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { PermissionService } from '@/app/services/permission/permission.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';

import { User } from '@/app/models/user';
import { UserService } from '@/app/services/user/user.service';
import { VehicleModel } from '@/app/models/vehicle.model';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { MessageResponse } from '@/app/models/message-response';
import { VehicleEntryAuth } from '@/app/models/vehicle.entry.auth';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, ToastModule, TableModule, ButtonModule, IconFieldModule, InputIconModule, MultiSelectModule, SelectModule, TagModule,
    InputTextModule
  ],
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.scss',
  providers: [MessageService, DatePipe]
})
export default class VehicleComponent implements OnInit {

  notAuth = StatusVehicleAuthEnum.NOT;
  firstAuth = StatusVehicleAuthEnum.FIST;
  authorized = StatusVehicleAuthEnum.AUTH

  statusOrcamento!: any[];
  statusLiberacao = signal<any[]>([]);
  listVehicleEntry = signal<VehicleEntry[]>([]);
  selectedItems: VehicleEntry[] = [];

  attendants = signal<User[]>([]);

  vehicleModels = signal<VehicleModel[]>([]);

  auth!: VehicleEntryAuth;

  constructor(private primeng: PrimeNG,
    private permissionUserService: PermissionUserService,
    private vehicleService: VehicleEntryService,
    private storageService: StorageService,
    private router: Router,
    private messageService: MessageService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.primeng.setTranslation({
      startsWith: 'Inicia com',
      contains: 'Contém',
      notContains: 'Não contém',
      endsWith: 'Termina com',
      equals: 'Igual',
      notEquals: 'Diferente',
      noFilter: 'Sem filtro',
      lt: 'Menor que',
      lte: 'Menor ou igual',
      gt: 'Maior que',
      gte: 'Maior ou igual',
      dateIs: 'Data igual',
      dateIsNot: 'Data diferente',
      dateBefore: 'Antes de',
      dateAfter: 'Depois de',
      clear: 'Limpar',
      apply: 'Aplicar',
      matchAll: 'Corresponder a todos',
      matchAny: 'Corresponder a qualquer'
    });
    this.statusOrcamento = [
      { label: 'Sem Orçamento', value: 'Sem Orçamento' },
      { label: 'Não Enviado', value: 'Não Enviado' },
      { label: 'Pendente Aprovação', value: 'Pendente Aprovação' },
      { label: 'Aprovado', value: 'Aprovado' },
      { label: 'Não Aprovado', value: 'Não Aprovado' }
    ];
    this.statusLiberacao.set([
      { label: 'Não Liberado', value: this.notAuth },
      { label: '1ª Liberação', value: this.firstAuth },
      { label: 'Liberado', value: this.authorized }
    ]);
    this.init();
  }

  async init() {
    this.loadingService.show();
    var result = await this.listAll();
    for (let index = 0; index < result.length; index++) {
      result[index] = this.preList(result[index]);
    }
    this.listVehicleEntry.set(result);
    this.loadingService.hide();
  }

  clearTable(table: Table) {
    table.clear();
    this.selectedItems = [];
  }

  private async listAll(): Promise<VehicleEntry[]> {
    try {
      return await lastValueFrom(this.vehicleService.listAll());
    } catch (error) {
      return [];
    }
  }

  private preList(vehicle: VehicleEntry): VehicleEntry {
    //Format Date
    const datePipe = new DatePipe('pt-BR');
    vehicle.entryDate = datePipe.transform(this.formatDateTime(new Date(vehicle.entryDate)), 'dd/MM/yyyy HH:mm')!;
    if (vehicle.vehicleNew == YesNotEnum.YES) {
      vehicle.vehiclePlate = "NOVO";
    }
    if (vehicle.attendantUserName == "") {
      vehicle.attendantUserName = "FALTA";
    }
    if (vehicle.clientCompanyName == "") {
      vehicle.clientCompanyName = "FALTA";
    } else {
      var nome = vehicle.clientCompanyName.split(' ');
      vehicle.clientCompanyName = nome[0] + " " + nome[1];
    }
    return vehicle;
  }
  getSeverityAuth(status: string): any {
    switch (status) {
      case this.notAuth:
        return 'danger';

      case this.firstAuth:
        return 'success';

      case this.authorized:
        return 'success';
    }
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
  public addAuthorizationAll() {
    for (let index = 0; index < this.selectedItems.length; index++) {
      const element = this.selectedItems[index];
      this.authExit(element);
    }
  }
  public async authExit(vehicle: VehicleEntry) {
    if (vehicle.authExitStatus != StatusVehicleAuthEnum.AUTH) {
      this.auth = new VehicleEntryAuth();
      this.auth.companyId = this.storageService.companyId;
      this.auth.resaleId = this.storageService.resaleId;
      this.auth.vehicleId = vehicle.id;
      this.auth.userId = this.storageService.id;
      this.auth.userName = this.storageService.name;
      this.auth.dateAuth = this.formatDateTime(new Date());
      this.loadingService.show();
      const result = await this.addAuthExit(this.auth);
      this.loadingService.hide();
      if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
        if (vehicle.authExitStatus == this.notAuth) {
          vehicle.authExitStatus = this.firstAuth;
        } else if (vehicle.authExitStatus == this.firstAuth) {
          vehicle.authExitStatus = this.authorized;
        }
        //Autorização de saída
        if (vehicle.authExitStatus == this.firstAuth) {
          this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check-circle' });
        }
        //Saída liberada
        if (vehicle.authExitStatus == this.authorized) {
          this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-thumbs-up-fill' });
        }
      }
      if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
      }
    } else {
      this.messageService.add({ severity: 'info', summary: 'Veículo', detail: "Já liberado", icon: 'pi pi-info-circle' });
    }
  }
  private async addAuthExit(auth: VehicleEntryAuth): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryAddAuth(auth));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Não catalogado.", icon: 'pi pi-times' });
      return error;
    }
  }

  async editVeiculo(id: number) {
    if (StatusRoleFuncEnum.USER == this.storageService.roleFunc) {
      /* PERMISSION - 100 */
      /* EDITAR ENTRADA DO VEÍCULO */
      const permission = await this.searchPermission(100);
      if (!permission) { return; }
      this.router.navigateByUrl('concierge/vehicle/maintenance/' + id);
    } else {
      this.router.navigateByUrl('concierge/vehicle/maintenance/' + id);
    }
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

}


