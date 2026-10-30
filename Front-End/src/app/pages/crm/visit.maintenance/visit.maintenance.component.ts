import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';

import { StepperModule } from 'primeng/stepper';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';

import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { ClientCompany } from '@/app/models/client.company';

import { Visit } from '@/app/models/crm/visit/visit';
import { ContactTypeEnum } from '@/app/models/crm/visit/contact.type.enum';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { lastValueFrom } from 'rxjs';
import { Salesperson } from '@/app/models/crm/salesperson';
import { UserService } from '@/app/services/user/user.service';
import { HttpResponse } from '@angular/common/http';
import { User } from '@/app/models/user';
import { ISalespersonType } from '@/app/interfaces/salesperson/i.salesperson.type';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { LoadingService } from '@/app/services/loading/loading.service';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';

interface IReazonVisit {
  id: number;
  description: string;
}

interface IProductsInterest {
  id: number;
  description: string;
}

@Component({
  selector: 'app-visit-maintenance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FilterClientComponent, SelectModule, DatePickerModule, DialogModule,
    InputTextModule, RadioButtonModule, TextareaModule, StepperModule, ToastModule, ButtonModule, RouterModule, InputMaskModule, InputNumberModule, CheckboxModule],
  templateUrl: './visit.maintenance.component.html',
  styleUrl: './visit.maintenance.component.scss',
  providers: [MessageService]
})
export default class VisitMaintenanceComponent implements OnInit {
  private visit!: Visit;
  private isSaveStep1: boolean = false;
  private isSaveStep2: boolean = false;
  private isSaveStep3: boolean = false;
  private isSaveStep4: boolean = false;
  private user!: User;
  activeStepper = signal<number>(1);
  visibleSalesperson: boolean = false;
  selectClient = signal<ClientCompany | null>(null);
  INPERSON = ContactTypeEnum.IN_PERSON;
  PHONE = ContactTypeEnum.PHONE;
  CELLPHONE = ContactTypeEnum.CELLPHONE;
  EMAIL = ContactTypeEnum.EMAIL;
  formVisit = new FormGroup({
    clientNotExists: new FormControl<boolean>(false),
    clientId: new FormControl<number | null>(null),
    clientName: new FormControl<string>('', Validators.required),
    clientCNPJ: new FormControl<string>(''),
    clientCPF: new FormControl<string>(''),
    contactType: new FormControl<ContactTypeEnum>(ContactTypeEnum.IN_PERSON),
    contact: new FormControl<string>(''),
    reasonVisit: new FormControl<IReazonVisit[]>([], Validators.required),
    reasonInfoChecked: new FormControl<boolean>(false),
    reasonInfo: new FormControl<string>(''),
    products: new FormControl<IProductsInterest[]>([], Validators.required),
    productsInfoChecked: new FormControl<boolean>(false),
    productsInfo: new FormControl<string>(''),
    salesperson: new FormControl<Salesperson | null>(null, Validators.required),
    salespersonInfo: new FormControl<string>(''),
    dateVisit: new FormControl<Date>(new Date(), Validators.required),
    timeVisit: new FormControl<Date>(new Date(), Validators.required)
  });
  reasonVisits = signal<IReazonVisit[]>([]);
  products = signal<IProductsInterest[]>([]);
  salespersons = signal<Salesperson[]>([]);
  salespersonImage = signal<string>('');
  visibleDateVisit: boolean = false;
  weekDays: Date[] = [];

  constructor(
    private visitService: VisitService,
    private loadingService: LoadingService,
    private userService: UserService,
    private salespersonService: SalespersonService,
    private messageService: MessageService,
    private location: Location) { }

  ngOnInit(): void {

    const state = this.location.getState() as { visit?: Visit };
    this.visit = state?.visit! ?? null;



    this.reasonVisits.set([
      { id: 1, description: 'Implemento Librelato' },
      { id: 2, description: 'Consorcio Nacional Librelato' },
      { id: 3, description: 'Sistema de telemetria (Sigaway)' },
      { id: 4, description: 'Peças e pneus' },
      { id: 5, description: 'Oficina: Serviços mecânicos, hidráulicos, pneumáticos' },
      { id: 6, description: 'Reforma ou corretiva (Pintura, desempeno chassis, jateamento, solda)' },
      { id: 7, description: 'Plano manutenção preventiva' }
    ]);
    this.products.set([
      { id: 1, description: 'Consórcio' },
      { id: 2, description: 'Serviços e Peças' },
      { id: 3, description: 'Graneleiro' },
      { id: 4, description: 'Porta Container' },
      { id: 5, description: 'Bau lonado / sider' },
      { id: 6, description: 'Bau Aluminio' },
      { id: 7, description: 'Tanque' },
      { id: 8, description: 'Carrega tudo' },
      { id: 9, description: 'Frigorifico' }
    ]);
    this.init();
  }

  onChangeStep(e: any) {
    this.activeStepper.set(e);
  }

  private async init() {
    //Editar visita
    if (this.visit) {
      this.edit();
    } else {
      this.loadingService.show();
      let types: ISalespersonType = { typeSalesPart: YesNotEnum.NOT, typeSalesService: YesNotEnum.NOT, typeSalesVehicle: YesNotEnum.YES };
      this.salespersons.set(await this.filterTypeSalesperson(types));
      const resultUser = await this.getUser();
      if (resultUser.status === 200) {
        this.user = resultUser.body!;
        const resultFind = this.salespersons().find(p => p.userId === this.user.id);
        if (resultFind) {
          this.salespersonImage.set(resultFind.photoUrl);
          this.formVisit.get('salesperson')?.setValue(resultFind);
        }
      }
      this.loadingService.hide();
    }
  }

  private async edit() {
    let types: ISalespersonType = { typeSalesPart: YesNotEnum.NOT, typeSalesService: YesNotEnum.NOT, typeSalesVehicle: YesNotEnum.YES };
    this.salespersons.set(await this.filterTypeSalesperson(types));
    const salesperson = this.salespersons().find(p => p.id === this.visit.salespersonId);
    this.salespersonImage.set(salesperson?.photoUrl ?? '');

    this.formVisit.patchValue({
      clientId: this.visit.clientId ,
      clientName: this.visit.clientName,
      clientCNPJ: this.visit.clientCNPJ,
      clientCPF: this.visit.clientCPF,

      

      salesperson: salesperson ?? null,
      salespersonInfo: this.visit.salespersonInfo,
    });


    

    if(this.visit.clientId == null){
       this.formVisit.get('clientNotExists')?.setValue(true);

    }

    this.isSaveStep1 = true;

  }

  //STEP CLIENT
  onChangecheckBoxClient(event: CheckboxChangeEvent) {
    //Limpa os dados do cliente
    this.selectClient.set(null);
    this.formVisit.patchValue({
      clientId: null,
      clientName: '',
      clientCNPJ: '',
      clientCPF: ''
    });
  }

  onSelectClient(client: ClientCompany | null) {
    this.selectClient.set(client);
    this.formVisit.patchValue({
      clientId: client?.id,
      clientName: client?.name,
      clientCNPJ: client?.cnpj ?? '',
      clientCPF: client?.cpf ?? ''
    });
  }

  fisrtStepper() {
    this.activeStepper.set(1);
  }

  private fisrtStepperValid(): boolean {
    //Cliente sem cadastro
    if (this.formVisit.get('clientNotExists')?.value === true) {
      //Nome Obrigatório 
      if (this.formVisit.get('clientName')?.value?.trim() === '') {
        this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Cliente não informado.', icon: 'pi pi-info-circle' });
        return false;
      }
    } else {
      if (!this.selectClient()) {
        this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Cliente não informado.', icon: 'pi pi-info-circle' });
        return false;
      }
    }
    if (this.formVisit.get('salesperson')?.value == null) {
      this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Vendedor não informado.', icon: 'pi pi-info-circle' });
      return false;
    }
    return true;
  }
  //STEP CLIENT END
  changeContactType() {
    this.formVisit.get('contact')?.setValue('');
  }

  async stepperLocation() {
    //Valid Client
    if (!this.fisrtStepperValid()) {
      return;
    }
    if (this.isSaveStep1 === false) {
      const result = await this.saveNew();
      if (result === true) {
        this.activeStepper.set(2);
      }
    } else {
      this.activeStepper.set(2);
    }
  }

  async stepperReasonVisit() {
    //Valid Client
    if (!this.fisrtStepperValid()) {
      return;
    }
    if (this.isSaveStep2 === false) {
      const result = await this.saveUpdate();
      if (result === true) {
        this.isSaveStep2 = true;
        this.activeStepper.set(3);
      }
    } else {
      this.activeStepper.set(3);
    }
  }

  private stepperReasonVisitValid(): boolean {
    const { value } = this.formVisit;
    if (value.reasonVisit?.length === 0 && value.reasonInfoChecked === false) {
      this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Motivo não marcado.', icon: 'pi pi-info-circle' });
      return false;
    }
    if (value.reasonInfoChecked === true && value.reasonInfo === '') {
      this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Motivo (OUTRO) marcado, descrição não informada.', icon: 'pi pi-info-circle' });
      return false;
    }
    return true;
  }

  async stepperProduct() {
    //Valida motivo da visita
    if (!this.stepperReasonVisitValid()) {
      return;
    }
    if (this.isSaveStep3 === false) {
      const result = await this.saveUpdate();
      if (result === true) {
        this.isSaveStep3 = true;
        this.activeStepper.set(4);
      }
    } else {
      this.activeStepper.set(4);
    }
  }

  private stepperProductValid(): boolean {
    const { value } = this.formVisit;
    if (value.products?.length === 0 && value.productsInfoChecked === false) {
      this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Produto não marcado.', icon: 'pi pi-info-circle' });
      return false;
    }
    if (value.productsInfoChecked === true && value.productsInfo === '') {
      this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Produto (OUTRO) marcado, descrição não informada.', icon: 'pi pi-info-circle' });
      return false;
    }
    return true;
  }

  async stepperInformation() {
    if (!this.stepperProductValid()) {
      return;
    } if (this.isSaveStep4 === false) {
      const result = await this.saveUpdate();
      if (result === true) {
        this.isSaveStep4 = true;
        this.activeStepper.set(5);
      }
    } else {
      this.activeStepper.set(5);
    }

  }

  onChangeSalesperson(event: SelectChangeEvent) {
    if (event.value) {
      const p: Salesperson = event.value;
      this.formVisit.get('salesperson')?.setValue(p);
      this.salespersonImage.set(p.photoUrl);
    } else {
      this.formVisit.get('salesperson')?.setValue(null);
      this.salespersonImage.set('');
    }
  }

  private async saveNew(): Promise<boolean> {
    const { value } = this.formVisit;
    this.visit = new Visit();
    this.visit.clientId = value?.clientId ?? null;
    this.visit.clientName = value.clientName!;
    this.visit.clientCNPJ = value?.clientCNPJ ?? '';
    this.visit.clientCPF = value?.clientCPF ?? '';
    this.visit.salespersonId = value.salesperson?.id ?? null;
    this.visit.salespersonName = value.salesperson?.name ?? '';
    this.loadingService.show();
    const result = await this.registerNew(this.visit);
    this.loadingService.hide();
    if (result.status === 201) {
      this.isSaveStep1 = true;
      this.visit = result.body!;
      return true;
    }
    return false;
  }
  private async saveUpdate(): Promise<boolean> {
    const { value, } = this.formVisit;
    this.visit.clientId = value?.clientId ?? null;
    this.visit.clientName = value.clientName!;
    this.visit.clientCNPJ = value?.clientCNPJ ?? '';
    this.visit.clientCPF = value?.clientCPF ?? '';
    this.visit.contactType = value.contactType!;
    this.visit.contact = value?.contact ?? '';
    this.visit.reasonVisit = value?.reasonVisit!.map((r: IReazonVisit) => r.id).join(',') ?? '';
    this.visit.reasonVisitInfo = value.reasonInfoChecked ? value.reasonInfo! : '';
    this.visit.products = value?.products!.map((p: IProductsInterest) => p.id).join(',') ?? '';
    this.visit.productsInfo = value.productsInfoChecked ? value.productsInfo! : '';
    this.visit.salespersonId = value.salesperson?.id ?? null;
    this.visit.salespersonName = value.salesperson?.name ?? '';
    this.visit.salespersonInfo = value?.salespersonInfo ?? '';
    this.loadingService.show();
    const result = await this.registerUpdate(this.visit);
    this.loadingService.hide();
    if (result.status === 200) {
      return true;
    }
    return false;
  }
  async saveComplete() {
    const { value, valid } = this.formVisit;
    if (!valid) return;
    this.visit.status = StatusVisitEnum.CLOSE;
    this.visit.clientId = value?.clientId ?? null;
    this.visit.clientName = value.clientName!;
    this.visit.clientCNPJ = value?.clientCNPJ ?? '';
    this.visit.clientCPF = value?.clientCPF ?? '';
    this.visit.contactType = value.contactType!;
    this.visit.contact = value?.contact ?? '';
    this.visit.reasonVisit = value?.reasonVisit!.map((r: IReazonVisit) => r.id).join(',') ?? '';
    this.visit.reasonVisitInfo = value.reasonInfoChecked ? value.reasonInfo! : '';
    this.visit.products = value?.products!.map((p: IProductsInterest) => p.id).join(',') ?? '';
    this.visit.productsInfo = value.productsInfoChecked ? value.productsInfo! : '';
    this.visit.salespersonId = value.salesperson?.id ?? null;
    this.visit.salespersonName = value.salesperson?.name ?? '';
    this.visit.salespersonInfo = value?.salespersonInfo ?? '';
    const dateVisit = value.dateVisit;
    const timeVisit = value.timeVisit;
    if (!(dateVisit instanceof Date) || !(timeVisit instanceof Date)) {
      return;
    }
    this.visit.dateVisit = this.formatDateTime(new Date(
      dateVisit.getFullYear(),
      dateVisit.getMonth(),
      dateVisit.getDate(),
      timeVisit.getHours(),
      timeVisit.getMinutes(),
      0,
      0
    ));
    this.loadingService.show();
    const result = await this.registerUpdate(this.visit);
    this.loadingService.hide();
    if (result.status === 200) {
      this.messageService.add({ severity: 'success', summary: 'Visita', detail: 'Registrada com sucesso', icon: 'pi pi-check' });
      this.visibleDateVisit = false;
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

  private async filterTypeSalesperson(types: ISalespersonType): Promise<Salesperson[]> {
    try {
      return await lastValueFrom(this.salespersonService.filterType(types));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.emessage, icon: 'pi pi-times' });
      return [];
    }
  }

  private async getUser(): Promise<HttpResponse<User>> {
    try {
      return await lastValueFrom(this.userService.getUser());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.emessage, icon: 'pi pi-times' });
      return error;
    }
  }

  private async registerNew(v: Visit): Promise<HttpResponse<Visit>> {
    try {
      return await lastValueFrom(this.visitService.registerNew(v));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.emessage, icon: 'pi pi-times' });
      return error;
    }
  }

  private async registerUpdate(v: Visit): Promise<HttpResponse<Visit>> {
    try {
      return await lastValueFrom(this.visitService.registerUpdate(v));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.emessage, icon: 'pi pi-times' });
      return error;
    }
  }

  openDateVisit(): void {
    const { valid } = this.formVisit;
    if (!valid) return;
    const now = new Date();
    // Semana de domingo a sábado.
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - now.getDay()
    );

    this.weekDays = Array.from({ length: 7 }, (_, index) =>
      new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
    );

    this.formVisit.patchValue({
      dateVisit: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      timeVisit: new Date(now)
    });

    this.visibleDateVisit = true;
  }

  selectVisitDate(date: Date): void {
    const control = this.formVisit.get('dateVisit');

    control?.setValue(date);
    control?.markAsDirty();
  }

  isSelectedDate(date: Date): boolean {
    const selected = this.formVisit.get('dateVisit')?.value;

    return selected instanceof Date &&
      selected.getFullYear() === date.getFullYear() &&
      selected.getMonth() === date.getMonth() &&
      selected.getDate() === date.getDate();
  }

  changeWeek(direction: number): void {
    if (!this.weekDays.length) return;

    const firstDay = this.weekDays[0];

    this.weekDays = Array.from({ length: 7 }, (_, index) =>
      new Date(
        firstDay.getFullYear(),
        firstDay.getMonth(),
        firstDay.getDate() + direction * 7 + index
      )
    );
  }

}
