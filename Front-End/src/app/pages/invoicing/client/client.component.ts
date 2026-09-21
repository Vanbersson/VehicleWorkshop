import { Component, DoCheck, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';


import { ClientCompany } from '@/app/models/client.company';
import { ClientCategory } from '@/app/models/client.category';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { FisJurEnum } from '@/app/models/fis.jur.enum';
import { ITypeClient } from '@/app/interfaces/i.type.client';
import { StorageService } from '@/app/services/storage/storage.service';
import { CEPService } from '@/app/services/cep/cep.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { CliForEnum } from '@/app/models/cli.for.enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { ClientCategoryService } from '@/app/services/client/client.category.service';
import { FilterClientApolloComponent } from '@/app/components/filter.client.apollo/filter.client.apollo.component';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [CommonModule, TabsModule, ButtonModule, InputTextModule, TableModule, DatePickerModule, FilterClientApolloComponent,
    SelectModule, InputNumberModule, IconFieldModule, InputIconModule, DialogModule,
    InputMaskModule, InputGroupModule, ConfirmDialogModule, ToastModule, RadioButtonModule,
    ReactiveFormsModule],
  templateUrl: './client.component.html',
  styleUrl: './client.component.scss',
  providers: [ConfirmationService, MessageService]
})
export default class ClientComponent implements OnInit, DoCheck {
  activeTab: number = 0;
  categories = signal<ClientCategory[]>([]);
  clients = signal<ClientCompany[]>([]);
  client!: ClientCompany;
  isClientNew = signal(true);

  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;
  clifor: ITypeClient[] = [];

  fisica = FisJurEnum.FISICA;
  juridica = FisJurEnum.JURIDICA;
  outras = FisJurEnum.OUTRAS;

  formClient = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    fantasia: new FormControl<string>(""),
    name: new FormControl<string>("", Validators.required),
    category: new FormControl<ClientCategory | null>(null, Validators.required),
    clifor: new FormControl<ITypeClient | null>(null, Validators.required),
    fisjur: new FormControl<string>(FisJurEnum.FISICA),
    cnpj: new FormControl<string>(""),
    ie: new FormControl<string>(""),
    im: new FormControl<string>(""),
    cpf: new FormControl<string>(""),
    rg: new FormControl<string | null>(null),
    rgExpedidor: new FormControl<string>(""),
    dateBirth: new FormControl<Date | string>(""),
    dddPhone: new FormControl<string | null>(null),
    phone: new FormControl<string | null>(null),
    dddCellphone: new FormControl<string | null>(null),
    cellphone: new FormControl<string | null>(null),
    emailHome: new FormControl<string>(""),
    emailWork: new FormControl<string>(""),
    zipCode: new FormControl<string>("", Validators.required),
    address: new FormControl<string>("", Validators.required),
    addressNumber: new FormControl<string | null>(null),
    state: new FormControl<string>("", Validators.required),
    city: new FormControl<string>("", Validators.required),
    neighborhood: new FormControl<string>("", Validators.required),
    addressComplement: new FormControl<string>(""),
    contactName: new FormControl<string>(""),
    contactEmail: new FormControl<string>(""),
    contactDDDPhone: new FormControl<string | null>(null),
    contactPhone: new FormControl<string | null>(null),
    contactDDDCellphone: new FormControl<string | null>(null),
    contactCellphone: new FormControl<string | null>(null),
  });

  //Dialog edit
  visibleDialog: boolean = false;
  showJuridica = signal(false);
  showFisica = signal(false);
  editCNPJCPF = signal(true);

  importClientCompanyApollo = signal<ClientCompany>(new ClientCompany());

  constructor(
    private loadingService: LoadingService,
    private storageService: StorageService,
    private categoryService: ClientCategoryService,
    private cepService: CEPService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private clientService: ClientCompanyService) {
  }
  ngDoCheck(): void {
    //Client
    if (this.importClientCompanyApollo().id != null) {
      this.importEditClient(this.importClientCompanyApollo());
      this.importClientCompanyApollo.set(new ClientCompany());
    }
  }

  ngOnInit(): void {
    this.clifor = [
      { type: CliForEnum.CLIENTE, value: CliForEnum.CLIENTE },
      { type: CliForEnum.FORNECEDOR, value: CliForEnum.FORNECEDOR },
      { type: CliForEnum.AMBOS, value: CliForEnum.AMBOS }];
    this.init();
  }

  changeTabs(index: any) {
    this.activeTab = index as number;
  }


  private async init() {
    //Show load
    this.loadingService.show();
    const result = await this.listAll();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.clients.set(result.body.data);
    }

    const resultCate = await this.listAllCategories();
    this.categories.set(resultCate.body?.data);

    //Close load
    this.loadingService.hide();
  }

  changeType() {
    this.activeTab = 0;
    if (this.formClient.value.fisjur == FisJurEnum.JURIDICA) {
      this.showJuridica.set(true);
      this.showFisica.set(false);
      this.addValidCNPJ();
      this.removeValidCPF();
      this.formClient.patchValue({ cnpj: "" });
    } else if (this.formClient.value.fisjur == FisJurEnum.FISICA) {
      this.showFisica.set(true);
      this.showJuridica.set(false);
      this.addValidCPF();
      this.removeValidCNPJ();
      this.formClient.patchValue({ cpf: "" });
    } else if (this.formClient.value.fisjur == FisJurEnum.OUTRAS) {
      this.showFisica.set(true);
      this.showJuridica.set(false);
      this.removeValidCNPJ();
      this.removeValidCPF();
      this.formClient.patchValue({ cpf: "00000000000" });
    }
  }

  private async listAll(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private addValidCNPJ() {
    this.formClient.controls['cnpj'].addValidators(Validators.required);
    this.formClient.controls['cnpj'].updateValueAndValidity();
  }

  private removeValidCNPJ() {
    this.formClient.controls['cnpj'].removeValidators(Validators.required);
    this.formClient.controls['cnpj'].updateValueAndValidity();
  }

  private addValidCPF() {
    this.formClient.controls['cpf'].addValidators(Validators.required);
    this.formClient.controls['cpf'].updateValueAndValidity();
  }

  private removeValidCPF() {
    this.formClient.controls['cpf'].removeValidators(Validators.required);
    this.formClient.controls['cpf'].updateValueAndValidity();
  }

  maskCNPJ(cnpj: string): string {
    if (cnpj == "") return "";
    const CNPJ = cnpj.substring(0, 2) + "." + cnpj.substring(2, 5) + "." + cnpj.substring(5, 8) + "/" + cnpj.substring(8, 12) + "-" + cnpj.substring(12, 14);
    return CNPJ;
  }

  maskCPF(cpf: string): string {
    if (cpf == "") return "";
    const CPF = cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9, 11);
    return CPF;
  }

  showDialog() {
    this.cleanFormClient();
    this.visibleDialog = true;
  }

  hideDialog() {
    this.visibleDialog = false;
  }

  newClient() {
    this.showDialog();
    this.activeTab = 0;
    this.enableClientCnpj();
    this.enableClientCpf();
    this.isClientNew.set(true);
    this.client = new ClientCompany();
    this.editCNPJCPF.set(true);
    //habilita o tipo de cliente
    this.formClient.get("fisjur")?.enable();

    //Começa na aba PF
    this.showFisica.set(true);
    this.showJuridica.set(false);
    this.addValidCPF();
    this.removeValidCNPJ();
  }

  save() {
    if (this.isClientNew()) {
      this.saveNewClient();
    } else {
      this.saveUpdateClient();
    }
  }

  private async saveNewClient() {
    const { value, valid } = this.formClient;
    if (!valid) {
      return;
    }

    this.client.companyId = this.storageService.companyId;
    this.client.resaleId = this.storageService.resaleId;
    this.client.status = value.status!;
    this.client.name = value.name!;
    this.client.fantasia = value.fantasia!;
    this.client.categoryId = value.category!.id;
    this.client.clifor = this.getCliFor(value.clifor!.value);
    this.client.fisjur = this.getFisJur(value.fisjur!);
    this.client.dddPhone = value.dddPhone != null ? value.dddPhone : "";
    this.client.phone = value.phone != null ? value.phone : "";
    this.client.dddCellphone = value.dddCellphone != null ? value.dddCellphone : "";
    this.client.cellphone = value.cellphone != null ? value.cellphone : "";
    this.client.emailHome = value.emailHome!;
    this.client.emailWork = value.emailWork!;
    this.client.zipCode = value.zipCode!;
    this.client.address = value.address!;
    this.client.addressNumber = value.addressNumber != null ? value.addressNumber : "";
    this.client.city = value.city!;
    this.client.state = value.state!;
    this.client.neighborhood = value.neighborhood!;
    this.client.addressComplement = value.addressComplement!;
    this.client.cnpj = value.cnpj!;
    this.client.ie = value.ie!;
    this.client.im = value.im!;
    this.client.cpf = value.cpf!;
    this.client.rg = value.rg != null ? value.rg : "";
    this.client.rgExpedidor = value.rgExpedidor!;
    this.client.dateBirth = value.dateBirth!;
    this.client.contactName = value.contactName!;
    this.client.contactEmail = value.contactEmail!;
    this.client.contactDDDPhone = value.contactDDDPhone != null ? value.contactDDDPhone : "";
    this.client.contactPhone = value.contactPhone != null ? value.contactPhone : "";
    this.client.contactDDDCellphone = value.contactDDDCellphone != null ? value.contactDDDCellphone : "";
    this.client.contactCellphone = value.contactCellphone != null ? value.contactCellphone : "";

    const result = await this.saveClient(this.client);
    if (result.status == 201 && result.body?.status == StatusSuccessError.succes) {
      this.client = result.body.data;
      this.formClient.get("id")?.setValue(this.client.id);
      //desabilita o tipo de cliente
      this.formClient.get("fisjur")?.disable();
      //alterar para cliente existente
      this.isClientNew.set(false);
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      //lista os clientes novamente
      const resultCli = await this.listAll();
      if (resultCli.status == 200 && resultCli.body?.status == StatusSuccessError.succes) {
        this.clients.set(resultCli.body.data);
      }
    }
    if (result.status == 201 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });

    }
  }
  async importEditClient(cli: ClientCompany) {
    this.isClientNew.set(true);
    this.client = new ClientCompany();
    this.disableClientId();
    this.editCNPJCPF.set(true);
    this.activeTab = 0;
    //habilita o tipo de cliente
    this.formClient.get("fisjur")?.enable();
    this.showDialog();

    if (cli.fisjur == FisJurEnum.JURIDICA) {
      this.showJuridica.set(true);
      this.showFisica.set(false);
      this.addValidCNPJ();
      this.removeValidCPF();
      this.formClient.get('cnpj')?.enable();
    } else if (cli.fisjur == FisJurEnum.FISICA) {
      this.showFisica.set(true);
      this.showJuridica.set(false);
      this.addValidCPF();
      this.removeValidCNPJ();
      this.formClient.get('cpf')?.enable();
    } else if (cli.fisjur == FisJurEnum.OUTRAS) {
      this.showFisica.set(true);
      this.showJuridica.set(false);
      this.removeValidCNPJ();
      this.removeValidCPF();
    }

    this.formClient.patchValue({
      fantasia: cli.fantasia,
      name: cli.name,
      category: null,
      clifor: { type: cli.clifor, value: cli.clifor },
      fisjur: cli.fisjur,
      cnpj: cli.cnpj != undefined ? cli.cnpj : '',
      ie: cli.ie != undefined ? cli.ie : '',
      im: cli.im != undefined ? cli.im : '',
      cpf: cli.cpf != undefined ? cli.cpf : '',
      rg: cli.rg != "" ? cli.rg : null,
      rgExpedidor: cli.rgExpedidor != undefined ? cli.rgExpedidor : '',
      dateBirth: cli.dateBirth != undefined ? new Date(cli.dateBirth) : null,
      dddPhone: cli.dddPhone != "" ? cli.dddPhone : null,
      phone: cli.phone != "" ? cli.phone : null,
      dddCellphone: cli.dddCellphone != undefined ? cli.dddCellphone : '',
      cellphone: cli.cellphone != undefined ? cli.cellphone : '',
      emailHome: cli.emailHome,
      emailWork: cli.emailWork,
      zipCode: cli.zipCode,
      address: cli.address,
      addressNumber: cli.addressNumber != undefined ? cli.addressNumber : null,
      state: cli.state,
      city: cli.city,
      neighborhood: cli.neighborhood,
      addressComplement: cli.addressComplement,
      contactName: cli.contactName != undefined ? cli.contactName : '',
      contactEmail: cli.contactEmail != undefined ? cli.contactEmail : '',
      contactDDDPhone: cli.contactDDDPhone != undefined ? cli.contactDDDPhone : '',
      contactPhone: cli.contactPhone != undefined ? cli.contactPhone : '',
      contactDDDCellphone: cli.contactDDDCellphone != undefined ? cli.contactDDDCellphone : '',
      contactCellphone: cli.contactCellphone != undefined ? cli.contactCellphone : '',
    });
  }
  async editClient(cli: ClientCompany) {
    const resultFilter = await this.filterIdClient(cli.id!);
    if (resultFilter.status == 200 && resultFilter.body?.status == StatusSuccessError.succes) {
      cli = resultFilter.body.data;
      //this.messageService.add({ severity: 'success', summary: resultFilter.body.header, detail: resultFilter.body.message, icon: 'pi pi-check' });
    }
    if (resultFilter.status == 200 && resultFilter.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultFilter.body.header, detail: resultFilter.body.message, icon: 'pi pi-info-circle' });
      return;
    }
    if (resultFilter.status != 200) {
      return;
    }
    this.disableClientId();
    this.disableClientCnpj();
    this.disableClientCpf();

    this.activeTab = 0;
    this.showDialog();

    this.isClientNew.set(false);
    this.editCNPJCPF.set(false);

    this.client = cli;
    //desabilita o tipo de cliente
    this.formClient.get("fisjur")?.disable();

    if (this.client.fisjur == FisJurEnum.JURIDICA) {
      this.showJuridica.set(true);
      this.showFisica.set(false);
      this.addValidCNPJ();
      this.removeValidCPF();
    } else if (this.client.fisjur == FisJurEnum.FISICA) {
      this.showFisica.set(true);
      this.showJuridica.set(false);
      this.addValidCPF();
      this.removeValidCNPJ();
    } else if (this.client.fisjur == FisJurEnum.OUTRAS) {
      this.showFisica.set(true);
      this.showJuridica.set(false);
      this.removeValidCNPJ();
      this.removeValidCPF();
    }

    this.formClient.patchValue({
      status: cli.status,
      id: cli.id,
      fantasia: cli.fantasia,
      name: cli.name,
      category: this.filterIdCategory(this.client.categoryId!),
      clifor: { type: cli.clifor, value: cli.clifor },
      fisjur: cli.fisjur,
      cnpj: cli.cnpj,
      ie: cli.ie,
      im: cli.im,
      cpf: cli.cpf,
      rg: cli.rg != "" ? cli.rg : null,
      rgExpedidor: cli.rgExpedidor,
      dateBirth: cli.dateBirth != null ? new Date(cli.dateBirth) : null,
      dddPhone: cli.dddPhone != "" ? cli.dddPhone : null,
      phone: cli.phone != "" ? cli.phone : null,
      dddCellphone: cli.dddCellphone != "" ? cli.dddCellphone : null,
      cellphone: cli.cellphone != "" ? cli.cellphone : null,
      emailHome: cli.emailHome,
      emailWork: cli.emailWork,
      zipCode: cli.zipCode,
      address: cli.address,
      addressNumber: cli.addressNumber != "" ? cli.addressNumber : null,
      state: cli.state,
      city: cli.city,
      neighborhood: cli.neighborhood,
      addressComplement: cli.addressComplement,
      contactName: cli.contactName,
      contactEmail: cli.contactEmail,
      contactDDDPhone: cli.contactDDDPhone != "" ? cli.contactDDDPhone : null,
      contactPhone: cli.contactPhone != "" ? cli.contactPhone : null,
      contactDDDCellphone: cli.contactDDDCellphone != "" ? cli.contactDDDCellphone : null,
      contactCellphone: cli.contactCellphone != "" ? cli.contactCellphone : null,
    });
  }

  async saveUpdateClient() {
    this.enableClientCnpj();
    this.enableClientCpf();

    const { value, valid } = this.formClient;
    if (!valid) {
      this.disableClientCnpj();
      this.disableClientCpf();
      return;
    }

    this.client.status = value.status!;
    this.client.name = value.name!;
    this.client.fantasia = value.fantasia!;
    this.client.categoryId = value.category!.id;
    this.client.clifor = this.getCliFor(value.clifor!.value);
    this.client.dddPhone = value.dddPhone != null ? value.dddPhone : "";
    this.client.phone = value.phone != null ? value.phone : "";
    this.client.dddCellphone = value.dddCellphone != null ? value.dddCellphone : "";
    this.client.cellphone = value.cellphone != null ? value.cellphone : "";
    this.client.emailHome = value.emailHome!;
    this.client.emailWork = value.emailWork!;
    this.client.zipCode = value.zipCode!;
    this.client.address = value.address!;
    this.client.addressNumber = value.addressNumber != null ? value.addressNumber : "";;
    this.client.city = value.city!;
    this.client.state = value.state!;
    this.client.neighborhood = value.neighborhood!;
    this.client.addressComplement = value.addressComplement!;
    this.client.cnpj = value.cnpj!;
    this.client.ie = value.ie!;
    this.client.im = value.im!;
    this.client.cpf = value.cpf!;
    this.client.rg = value.rg != null ? value.rg : "";
    this.client.rgExpedidor = value.rgExpedidor!;
    this.client.dateBirth = value.dateBirth!;
    this.client.contactName = value.contactName!;
    this.client.contactEmail = value.contactEmail!;
    this.client.contactDDDPhone = value.contactDDDPhone != null ? value.contactDDDPhone : "";
    this.client.contactPhone = value.contactPhone != null ? value.contactPhone : "";
    this.client.contactDDDCellphone = value.contactDDDCellphone != null ? value.contactDDDCellphone : "";
    this.client.contactCellphone = value.contactCellphone != null ? value.contactCellphone : "";
    //Show load
    this.loadingService.show();
    const resultClient = await this.updateClient(this.client);
    if (resultClient.status == 200 && resultClient.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultClient.body.header, detail: resultClient.body.message, icon: 'pi pi-check' });
      //lista os clientes novamente
      const result = await this.listAll();
      if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
        this.clients.set(result.body.data);
      }
    } else if (resultClient.status == 200 && resultClient.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultClient.body.header, detail: resultClient.body.message, icon: 'pi pi-info-circle' });
    }
    //close load
    this.loadingService.hide();

    this.disableClientCnpj();
    this.disableClientCpf();
    this.editCNPJCPF.set(false);
  }

  private async saveClient(client: ClientCompany): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.save(client));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
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

  private async updateClient(client: ClientCompany): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.update(client));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private cleanFormClient() {
    this.formClient.patchValue({
      status: this.enabled,
      id: null,
      name: "",
      fantasia: "",
      category: null,
      clifor: null,
      fisjur: FisJurEnum.FISICA,
      cnpj: "",
      cpf: "",
      ie: "",
      im: "",
      rg: null,
      rgExpedidor: "",
      dateBirth: "",
      dddPhone: null,
      phone: null,
      dddCellphone: null,
      cellphone: null,
      emailHome: "",
      emailWork: "",
      zipCode: null,
      address: "",
      addressNumber: null,
      state: "",
      city: "",
      neighborhood: "",
      addressComplement: "",
      contactName: "",
      contactEmail: "",
      contactDDDPhone: null,
      contactPhone: null,
      contactDDDCellphone: null,
      contactCellphone: null,
    });
  }

  confirm(value: string) {
    //Só pode alterar se for PF ou PJ
    if (this.formClient.get('fisjur')?.value == FisJurEnum.OUTRAS) {
      return;
    }
    this.confirmationService.confirm({
      header: 'Alterar ' + value + '?',
      message: 'Por favor comfirme para alterar.',
      acceptLabel: 'Comfirmar',
      accept: () => {
        if (value == "CNPJ") {
          this.enableClientCnpj();
        }
        if (value == "CPF") {
          this.enableClientCpf();
        }
        this.editCNPJCPF.set(true);
      }
    });
  }


  disableClientId() {
    this.formClient.get("id")?.disable();
  }
  enableClientCnpj() {
    this.formClient.get("cnpj")?.enable();
  }
  disableClientCnpj() {
    this.formClient.get("cnpj")?.disable();
  }
  enableClientCpf() {
    this.formClient.get("cpf")?.enable();
  }
  disableClientCpf() {
    this.formClient.get("cpf")?.disable();
  }

  public async searchCEP() {
    if (!this.formClient.get('zipCode')?.value) {
      return;
    }
    const result = await this.cep(this.formClient.get('zipCode')?.value!);

    if (result.status == 200) {
      this.formClient.patchValue({
        address: result.body.logradouro,
        addressComplement: result.body.complemento,
        state: result.body.uf,
        city: result.body.localidade,
        neighborhood: result.body.bairro
      });
    }

  }

  private async cep(cep: string): Promise<HttpResponse<any>> {
    try {
      return await lastValueFrom(this.cepService.search(cep));
    } catch (error: any) {
      return error;
    }
  }

  private async listAllCategories(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.categoryService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private filterIdCategory(id: number): ClientCategory {
    return this.categories().find(c => c.id === id)!;
  }

  private getCliFor(value: string): CliForEnum {
    if (value == CliForEnum.CLIENTE)
      return CliForEnum.CLIENTE;
    if (value == CliForEnum.FORNECEDOR)
      return CliForEnum.FORNECEDOR;

    return CliForEnum.AMBOS;
  }

  private getFisJur(value: string): FisJurEnum {
    if (value == FisJurEnum.FISICA)
      return FisJurEnum.FISICA;
    if (value == FisJurEnum.JURIDICA)
      return FisJurEnum.JURIDICA;

    return FisJurEnum.OUTRAS;
  }

  applyDateMask(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    }
    if (value.length > 5) {
      value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }

    event.target.value = value;
  }


}
