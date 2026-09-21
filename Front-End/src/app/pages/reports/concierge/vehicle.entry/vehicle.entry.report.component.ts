import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { Component, DoCheck, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms'
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

//PrimeNG
import { PrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ImageModule } from 'primeng/image';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';

import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { VehicleDetailsComponent } from '@/app/components/vehicle.details/vehicle.details.component';

import { ClientCompany } from '@/app/models/client.company';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { User } from '@/app/models/user';
import { VehicleModel } from '@/app/models/vehicle.model';
import { UserService } from '@/app/services/user/user.service';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { VehicleEntryReportService } from '@/app/services/reports/concierge/vehicle.entry.report.service';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { Driver } from '@/app/models/driver';
import { DriverService } from '@/app/services/driver/driver.service';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';

interface IFilterVehicles {
  type: string;
  vehicleNew?: string;
  companyId: number | null;
  resaleId: number | null;
  dateInit: Date | string | null;
  dateFinal: Date | string | null;
  clientId?: number | null;
  userAttendantId?: number | null;
  userConciergeId?: number | null;
  modelId?: number | null;
  vehicleId?: number | null;
  vehiclePlate?: string;
  vehicleFleet?: string;
  numServiceOrder?: string;
}

interface IExportVehicle {
  Empresa: number,
  Revenda: number,
  Codigo: number,

  Ent_Usuario: number,
  Ent_Usuario_Nome: string,
  Ent_Usuario_Data: string,
  Ent_Usuario_inf: string,

  Said_Usuario?: string,
  Said_Usuario_Nome?: string,
  Said_Usuario_Data?: string,
  Said_Usuario_Inf?: string,
  Said_Previsao_Data?: string,

  Placa: string,
  Frota: string,
  Modelo: string,
  Consultor?: string,
  Consultor_Nome?: string,
  Cliente?: string,
  Cliente_Nome?: string,
  Cliente_CNPJ?: string,
  Cliente_Cpf?: string,

  Km_entrada?: string,
  Km_saida?: string,

  Nr_OS: string,
  Nr_NFe: string,
  Nr_NFEs: string,
  inf: string
}

@Component({
  selector: 'app-vehicle-entry-report',
  imports: [CommonModule, FilterClientComponent, VehicleDetailsComponent, ToastModule, ButtonModule, TableModule,
    InputTextModule, IconFieldModule, InputIconModule, TagModule,
    DialogModule, ReactiveFormsModule, FormsModule, InputNumberModule,
    DatePickerModule, InputGroupModule, SelectModule, ImageModule,
    InputMaskModule, RadioButtonModule, CheckboxModule],
  templateUrl: './vehicle.entry.report.component.html',
  styleUrl: './vehicle.entry.report.component.scss',
  providers: [MessageService]
})
export default class VehicleEntryReportComponent implements OnInit, DoCheck {
  private upperCasePipe: UpperCasePipe = new UpperCasePipe();
  private datePipeBR: DatePipe = new DatePipe('pt-BR');
  dialogVisible: boolean = false;
  listVehicleEntry = signal<VehicleEntry[]>([]);
  selectClientCompany = signal<ClientCompany>(new ClientCompany());

  vehicleModels = signal<VehicleModel[]>([]);
  attendantsUser = signal<User[]>([]);
  conciergeUser = signal<User[]>([]);

  formFilter = new FormGroup({
    type: new FormControl<string>('A'),
    vehicleNew: new FormControl<string | null>(null),
    dateInit: new FormControl<Date | string | null>(null),
    dateFinal: new FormControl<Date | string | null>(null),
    clientCompanyId: new FormControl<number | null>(null),
    clientCompanyName: new FormControl<string>(''),
    modelVehicle: new FormControl<VehicleModel | null>(null),
    userAttendant: new FormControl<User | null>(null),
    userConcierge: new FormControl<User | null>(null),
    vehicleId: new FormControl<number | null>(null),
    vehiclePlate: new FormControl<string>(''),
    vehicleFleet: new FormControl<string>(''),
    numServiceOrder: new FormControl<string | null>(null)
  });
  //Dialog details vehicles
  dialogVisibleVehicleDetails: boolean = false;
  disabledExport: boolean = true;
  @ViewChild('vehicleDetails') vehicleDetails!: VehicleDetailsComponent;

  constructor(private primeng: PrimeNG,
    private clientService: ClientCompanyService,
    private userService: UserService,
    private vehicleService: VehicleEntryService,
    private vehicleEntryReportService: VehicleEntryReportService,
    private vehicleModelService: VehicleModelService,
    private loadingService: LoadingService,
    private storageService: StorageService,
    private messageService: MessageService,
    private driverService: DriverService) {
  }
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
      matchAny: 'Corresponder a qualquer',
      dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
      dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
      dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
      monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
    });
    this.init();
  }
  ngDoCheck(): void {
    if (this.selectClientCompany().id != null) {
      this.formFilter.patchValue({
        clientCompanyId: this.selectClientCompany().id,
        clientCompanyName: this.selectClientCompany().name
      });
    }

  }
  private async init() {
    this.loadingService.show();
    //Attendant
    this.attendantsUser.set(await this.getUsers(2));
    //Concierge
    this.conciergeUser.set(await this.getUsers(10));
    //Vehicle Models
    this.getVehicleModels();
    this.clientdisable();
    this.loadingService.hide();
  }
  private clientEnable() {
    this.formFilter.get('clientCompanyId')?.enable();
    this.formFilter.get('clientCompanyName')?.enable();
  }
  private clientdisable() {
    this.formFilter.get('clientCompanyId')?.disable();
    this.formFilter.get('clientCompanyName')?.disable();
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
  private preList(vehicle: VehicleEntry): VehicleEntry {
    //Format Date
    vehicle.entryDate = this.datePipeBR.transform(this.formatDateTime(new Date(vehicle.entryDate)), 'dd/MM/yyyy HH:mm')!;
    vehicle.exitDate = vehicle.exitDate != null ? this.datePipeBR.transform(this.formatDateTime(new Date(vehicle.exitDate)), 'dd/MM/yyyy HH:mm')! : "";
    vehicle.exitDatePrevision = vehicle.exitDatePrevision != null ? this.datePipeBR.transform(this.formatDateTime(new Date(vehicle.exitDatePrevision)), 'dd/MM/yyyy HH:mm')! : "";

    if (vehicle.vehicleNew == YesNotEnum.YES) {
      vehicle.vehiclePlate = "NOVO";
    } else {
      vehicle.vehiclePlate = vehicle.vehiclePlate.substring(0, 3) + "-" + vehicle.vehiclePlate.substring(3, 7);
    }

    if (vehicle.clientCompanyName != '') {
      let names = vehicle.clientCompanyName.split(' ');
      if (names.length >= 2) {
        vehicle.clientCompanyName = names[0] + " " + names[1];
      } else {
        vehicle.clientCompanyName = names[0];
      }
    }
    return vehicle;
  }

  public cleanform() {
    this.formFilter.patchValue({
      type: 'A',
      vehicleNew: null,
      dateInit: '',
      dateFinal: '',
      clientCompanyId: null,
      clientCompanyName: '',
      modelVehicle: null,
      userAttendant: null,
      userConcierge: null,
      vehicleId: null,
      vehiclePlate: '',
      vehicleFleet: '',
      numServiceOrder: null
    });

    this.selectClientCompany.set(new ClientCompany());
  }
  public cleanList() {
    this.disabledExport = true;
    this.listVehicleEntry.set([]);
    this.cleanform();
  }
  public showDialog() {
    this.dialogVisible = true;
  }
  public hideDialog() {
    this.dialogVisible = false;
  }
  public async searchFilter() {
    this.hideDialog();

    this.clientEnable();

    const { value } = this.formFilter;

    const filters: IFilterVehicles = {
      type: value.type!,
      companyId: this.storageService.companyId,
      resaleId: this.storageService.resaleId,
      dateInit: value?.dateInit == null ? null : new Date(value.dateInit),
      dateFinal: value?.dateFinal == null ? null : new Date(value.dateFinal),
      clientId: value?.clientCompanyId,
      modelId: value.modelVehicle?.id ?? null,
      vehicleId: value?.vehicleId,
      userAttendantId: value?.userAttendant?.id ?? null,
      userConciergeId: value?.userConcierge?.id ?? null,
      vehiclePlate: value.vehiclePlate!,
      vehicleFleet: value.vehicleFleet!,
      numServiceOrder: value.numServiceOrder ?? '',
      vehicleNew: value.vehicleNew?.at(0) ?? "not"
    }
    this.loadingService.show();
    const resultFilter = await this.filterVehicles(filters);
    this.loadingService.hide();
    if (resultFilter.status == 200) {
      this.disabledExport = false;
      for (let index = 0; index < resultFilter.body!.length; index++) {
        const element = resultFilter.body![index];
        resultFilter.body![index] = this.preList(element);
      }
      this.listVehicleEntry.set(resultFilter.body!);
    }

    this.clientdisable();
  }
  private async filterVehicles(filters: any): Promise<HttpResponse<VehicleEntry[]>> {
    try {
      return await lastValueFrom(this.vehicleEntryReportService.filterVehicle(filters));
    } catch (error: any) {
      return error;
    }
  }

  private async getUsers(id: number): Promise<User[]> {
    const result = await this.filterUserRoleId(id);
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      return result.body.data;
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
    return [];
  }

  private async getVehicleModels() {
    this.vehicleModels.set(await this.modelVehicles());
  }

  private async modelVehicles(): Promise<VehicleModel[]> {
    try {
      return await lastValueFrom(this.vehicleModelService.getAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return []
    }
  }

  private async filterUserRoleId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.filterRoleId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  async showVehicle(id: number) {
    //serch vehicle entry
    this.loadingService.show();
    const vehicleResult = await this.getVehicleEntry(id);
    if (vehicleResult.status == 200 && vehicleResult.body?.status == StatusSuccessError.succes) {
      const vehicleResultData: VehicleEntry = vehicleResult.body.data;
      let clientCompany: ClientCompany = new ClientCompany();
      let driverEntry: Driver = new Driver();
      let driverExit: Driver = new Driver();
      let modChecklist: VehicleEntryChecklist = new VehicleEntryChecklist();

      //Checklist vehicle
      if (vehicleResultData.checklistId) {
        const resultChecklist = await this.filterChecklist(vehicleResultData.checklistId);
        if (resultChecklist.status == 200 && resultChecklist.body?.status == StatusSuccessError.succes) {
          modChecklist = resultChecklist.body.data;
        }
      }
      //serch client company
      if (vehicleResultData.clientCompanyId != null) {
        const resultClient = await this.filterIdClient(vehicleResultData.clientCompanyId);
        if (resultClient.status == 200 && resultClient.body?.status == StatusSuccessError.succes) {
          clientCompany = resultClient.body.data;
        }
      }
      //serch driver entry
      if (vehicleResultData.driverEntryId != null) {
        const resultDriverEntry = await this.filterDriverId(vehicleResultData.driverEntryId);
        if (resultDriverEntry.status == 200) {
          driverEntry = resultDriverEntry.body?.data!;
        }
      }
      //serch driver exit
      if (vehicleResultData.driverExitId != null) {
        const resultDriverExit = await this.filterDriverId(vehicleResultData.driverExitId);
        if (resultDriverExit.status == 200) {
          driverExit = resultDriverExit.body?.data!;
        }
      }
      //Details vehicle entry
     this.vehicleDetails.showDetailsVehicle(vehicleResultData, clientCompany, driverEntry, driverExit, modChecklist);
      //Show dialog
      this.dialogVisibleVehicleDetails = true;
    }
    this.loadingService.hide();
  }

  private async filterChecklist(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.filterChecklist(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async getVehicleEntry(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryFilterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Vaículo não encontrado", icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterIdClient(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async filterDriverId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return lastValueFrom(this.driverService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  exportExcel() {
    var listExp: IExportVehicle[] = [];
    for (let item of this.listVehicleEntry()) {
      /* listExp.push({
        Empresa: item.companyId,
        Revenda: item.resaleId,
        Codigo: item.id,
        Ent_Usuario: item.idUserEntry,
        Ent_Usuario_Nome: item.nameUserEntry,
        Ent_Usuario_Data: item.dateEntry.toString(),
        Ent_Usuario_inf: item.informationConcierge,
        Said_Usuario: item.userIdExit == 0 ? "" : item.userIdExit.toString(),
        Said_Usuario_Nome: item.userNameExit,
        Said_Usuario_Data: item.dateExit.toString(),
        Said_Usuario_Inf: item.exitInformation,
        Said_Previsao_Data: item.datePrevisionExit.toString(),
        Placa: item.placa,
        Frota: item.frota,
        Modelo: item.modelDescription,
        Consultor: item.idUserAttendant == 0 ? "" : item.idUserAttendant.toString(),
        Consultor_Nome: item.nameUserAttendant,
        Cliente: item.clientCompanyId == 0 ? "" : item.clientCompanyId.toString(),
        Cliente_Nome: item.clientCompanyName,
        Cliente_CNPJ: item.clientCompanyCnpj,
        Cliente_Cpf: item.clientCompanyCpf,
        Km_entrada: item.kmEntry,
        Km_saida: item.kmExit,
        Nr_OS: item.numServiceOrder,
        Nr_NFe: item.numNfe,
        Nr_NFEs: item.numNfse,
        inf: item.information
      }); */
    }

    // converte JSON → planilha
    /*  const worksheet = XLSX.utils.json_to_sheet(listExp);
     const workbook = { Sheets: { 'Dados': worksheet }, SheetNames: ['Dados'] };
 
     // cria o arquivo excel em memória
     const excelBuffer: any = XLSX.write(workbook, {
       bookType: 'xlsx',
       type: 'array'
     });
 
     // salva arquivo
     const blob = new Blob([excelBuffer], {
       type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
     });
 
     saveAs(blob, 'relatorio ' + this.datePipeBR.transform(new Date(), 'dd-MM-yyyy HH:mm') + ".xlsx"); */
  }
}
