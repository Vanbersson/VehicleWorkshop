import { Component, DoCheck, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
//PrimeNg
import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { VehicleEntry } from '@/app/models/vehicle.entry';
import { VehicleModel } from '@/app/models/vehicle.model';
import { User } from '@/app/models/user';
import { IColor } from '@/app/interfaces/i.color';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { UserService } from '@/app/services/user/user.service';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { DriverService } from '@/app/services/driver/driver.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { PermissionService } from '@/app/services/permission/permission.service';
import { MessageResponse } from '@/app/models/message-response';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { VehicleEntryAuth } from '@/app/models/vehicle.entry.auth';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';
import { StatusVehicleEnum } from '@/app/models/status.vehicle.enum';
import { StatusVehicleAuthEnum } from '@/app/models/status.vehicle.auth.enum';

import { FilterDriverComponent } from '@/app/components/filter.driver/filter.driver.component';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { BudgetService } from '@/app/services/budget/budget.service';
import { IBudgetNew } from '@/app/interfaces/i.budget.new';
import { IBudget } from '@/app/interfaces/i.budget';
import { ShareWhatsappService } from '@/app/services/share/share.whatsapp.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';

@Component({
  selector: 'app-vehicle-maintenance',
  imports: [CommonModule, FilterClientComponent, FilterDriverComponent, RouterModule, TagModule,
    TabsModule, FormsModule, IconFieldModule, SelectModule,
    CheckboxModule, ConfirmDialogModule, InputIconModule, ImageModule,
    DialogModule, ToastModule, TableModule, ReactiveFormsModule,
    TextareaModule, InputNumberModule, InputTextModule,
    ButtonModule, InputMaskModule, MultiSelectModule,
    InputGroupModule, RadioButtonModule, DatePickerModule],
  templateUrl: './vehicle.maintenance.component.html',
  styleUrl: './vehicle.maintenance.component.scss',
  providers: [ConfirmationService, MessageService]
})
export default class VehicleMaintenanceComponent implements OnInit, DoCheck {
  vehicleEntry!: VehicleEntry;
  private id: number = 0;
  //Vehicle
  public colors: IColor[] = []

  modelVehicles = signal<VehicleModel[]>([]);
  attendants = signal<User[]>([]);
  photoVehicle1 = signal<string>('');
  isPhotoNew1: boolean = false;
  isPhotoDelete1: boolean = false;

  photoVehicle2 = signal<string>('');
  isPhotoNew2: boolean = false;
  isPhotoDelete2: boolean = false;

  photoVehicle3 = signal<string>('');
  isPhotoNew3: boolean = false;
  isPhotoDelete3: boolean = false;

  photoVehicle4 = signal<string>('');
  isPhotoNew4: boolean = false;
  isPhotoDelete4: boolean = false;

  public dateExitAuth1 = signal<string>('');
  public dateExitAuth2 = signal<string>('');
  vehicleExit: boolean = false;

  yes = YesNotEnum.YES;
  not = YesNotEnum.NOT;

  formVehicle = new FormGroup({
    id: new FormControl<number>({ value: 0, disabled: true }),
    vehiclePlate: new FormControl<string>(''),
    vehicleFleet: new FormControl<string | null>(null),
    vehicleColor: new FormControl<IColor | null>(null),
    kmEntry: new FormControl<string | null>(''),
    kmExit: new FormControl<string | null>(''),
    modelVehicle: new FormControl<VehicleModel | null>(null, Validators.required),
    entryDate: new FormControl<Date | null>(null, Validators.required),
    exitDate: new FormControl<Date | null>({ value: null, disabled: true }),
    exitDatePrevision: new FormControl<Date | null>(null),
    nameUserExitAuth1: new FormControl<string>({ value: "", disabled: true }),
    nameUserExitAuth2: new FormControl<string>({ value: "", disabled: true }),
    attendant: new FormControl<User | null>(null),
    vehicleNew: new FormControl<string>(YesNotEnum.NOT, Validators.required),
    vehicleServiceOrder: new FormControl<string>(YesNotEnum.YES, Validators.required),
    numServiceOrder: new FormControl<string | null>(null),
    numNfe: new FormControl<string | null>(null),
    numNfse: new FormControl<string | null>(null),
    information: new FormControl<string>(''),

    checklist1Desc: new FormControl<string>(''),
    checklist2Desc: new FormControl<string>(''),
    checklist3Desc: new FormControl<string>(''),
    checklist4Desc: new FormControl<string>(''),
    checklist5Desc: new FormControl<string>(''),
    checklist6Desc: new FormControl<string>(''),
    checklist7Desc: new FormControl<string>(''),
    checklist8Desc: new FormControl<string>(''),
    checklist9Desc: new FormControl<string>(''),
    checklist10Desc: new FormControl<string>(''),
    checklist11Desc: new FormControl<string>(''),
    checklist12Desc: new FormControl<string>(''),
    checklist13Desc: new FormControl<string>(''),
    checklist14Desc: new FormControl<string>(''),
    checklist15Desc: new FormControl<string>(''),
    checklist16Desc: new FormControl<string>(''),
    checklist17Desc: new FormControl<string>(''),
    checklist18Desc: new FormControl<string>(''),
    checklist19Desc: new FormControl<string>(''),
    checklist20Desc: new FormControl<string>('')
  });

  modChecklist: VehicleEntryChecklist = new VehicleEntryChecklist();
  //Porteiro
  entryPhoto1!: string;
  entryPhoto2!: string;
  entryPhoto3!: string;
  entryPhoto4!: string;

  exitPhoto1!: string;
  exitPhoto2!: string;
  exitPhoto3!: string;
  exitPhoto4!: string;

  formConcierge = new FormGroup({
    entryId: new FormControl<number | null>({ value: null, disabled: true }),
    entryName: new FormControl<string>({ value: '', disabled: true }),
    entryInf: new FormControl<string>({ value: '', disabled: true }),
    exitId: new FormControl<number | null>({ value: null, disabled: true }),
    exitName: new FormControl<string>({ value: '', disabled: true }),
    exitInformation: new FormControl<string>({ value: '', disabled: true }),
  });
  //ClientCompany
  selectClientCompany = signal<ClientCompany>(new ClientCompany());
  clientCompany!: ClientCompany;
  formClientCompany = new FormGroup({
    clientCompanyNot: new FormControl<string[]>([]),
    clientCompanyId: new FormControl<number | null>({ value: null, disabled: true }),
    clientCompanyName: new FormControl<string>({ value: '', disabled: true }),
    clientCompanyCnpj: new FormControl<string>({ value: '', disabled: true }),
    clientCompanyCpf: new FormControl<string>({ value: '', disabled: true }),
    clientCompanyRg: new FormControl<string | null>({ value: null, disabled: true }),
  });
  //Driver
  selectDriverEntry = signal<Driver>(new Driver());
  selectDriverExit = signal<Driver>(new Driver());
  driverEntry!: Driver;
  driverExit!: Driver;
  formDriver = new FormGroup({
    driverEntryId: new FormControl<number | null>({ value: null, disabled: true }),
    driverEntryName: new FormControl<string>({ value: '', disabled: true }),
    driverEntryCpf: new FormControl<string>({ value: '', disabled: true }),
    driverEntryRg: new FormControl<string | null>({ value: null, disabled: true }),

    driverExitId: new FormControl<number | null>({ value: null, disabled: true }),
    driverExitName: new FormControl<string>({ value: '', disabled: true }),
    driverExitCpf: new FormControl<string>({ value: '', disabled: true }),
    driverExitRg: new FormControl<string | null>({ value: null, disabled: true }),
  });
  driverEntryPhoto!: string;
  driverEntryPhotoDoc1!: string;
  driverEntryPhotoDoc2!: string;
  driverExitPhoto!: string;
  driverExitPhotoDoc1!: string;
  driverExitPhotoDoc2!: string;
  //Budget
  dialogVisibleOrcamento: boolean = false;
  dialogNomeClientCompany!: string;
  dialogIdClientCompany!: number;
  private budget!: IBudgetNew;

  //dialog visibleVehiclePlateTogether
  visibleVehiclePlateTogether: boolean = false;
  vehiclesTogether = signal<VehicleEntry[]>([]);
  isVehicleTogether: boolean = false;

  constructor(
    private budgetService: BudgetService,
    private permissionUserService: PermissionUserService,

    private vehicleService: VehicleEntryService,
    private activatedRoute: ActivatedRoute,

    private router: Router,

    private storageService: StorageService,
    private userService: UserService,
    private vehicleModelService: VehicleModelService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private driverService: DriverService,
    private photoService: PhotoService,
    private clientService: ClientCompanyService,
    private shareVehicleService: ShareWhatsappService
  ) {
  }
  ngOnInit(): void {
    this.colors = [
      { color: 'Branco' },
      { color: 'Preto' },
      { color: 'Azul' },
      { color: 'Verde' },
      { color: 'Cinza' },
      { color: 'Vermelho' },
      { color: 'Amarelo' },
      { color: 'Rosa' },
      { color: 'Roxo' },
      { color: 'Outro' }
    ];
    if (this.activatedRoute.snapshot.params['id']) {
      this.activatedRoute.params.subscribe(params => {
        this.id = params['id'];
        this.init();
      });
    }
  }

  ngDoCheck(): void {
    //proprietário
    if (this.selectClientCompany().id != null) {
      this.formClientCompany.patchValue({
        clientCompanyNot: [],
        clientCompanyId: this.selectClientCompany().id,
        clientCompanyName: this.selectClientCompany().name,
        clientCompanyCnpj: this.selectClientCompany().cnpj,
        clientCompanyCpf: this.selectClientCompany().cpf,
        clientCompanyRg: this.selectClientCompany().rg == "" ? null : this.selectClientCompany().rg
      });
      this.clientCompany = this.selectClientCompany();
      this.selectClientCompany.set(new ClientCompany());
    }
    //Motorista entrada
    if (this.selectDriverEntry().id != null) {
      this.driverEntry = this.selectDriverEntry();
      this.formDriver.patchValue({
        driverEntryId: this.driverEntry.id,
        driverEntryName: this.driverEntry.name,
        driverEntryCpf: this.driverEntry.cpf,
        driverEntryRg: this.driverEntry.rg == "" ? null : this.driverEntry.rg
      });
      this.driverEntryPhoto = this.driverEntry.photoDriverUrl;
      this.driverEntryPhotoDoc1 = this.driverEntry.photoDoc1Url;
      this.driverEntryPhotoDoc2 = this.driverEntry.photoDoc2Url;
      this.selectDriverEntry.set(new Driver());
    }
    //Motorista saída
    if (this.selectDriverExit().id != null) {
      this.driverExit = this.selectDriverExit();
      this.formDriver.patchValue({
        driverExitId: this.driverExit.id == 0 ? null : this.driverExit.id,
        driverExitName: this.driverExit.name,
        driverExitCpf: this.driverExit.cpf,
        driverExitRg: this.driverExit.rg == "" ? null : this.driverExit.rg
      });
      this.driverExitPhoto = this.driverExit.photoDriverUrl;
      this.driverExitPhotoDoc1 = this.driverExit.photoDoc1Url;
      this.driverExitPhotoDoc2 = this.driverExit.photoDoc2Url;
      this.selectDriverExit.set(new Driver());
    }
  }
  private async init() {
    //Show load
    this.loadingService.show();
    //Attendant
    this.getAttendants();
    //Model
    this.modelVehicles.set(await this.getVehicleModel());
    //Vehicle
    const vehicleResult = await this.getVehicleEntry();
    if (vehicleResult.status == 200 && vehicleResult.body?.status == StatusSuccessError.succes) {
      //Passa as informações para o objeto veículo de entrada
      this.vehicleEntry = vehicleResult.body.data;
      //Checklist vehicle
      if (this.vehicleEntry.checklistId) {
        const resultChecklist = await this.filterChecklist(this.vehicleEntry.checklistId);
        if (resultChecklist.status == 200 && resultChecklist.body?.status == StatusSuccessError.succes) {
          this.modChecklist = resultChecklist.body.data;
        }
      }
      //Buscar o cliente
      if (this.vehicleEntry.clientCompanyId != null) {
        const resultClient = await this.filterIdClient(this.vehicleEntry.clientCompanyId);
        if (resultClient.status == 200 && resultClient.body?.status == StatusSuccessError.succes) {
          this.clientCompany = resultClient.body.data;
        }
        if (resultClient.status == 200 && resultClient.body?.status == StatusSuccessError.error) {
          this.messageService.add({ severity: 'info', summary: resultClient.body.header, detail: resultClient.body.message, icon: 'pi pi-info-circle' });
        }
      }
      //Buscar o motorista de entrada
      if (this.vehicleEntry.driverEntryId != null) {
        const resultDriverEntry = await this.filterDriverId(this.vehicleEntry.driverEntryId);
        if (resultDriverEntry.status == 200) {
          this.driverEntry = resultDriverEntry.body?.data!;
        }
      }
      //Buscar o motorista de saída
      if (this.vehicleEntry.driverExitId != null) {
        const resultDriverExit = await this.filterDriverId(this.vehicleEntry.driverExitId);
        if (resultDriverExit.status == 200) {
          this.driverExit = resultDriverExit.body?.data!;
        }
      }

      //Show only details
      /*  if (this.detailsVehicle) {
         this.vehicleExit = true;
         this.formVehicle.get('vehicleNew')?.disable();
         this.formVehicle.get('vehicleServiceOrder')?.disable();
         this.formVehicle.get('entryDate')?.disable();
       } else {
         //Vehicle has already left
         if (this.vehicleEntry.status == StatusVehicleEnum.EXITED) {
           this.vehicleExit = true;
           this.formVehicle.get('vehicleNew')?.disable();
           this.formVehicle.get('vehicleServiceOrder')?.disable();
         } else {
           this.vehicleExit = false;
           this.formVehicle.get('vehicleNew')?.enable();
           this.formVehicle.get('vehicleServiceOrder')?.enable();
         }
       } */
      this.loadForms();
    }
    //Close load
    this.loadingService.hide();
  }
  private loadForms() {
    //mostrar veículos justos
    if (this.vehicleEntry.vehiclePlateTogether) {
      this.isVehicleTogether = true;
    }
    //Vehicle
    this.formVehicle.patchValue({
      id: this.vehicleEntry.id,
      entryDate: new Date(this.vehicleEntry.entryDate),
      exitDate: this.vehicleEntry.exitDate != null ? new Date(this.vehicleEntry.exitDate) : null,
      exitDatePrevision: this.vehicleEntry.exitDatePrevision != null ? new Date(this.vehicleEntry.exitDatePrevision) : null,
      vehicleColor: this.vehicleEntry.vehicleColor != null ? { color: this.vehicleEntry.vehicleColor } : null,
      vehiclePlate: this.vehicleEntry.vehiclePlate,
      vehicleFleet: this.vehicleEntry.vehicleFleet == "" ? null : this.vehicleEntry.vehicleFleet,
      modelVehicle: this.modelVehicles().find(m => m.id == this.vehicleEntry.modelId),
      kmEntry: this.vehicleEntry.vehicleKmEntry == "" ? null : this.vehicleEntry.vehicleKmEntry,
      kmExit: this.vehicleEntry.vehicleKmExit == "" ? null : this.vehicleEntry.vehicleKmExit,
      attendant: this.attendants().find(a => a.id == this.vehicleEntry.attendantUserId),
      vehicleServiceOrder: this.vehicleEntry.vehicleServiceOrder,
      vehicleNew: this.vehicleEntry.vehicleNew,
      nameUserExitAuth1: this.vehicleEntry.auth1ExitUserName,
      nameUserExitAuth2: this.vehicleEntry.auth2ExitUserName,
      numServiceOrder: this.vehicleEntry.numServiceOrder == "" ? null : this.vehicleEntry.numServiceOrder,
      numNfe: this.vehicleEntry.numNfe == "" ? null : this.vehicleEntry.numNfe,
      numNfse: this.vehicleEntry.numNfse == "" ? null : this.vehicleEntry.numNfse,
      information: this.vehicleEntry.attendantInformation,

      checklist1Desc: this.modChecklist.checklist1Desc,
      checklist2Desc: this.modChecklist.checklist2Desc,
      checklist3Desc: this.modChecklist.checklist3Desc,
      checklist4Desc: this.modChecklist.checklist4Desc,
      checklist5Desc: this.modChecklist.checklist5Desc,
      checklist6Desc: this.modChecklist.checklist6Desc,
      checklist7Desc: this.modChecklist.checklist7Desc,
      checklist8Desc: this.modChecklist.checklist8Desc,
      checklist9Desc: this.modChecklist.checklist9Desc,
      checklist10Desc: this.modChecklist.checklist10Desc,
      checklist11Desc: this.modChecklist.checklist11Desc,
      checklist12Desc: this.modChecklist.checklist12Desc,
      checklist13Desc: this.modChecklist.checklist13Desc,
      checklist14Desc: this.modChecklist.checklist14Desc,
      checklist15Desc: this.modChecklist.checklist15Desc,
      checklist16Desc: this.modChecklist.checklist16Desc,
      checklist17Desc: this.modChecklist.checklist17Desc,
      checklist18Desc: this.modChecklist.checklist18Desc,
      checklist19Desc: this.modChecklist.checklist19Desc,
      checklist20Desc: this.modChecklist.checklist20Desc,
    });
    //Imagem consultor
    this.photoVehicle1.set(this.vehicleEntry.attendantPhoto1Url);
    this.photoVehicle2.set(this.vehicleEntry.attendantPhoto2Url);
    this.photoVehicle3.set(this.vehicleEntry.attendantPhoto3Url);
    this.photoVehicle4.set(this.vehicleEntry.attendantPhoto4Url);
    //Validation placa
    if (this.vehicleEntry.vehicleNew == YesNotEnum.YES) {
      this.deleteRequirePlaca();
    } else {
      this.addRequirePlaca();
    }
    //Autorização de saída
    if (this.vehicleEntry.auth1ExitDate) {
      this.dateExitAuth1.set(this.vehicleEntry.auth1ExitDate!.toString());
    } else {
      this.dateExitAuth1.set('');
    }
    if (this.vehicleEntry.auth2ExitDate) {
      this.dateExitAuth2.set(this.vehicleEntry.auth2ExitDate!.toString());
    } else {
      this.dateExitAuth2.set('');
    }
    //porteiro entrada
    this.formConcierge.patchValue({
      entryId: this.vehicleEntry.entryUserId,
      entryName: this.vehicleEntry.entryUserName,
      entryInf: this.vehicleEntry.entryInformation
    });
    this.entryPhoto1 = this.vehicleEntry.entryPhoto1Url;
    this.entryPhoto2 = this.vehicleEntry.entryPhoto2Url;
    this.entryPhoto3 = this.vehicleEntry.entryPhoto3Url;
    this.entryPhoto4 = this.vehicleEntry.entryPhoto4Url;
    //porteiro saída
    this.formConcierge.patchValue({
      exitId: this.vehicleEntry.exitUserId == null ? null : this.vehicleEntry.exitUserId,
      exitName: this.vehicleEntry.exitUserName,
      exitInformation: this.vehicleEntry.exitInformation
    });
    this.exitPhoto1 = this.vehicleEntry.exitPhoto1Url;
    this.exitPhoto2 = this.vehicleEntry.exitPhoto2Url;
    this.exitPhoto3 = this.vehicleEntry.exitPhoto3Url;
    this.exitPhoto4 = this.vehicleEntry.exitPhoto4Url;

    //Form Proprietario
    if (this.vehicleEntry.clientCompanyId != null) {
      this.formClientCompany.patchValue({
        clientCompanyNot: [],
        clientCompanyId: this.clientCompany.id,
        clientCompanyName: this.clientCompany.name,
        clientCompanyCnpj: this.clientCompany.cnpj,
        clientCompanyCpf: this.clientCompany.cpf,
        clientCompanyRg: this.clientCompany.rg == "" ? null : this.clientCompany.rg,
      });
    } else {
      this.formClientCompany.get("clientCompanyNot")?.setValue(["not"])
    }
    //tab driver
    this.loadDriver();
    //Verificar essa função
    if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.NOT) {
      if (this.vehicleEntry.vehicleServiceOrder == YesNotEnum.YES) {
        this.addRequireAttendant();
      }
    }
  }

  private loadDriver() {
    this.formDriver.patchValue({
      driverEntryId: this.driverEntry?.id ?? null,
      driverEntryName: this.driverEntry.name,
      driverEntryCpf: this.driverEntry.cpf,
      driverEntryRg: this.driverEntry.rg == "" ? null : this.driverEntry.rg
    });
    this.driverEntryPhoto = this.driverEntry.photoDriverUrl;
    this.driverEntryPhotoDoc1 = this.driverEntry.photoDoc1Url;
    this.driverEntryPhotoDoc2 = this.driverEntry.photoDoc2Url;

    if (this.driverExit != null) {
      this.formDriver.patchValue({
        driverExitId: this.driverExit.id == 0 ? null : this.driverExit.id,
        driverExitName: this.driverExit.name,
        driverExitCpf: this.driverExit.cpf,
        driverExitRg: this.driverExit.rg == "" ? null : this.driverExit.rg
      });
      this.driverExitPhoto = this.driverExit.photoDriverUrl;
      this.driverExitPhotoDoc1 = this.driverExit.photoDoc1Url;
      this.driverExitPhotoDoc2 = this.driverExit.photoDoc2Url;
    }
  }

  private async getAttendants() {
    const result = await this.filterUserRoleId();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      //this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.attendants.set(result.body.data);
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }

  private async filterUserRoleId(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.filterRoleId(2));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async getVehicleModel(): Promise<VehicleModel[]> {
    try {
      return await lastValueFrom(this.vehicleModelService.getAllEnabled());
    } catch (error: any) {
      return [];
    }
  }

  private async getVehicleEntry(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryFilterId(this.id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Vaículo não encontrado", icon: 'pi pi-times' });
      return error;
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
  //Vehicle
  private preList(vehicle: VehicleEntry): VehicleEntry {
    //Format Date
    const datePipe = new DatePipe('pt-BR');
    vehicle.entryDate = datePipe.transform(this.formatDateTime(new Date(vehicle.entryDate)), 'dd/MM/yyyy HH:mm')!;

    if (vehicle.status == StatusVehicleEnum.EXITED) {
      vehicle.exitDate = datePipe.transform(this.formatDateTime(new Date(vehicle.exitDate)), 'dd/MM/yyyy HH:mm')!;
    }
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
  async showVehicleTogether() {
    if (this.vehicleEntry.vehiclePlateTogether) {
      this.loadingService.show();
      const result = await this.filterVehicleTogether(this.vehicleEntry.vehiclePlateTogether);
      this.loadingService.hide();
      if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
        this.visibleVehiclePlateTogether = true;
        for (let index = 0; index < result.body.data.length; index++) {
          result.body.data[index] = this.preList(result.body.data[index]);
        }
        this.vehiclesTogether.set(result.body.data);
      }
    }
  }
  changerVehicle(id: number) {
    this.router.navigateByUrl("/concierge/vehicle/maintenance/" + id);
  }

  public placaRequiredAdd() {
    this.addRequirePlaca();
  }
  public placaRequiredRemove() {
    if (this.formVehicle.get("vehiclePlate")?.value!.trim() != '' && this.formVehicle.value.vehicleNew == YesNotEnum.YES) {
      this.confirmationService.confirm({
        header: 'Confirmar',
        message: 'A placa será removida ',
        acceptIcon: 'pi pi-check mr-2',
        rejectIcon: 'pi pi-times mr-2',
        rejectButtonStyleClass: 'p-button-sm',
        rejectLabel: 'Não',
        acceptButtonStyleClass: 'p-button-outlined p-button-sm',
        acceptLabel: 'Sim',
        accept: () => {

          this.deleteRequirePlaca();
          this.cleanPlaca();
          this.messageService.add({ severity: 'success', summary: 'Placa', detail: 'Removida com sucesso', life: 2000 });
        },
        reject: () => {
          this.formVehicle.patchValue({ vehicleNew: 'not' });
        }
      });
    }

    if (this.formVehicle.get("vehiclePlate")?.value!.trim() == '' && this.formVehicle.value.vehicleNew == YesNotEnum.YES) {
      this.deleteRequirePlaca();
      this.cleanPlaca();
    }

  }
  private addRequirePlaca() {
    this.formVehicle.controls['vehiclePlate'].addValidators(Validators.required);
    this.formVehicle.controls['vehiclePlate'].updateValueAndValidity();
  }
  private deleteRequirePlaca() {
    this.formVehicle.controls['vehiclePlate'].removeValidators(Validators.required);
    this.formVehicle.controls['vehiclePlate'].updateValueAndValidity();
  }
  private cleanPlaca() {
    this.formVehicle.get("vehiclePlate")?.setValue("");
    this.vehicleEntry.vehiclePlate = "";
  }
  private addRequireAttendant() {
    this.formVehicle.controls['attendant'].addValidators(Validators.required);
    this.formVehicle.controls['attendant'].updateValueAndValidity();
  }
  private deleteRequireAttendant() {
    this.formVehicle.controls['attendant'].removeValidators(Validators.required);
    this.formVehicle.controls['attendant'].updateValueAndValidity();
  }
  /* Save imgage */
  async onFileSelected1() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle1.set(photo.base64!);
      this.vehicleEntry.attendantPhoto1Url = this.photoVehicle1();
      //informa que foi selecionado uma imagem nova
      this.isPhotoNew1 = true;
      //informa que não exclua a imagem
      this.isPhotoDelete1 = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  async onFileSelected2() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle2.set(photo.base64!)
      this.vehicleEntry.attendantPhoto2Url = this.photoVehicle2();
      //informa que foi selecionado uma imagem nova
      this.isPhotoNew2 = true;
      //informa que não exclua a imagem
      this.isPhotoDelete2 = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  async onFileSelected3() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle3.set(photo.base64!)
      this.vehicleEntry.attendantPhoto3Url = this.photoVehicle3();
      //informa que foi selecionado uma imagem nova
      this.isPhotoNew3 = true;
      //informa que não exclua a imagem
      this.isPhotoDelete3 = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  async onFileSelected4() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle4.set(photo.base64!)
      this.vehicleEntry.attendantPhoto4Url = this.photoVehicle4();
      //informa que foi selecionado uma imagem nova
      this.isPhotoNew4 = true;
      //informa que não exclua a imagem
      this.isPhotoDelete4 = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  /* Delete image */
  public async deleteFileVehicle1() {
    this.photoVehicle1.set('');
    this.vehicleEntry.entryPhoto1Url = "";
    //informa que a imagem não é nova
    this.isPhotoNew1 = false;
    //informa que exclua a imagem
    this.isPhotoDelete1 = true;
  }
  public async deleteFileVehicle2() {
    this.photoVehicle2.set('');
    this.vehicleEntry.entryPhoto2Url = "";
    //informa que a imagem não é nova
    this.isPhotoNew2 = false;
    //informa que exclua a imagem
    this.isPhotoDelete2 = true;
  }
  public async deleteFileVehicle3() {
    this.photoVehicle3.set('');
    this.vehicleEntry.entryPhoto3Url = "";
    //informa que a imagem não é nova
    this.isPhotoNew3 = false;
    //informa que exclua a imagem
    this.isPhotoDelete3 = true;
  }
  public async deleteFileVehicle4() {
    this.photoVehicle4.set('');
    this.vehicleEntry.entryPhoto4Url = "";
    //informa que a imagem não é nova
    this.isPhotoNew4 = false;
    //informa que exclua a imagem
    this.isPhotoDelete4 = true;
  }
  private async savePhoto(ve: VehicleEntry, img: string, order: number): Promise<string> {
    if (img == "") {
      return "";
    }
    try {
      let path =
        `${ve.companyId}/` +
        `${ve.resaleId}/concierge/vehicle/` +
        `${ve.id}/attendant/`;

      const { base64, mime } = this.cleanBase64(img);
      const file = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', file);

      switch (order) {
        case 1:
          path += "image1.jpg";
          formData.append('local', path);
          break;
        case 2:
          path += "image2.jpg";
          formData.append('local', path);
          break;
        case 3:
          path += "image3.jpg";
          formData.append('local', path);
          break;
        case 4:
          path += "image4.jpg";
          formData.append('local', path);
          break;
      }
      const resultSave = await this.saveImage(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error) {
      return "";
    }
    return "";

  }
  private cleanBase64(base64: string): { base64: string; mime: string } {
    if (!base64.includes(',')) {
      return { base64, mime: 'image/jpeg' };
    }

    const [header, data] = base64.split(',');
    const mime = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';

    return { base64: data, mime };
  }
  private base64ToFile(base64: string, mime: string): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ia], 'image.jpg', { type: mime });
  }
  private deleteRequireForms() {
    this.deleteRequireAttendant();
  }
  private addRequireForms() {
    this.addRequireAttendant();
  }
  public async authExit() {
    const uppercase = new UpperCasePipe();
    if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.AUTH) {
      let auth = new VehicleEntryAuth();
      auth.companyId = this.storageService.companyId;
      auth.resaleId = this.storageService.resaleId;
      auth.vehicleId = this.vehicleEntry.id;
      auth.userId = this.storageService.id;
      auth.userName = this.storageService.name;
      auth.dateAuth = this.formatDateTime(new Date());
      //Inicia loading
      this.loadingService.show();
      const permissionResult = await this.addAuthExit(auth);
      //Fecha loading
      this.loadingService.hide();
      if (permissionResult.status == 200 && permissionResult.body?.status == StatusSuccessError.succes) {
        //Status auth exit
        if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.NOT) {
          this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.FIST;
          this.messageService.add({ severity: 'success', summary: permissionResult.body.header, detail: permissionResult.body.message, icon: 'pi pi-check-circle' });
        } else if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.FIST) {
          this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.AUTH;
          this.messageService.add({ severity: 'success', summary: permissionResult.body.header, detail: permissionResult.body.message, icon: 'pi pi-thumbs-up-fill' });
        }

        if (this.vehicleEntry.auth1ExitUserId == null) {
          this.formVehicle.get('nameUserExitAuth1')?.setValue(auth.userName);
          this.vehicleEntry.auth1ExitUserId = auth.userId;
          this.vehicleEntry.auth1ExitUserName = auth.userName;
          this.vehicleEntry.auth1ExitDate = auth.dateAuth;
          this.dateExitAuth1.set(auth.dateAuth);

        } else if (this.vehicleEntry.auth2ExitUserId == null) {
          this.formVehicle.get('nameUserExitAuth2')?.setValue(auth.userName);
          this.vehicleEntry.auth2ExitUserId = auth.userId;
          this.vehicleEntry.auth2ExitUserName = auth.userName;
          this.vehicleEntry.auth2ExitDate = auth.dateAuth;
          this.dateExitAuth2.set(auth.dateAuth);
        }
        //Valid
        this.addRequireForms();
      } else if (permissionResult.status == 200 && permissionResult.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: permissionResult.body.header, detail: permissionResult.body.message, icon: 'pi pi-info-circle' });
      }

    } else {
      this.messageService.add({ severity: 'info', summary: 'Veículo Liberado', detail: "Placa " + uppercase.transform(this.formVehicle.value.vehiclePlate), icon: 'pi pi-thumbs-up-fill' });
    }
  }
  private updateAuthExitStatus() {
    if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.FIST) {
      this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.NOT;
      this.deleteRequireForms();
    } else if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.AUTH) {
      this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.FIST;
    }
  }
  public async deleteAuth1() {
    if (this.vehicleEntry.auth1ExitUserId != null) {
      let auth = new VehicleEntryAuth();
      auth.companyId = this.storageService.companyId;
      auth.resaleId = this.storageService.resaleId;
      auth.vehicleId = this.id;
      auth.userId = this.storageService.id;
      auth.userName = this.storageService.name;

      const authResult = await this.delAuth1(auth);
      if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.succes) {
        this.messageService.add({ severity: 'success', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-check' });
        this.formVehicle.get('nameUserExitAuth1')?.setValue('');
        this.vehicleEntry.auth1ExitUserId = null;
        this.vehicleEntry.auth1ExitUserName = '';
        this.vehicleEntry.auth1ExitDate = '';
        this.dateExitAuth1.set('');
        this.updateAuthExitStatus();
      } else if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-info-circle' });
      }
    }
  }
  private async delAuth1(auth: VehicleEntryAuth): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryDeleteAuth1(auth));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Não catalogado.", icon: 'pi pi-times' });
      return error;
    }
  }
  public async deleteAuth2() {
    if (this.vehicleEntry.auth2ExitUserId != null) {
      let auth = new VehicleEntryAuth();
      auth.companyId = this.storageService.companyId;
      auth.resaleId = this.storageService.resaleId;
      auth.vehicleId = this.id;
      auth.userId = this.storageService.id;
      auth.userName = this.storageService.name;
      const authResult = await this.delAuth2(auth);
      if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.succes) {
        this.messageService.add({ severity: 'success', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-check' });
        this.formVehicle.get('nameUserExitAuth2')?.setValue('');
        this.vehicleEntry.auth2ExitUserId = null;
        this.vehicleEntry.auth2ExitUserName = '';
        this.vehicleEntry.auth2ExitDate = '';
        this.dateExitAuth2.set('');
        this.updateAuthExitStatus();
      } else if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-info-circle' });
      }
    }
  }
  private async delAuth2(auth: VehicleEntryAuth): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryDeleteAuth2(auth));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Não catalogado.", icon: 'pi pi-times' });
      return error;
    }
  }
  //Porteiro
  public validationClientCompany() {
    if (this.formClientCompany.value.clientCompanyNot!.length == 0 && this.clientCompany != null) {
      this.cleanFormClientCompany();
      this.clientCompany = null!;
    }
  }
  private cleanFormClientCompany() {
    this.formClientCompany.patchValue({
      clientCompanyId: null,
      clientCompanyName: '',
      clientCompanyCnpj: '',
      clientCompanyCpf: '',
      clientCompanyRg: null
    });
  }
  //Driver
  private async filterDriverId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return lastValueFrom(this.driverService.filterId(id));
    } catch (error: any) {
      return error;
    }
  }
  cleanDriverExit() {
    this.driverExit = null!;
    this.vehicleEntry.driverExitId = null,
      this.vehicleEntry.driverExitName = "";
    this.formDriver.patchValue({
      driverExitId: null,
      driverExitName: '',
      driverExitCpf: '',
      driverExitRg: null
    });
    this.driverExitPhoto = '';
    this.driverExitPhotoDoc1 = '';
    this.driverExitPhotoDoc2 = '';
  }
  //Budget
  public async confirmGerarOrcamento() {
    if (this.formVehicle.value.numServiceOrder == "" || this.formVehicle.value.numServiceOrder == null) {
      this.messageService.add({ severity: 'info', summary: 'Número O.S.', detail: 'Não informado', icon: 'pi pi-info-circle' });
      return;
    }

    if (this.vehicleEntry.budgetId != 0) {
      /* PERMISSION - 152 */
      /* VISUALIZAR ORÇAMENTO */
      const permission = await this.searchPermission(152);
      if (!permission) { return; }
      this.router.navigateByUrl("/oficina/manutencao-orcamento/" + this.vehicleEntry.id);
    } else {

      this.confirmationService.confirm({
        header: 'Confirmar',
        message: 'Gerar um orçamento.',
        acceptIcon: 'pi pi-check mr-2',
        rejectIcon: 'pi pi-times mr-2',
        rejectButtonStyleClass: 'p-button-sm',
        rejectLabel: 'Não',
        acceptButtonStyleClass: 'p-button-outlined p-button-sm',
        acceptLabel: 'Sim',
        accept: async () => {
          /* PERMISSION - 150 */
          /* GERAR ORÇAMENTO */
          const permission = await this.searchPermission(150);
          if (!permission) { return; }
          this.budget = { companyId: this.storageService.companyId, resaleId: this.storageService.resaleId, vehicleEntryId: this.vehicleEntry.id };
          const budgetResult = await this.saveBudget(this.budget);
          if (budgetResult.status == 201) {
            //this.vehicleEntry.budgetId = budgetResult.body.status;
            this.messageService.add({ severity: 'info', summary: 'Orçamento - ' + budgetResult.body?.id, detail: 'Gerado com sucesso', life: 2000 });

            setTimeout(async () => {
              /* PERMISSION - 152 */
              /* VISUALIZAR ORÇAMENTO */
              const permission = await this.searchPermission(152);
              if (!permission) { return; }
              this.router.navigateByUrl('/oficina/manutencao-orcamento/' + this.vehicleEntry.id);
            }, 2000);
          }
        }
      });
    }
  }
  private async saveBudget(budget: IBudgetNew): Promise<HttpResponse<IBudget>> {
    try {
      return await lastValueFrom(this.budgetService.addBudget$(this.budget));
    } catch (error: any) {
      return error;
    }
  }
  //Atualizar informações do veículo
  private validInformation(): boolean {
    const vehicleValue = this.formVehicle.value;
    const clientCompanyValue = this.formClientCompany.value;
    const driverValue = this.formDriver.value;

    if (vehicleValue.entryDate == null) {
      this.messageService.add({ severity: 'error', summary: 'Data Entrada', detail: "Não informada", icon: 'pi pi-times' });
      return false;
    }
    if (vehicleValue.entryDate > new Date()) {
      this.messageService.add({ severity: 'error', summary: 'Data Entrada', detail: "Maior que data atual", icon: 'pi pi-times' });
      return false;
    }
    if (vehicleValue.exitDatePrevision != null && vehicleValue.exitDatePrevision < vehicleValue.entryDate) {
      this.messageService.add({ severity: 'error', summary: 'Data Previsão Saída', detail: "Menor que data entrada", icon: 'pi pi-times' });
      return false;
    }
    if (vehicleValue.modelVehicle == null) {
      this.messageService.add({ severity: 'error', summary: 'Modelo', detail: "Não selecionado", icon: 'pi pi-times' });
      return false;
    }
    if (vehicleValue.vehicleServiceOrder == YesNotEnum.YES) {
      if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.NOT) {
        if (vehicleValue.attendant == null) {
          this.messageService.add({ severity: 'error', summary: 'Consultor', detail: "Não informado", icon: 'pi pi-times' });
          return false;
        }
      }
    }
    //Proprietário
    if (clientCompanyValue.clientCompanyNot!.length == 0 && this.clientCompany == null) {
      this.messageService.add({ severity: 'error', summary: 'Proprietário', detail: "Não informado", icon: 'pi pi-times' });
      return false;
    }
    //Motorista Entrada
    if (this.driverEntry == null) {
      this.messageService.add({ severity: 'error', summary: 'Motorista Entrada', detail: "Não informado", icon: 'pi pi-times' });
      return false;
    }
    if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.NOT) {
      //Motorista saída
      if (this.driverExit == null) {
        this.messageService.add({ severity: 'error', summary: 'Motorista Saída', detail: "Não informado", icon: 'pi pi-times' });
        return false;
      }
    }
    return true;
  }
  applyDateTimeMask(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    }

    if (value.length > 5) {
      value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }

    if (value.length > 10) {
      value = value.replace(/^(\d{2})\/(\d{2})\/(\d{4})(\d)/, '$1/$2/$3 $4');
    }

    if (value.length > 12) {
      value = value.replace(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2})(\d)/, '$1/$2/$3 $4:$5');
    }
    event.target.value = value;
  }
  private loadingVehicle() {
    const vehicleValue = this.formVehicle.value;

    this.vehicleEntry.entryDate = this.formatDateTime(vehicleValue.entryDate!);
    this.vehicleEntry.exitDatePrevision = vehicleValue?.exitDatePrevision == null ? null! : this.formatDateTime(vehicleValue.exitDatePrevision);
    this.vehicleEntry.vehiclePlate = vehicleValue.vehiclePlate!;

    this.vehicleEntry.vehicleFleet = vehicleValue.vehicleFleet == null ? '' : vehicleValue.vehicleFleet;
    this.vehicleEntry.modelId = vehicleValue.modelVehicle?.id!;
    this.vehicleEntry.modelDescription = vehicleValue.modelVehicle?.description!;
    this.vehicleEntry.vehicleColor = vehicleValue.vehicleColor?.color ?? null;
    this.vehicleEntry.attendantUserId = vehicleValue.attendant?.id ?? null;
    this.vehicleEntry.attendantUserName = vehicleValue.attendant?.name ?? "";
    this.vehicleEntry.vehicleKmEntry = vehicleValue?.kmEntry ?? "";
    this.vehicleEntry.vehicleKmExit = vehicleValue?.kmExit ?? "";

    this.vehicleEntry.numServiceOrder = vehicleValue?.numServiceOrder ?? "";
    this.vehicleEntry.numNfe = vehicleValue?.numNfe ?? "";
    this.vehicleEntry.numNfse = vehicleValue?.numNfse ?? "";

    this.vehicleEntry.vehicleNew = vehicleValue.vehicleNew!;
    this.vehicleEntry.vehicleServiceOrder = vehicleValue.vehicleServiceOrder!;
    this.vehicleEntry.attendantInformation = vehicleValue.information!;

    if (this.clientCompany != null) {
      this.vehicleEntry.clientCompanyId = this.clientCompany.id;
      this.vehicleEntry.clientCompanyName = this.clientCompany.name;
    } else {
      this.vehicleEntry.clientCompanyId = null;
      this.vehicleEntry.clientCompanyName = "";
    }

    this.vehicleEntry.driverEntryId = this.driverEntry.id;
    this.vehicleEntry.driverEntryName = this.driverEntry.name;

    if (this.driverExit != null) {
      this.vehicleEntry.driverExitId = this.driverExit.id;
      this.vehicleEntry.driverExitName = this.driverExit.name;
    }
    //Checklist
    if (this.modChecklist.id != null) {
      this.modChecklist.checklist1Desc = vehicleValue.checklist1Desc!;
      this.modChecklist.checklist2Desc = vehicleValue.checklist2Desc!;
      this.modChecklist.checklist3Desc = vehicleValue.checklist3Desc!;
      this.modChecklist.checklist4Desc = vehicleValue.checklist4Desc!;
      this.modChecklist.checklist5Desc = vehicleValue.checklist5Desc!;
      this.modChecklist.checklist6Desc = vehicleValue.checklist6Desc!;
      this.modChecklist.checklist7Desc = vehicleValue.checklist7Desc!;
      this.modChecklist.checklist8Desc = vehicleValue.checklist8Desc!;
      this.modChecklist.checklist9Desc = vehicleValue.checklist9Desc!;
      this.modChecklist.checklist10Desc = vehicleValue.checklist10Desc!;
      this.modChecklist.checklist11Desc = vehicleValue.checklist11Desc!;
      this.modChecklist.checklist12Desc = vehicleValue.checklist12Desc!;
      this.modChecklist.checklist13Desc = vehicleValue.checklist13Desc!;
      this.modChecklist.checklist14Desc = vehicleValue.checklist14Desc!;
      this.modChecklist.checklist15Desc = vehicleValue.checklist15Desc!;
      this.modChecklist.checklist16Desc = vehicleValue.checklist16Desc!;
      this.modChecklist.checklist17Desc = vehicleValue.checklist17Desc!;
      this.modChecklist.checklist18Desc = vehicleValue.checklist18Desc!;
      this.modChecklist.checklist19Desc = vehicleValue.checklist19Desc!;
      this.modChecklist.checklist20Desc = vehicleValue.checklist20Desc!;
    }

  }
  public async save() {
    if (StatusRoleFuncEnum.USER == this.storageService.roleFunc) {
      /* PERMISSION - 100 */
      /* EDITAR ENTRADA DO VEÍCULO */
      const permission = await this.searchPermission(100);
      if (!permission) { return; }
    }

    if (this.validInformation()) {
      //Inicia loading
      this.loadingService.show();
      //Loading data
      this.loadingVehicle();
      //Atualizar as imagens
      if (this.isPhotoNew1) {
        this.isPhotoNew1 = false;
        const img1 = await this.savePhoto(this.vehicleEntry, this.photoVehicle1(), 1);
        this.vehicleEntry.attendantPhoto1Url = img1;
      }
      if (this.isPhotoNew2) {
        this.isPhotoNew2 = false;
        const img2 = await this.savePhoto(this.vehicleEntry, this.photoVehicle2(), 2);
        this.vehicleEntry.attendantPhoto2Url = img2;
      }
      if (this.isPhotoNew3) {
        this.isPhotoNew3 = false;
        const img3 = await this.savePhoto(this.vehicleEntry, this.photoVehicle3(), 3);
        this.vehicleEntry.attendantPhoto3Url = img3;
      }
      if (this.isPhotoNew4) {
        this.isPhotoNew4 = false;
        const img4 = await this.savePhoto(this.vehicleEntry, this.photoVehicle4(), 4);
        this.vehicleEntry.attendantPhoto4Url = img4;
      }

      let path =
        `${this.vehicleEntry.companyId}/` +
        `${this.vehicleEntry.resaleId}/concierge/vehicle/` +
        `${this.vehicleEntry.id}/attendant/`;

      if (this.isPhotoDelete1) {
        this.isPhotoDelete1 = false;
        const formData = new FormData();
        formData.append("local", path + "image1.jpg");
        const del = await this.deleteImage(formData);
        this.vehicleEntry.attendantPhoto1Url = "";
      }
      if (this.isPhotoDelete2) {
        this.isPhotoDelete2 = false;
        const formData = new FormData();
        formData.append("local", path + "image2.jpg");
        const del = await this.deleteImage(formData);
        this.vehicleEntry.attendantPhoto2Url = "";
      }
      if (this.isPhotoDelete3) {
        this.isPhotoDelete3 = false;
        const formData = new FormData();
        formData.append("local", path + "image3.jpg");
        const del = await this.deleteImage(formData);
        this.vehicleEntry.attendantPhoto3Url = "";
      }
      if (this.isPhotoDelete4) {
        this.isPhotoDelete4 = false;
        const formData = new FormData();
        formData.append("local", path + "image4.jpg");
        const del = await this.deleteImage(formData);
        this.vehicleEntry.attendantPhoto4Url = "";
      }
      const resultVehicle = await this.updateVehicle(this.vehicleEntry);
      //Fecha loading
      this.loadingService.hide();
      if (resultVehicle.status == 200 && resultVehicle.body?.status == StatusSuccessError.succes) {
        //update checklist
        if (this.modChecklist.id != null) {
          const resultChecklist = await this.updateChecklist(this.modChecklist);
        }
        this.messageService.add({ severity: 'success', summary: resultVehicle.body.header, detail: resultVehicle.body.message, icon: 'pi pi-check' });
        //this.loadDriver();
      } else if (resultVehicle.status == 200 && resultVehicle.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: resultVehicle.body.header, detail: resultVehicle.body.message, icon: 'pi pi-info-circle' });
      }

    }
  }
  private async updateVehicle(vehicle: VehicleEntry): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryUpdate(vehicle));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Não catalogado.", icon: 'pi pi-times' });
      return error;
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
  /* Share vehicle data via WhatsApp */
  shareWhatsapp() {
    this.shareVehicleService.shareVehicle(this.vehicleEntry);
  }
  private async filterIdClient(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterVehicleTogether(together: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.filterTogether(together));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.saveImage(data));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async deleteImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.deleteImage(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
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
  private async filterChecklist(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.filterChecklist(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateChecklist(ch: VehicleEntryChecklist): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.updateChecklist(ch));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

}
