import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms'
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StorageService } from '@/app/services/storage/storage.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
  selector: 'app-filterclient',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TableModule, InputTextModule,
    InputGroupModule, ReactiveFormsModule, FormsModule, InputMaskModule, InputNumberModule,
    RadioButtonModule, InputIconModule, IconFieldModule],
  templateUrl: './filter.client.component.html',
  styleUrl: './filter.client.component.scss'
})
export class FilterClientComponent {
  @Output() public outputClient = new EventEmitter<ClientCompany>();
  @Input() isDisabled: boolean = false;

  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  //Filter Client
  dialogListClientCompany = signal<ClientCompany[]>([]);
  dialogSelectClientCompany: ClientCompany | null = null;
  dialogVisibleClientCompany: boolean = false;
  formClientCompanyFilter = new FormGroup({
    clientCompanyId: new FormControl<number | null>(null),
    clientCompanyFantasia: new FormControl<string>(''),
    clientCompanyName: new FormControl<string>(''),
    clientCompanyCnpj: new FormControl<string>(''),
    clientCompanyCpf: new FormControl<string>(''),
    clientCompanyRg: new FormControl<string | null>(null),
    clientCompanyTipo: new FormControl<string>('j'),
  });

  constructor(private clientService: ClientCompanyService, private storageService: StorageService) { }

  //Filter Client
  public showDialogFilterClientCompany() {
    this.dialogVisibleClientCompany = true;
    this.cleanAll();
    this.dialogSelectClientCompany = null;
  }

  public hideDialogFilterClientCompany() {
    this.dialogVisibleClientCompany = false;
  }

  public async selectClientCompany() {
    if (this.dialogSelectClientCompany) {
      if (this.dialogSelectClientCompany.status == this.enabled) {
        this.outputClient.emit(this.dialogSelectClientCompany);
        this.dialogVisibleClientCompany = false;
      }
    }
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

  cleanAll() {
    this.formClientCompanyFilter.patchValue({
      clientCompanyId: null,
      clientCompanyFantasia: "",
      clientCompanyName: "",
      clientCompanyCnpj: "",
      clientCompanyCpf: "",
      clientCompanyRg: null,
      clientCompanyTipo: "j"
    });

    this.dialogListClientCompany.set([]);
  }

  public async filterClientCompany() {
    this.dialogListClientCompany.set([]);
    const { value } = this.formClientCompanyFilter;

    if (value.clientCompanyTipo == "j") {
      if (value.clientCompanyId) {
        const result = await this.filterId(value.clientCompanyId);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(new Array(result.body.data));
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      } else if (value.clientCompanyFantasia) {
        const result = await this.filterJFantasia(value.clientCompanyFantasia);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(result.body.data);
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      } else if (value.clientCompanyName) {
        const result = await this.filterJName(value.clientCompanyName);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(result.body.data);
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      } else if (value.clientCompanyCnpj) {
        const result = await this.filterCNPJ(value.clientCompanyCnpj);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(new Array(result.body.data));
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      }
    } else {
      // P/Física
      if (value.clientCompanyId) {
        const result = await this.filterId(value.clientCompanyId);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(result.body.data);
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      } else if (value.clientCompanyFantasia) {
        const result = await this.filterFFantasia(value.clientCompanyFantasia);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(result.body.data);
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      } else if (value.clientCompanyName) {
        const result = await this.filterFName(value.clientCompanyName);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(result.body.data);
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      } else if (value.clientCompanyCpf) {
        const result = await this.filterCPF(value.clientCompanyCpf);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
          this.dialogListClientCompany.set(new Array(result.body.data));
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {

        }
      }
    }
    
  }

  private async filterId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterId(id));
    } catch (error: any) {
      return error;
    }
  }
  private async filterJFantasia(fantasia: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterJFantasia(fantasia));
    } catch (error: any) {
      return error;
    }
  }
  private async filterFFantasia(fantasia: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterFFantasia(fantasia));
    } catch (error: any) {
      return error;
    }
  }
  private async filterJName(name: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterJName(name));
    } catch (error: any) {
      return error;
    }
  }
  private async filterFName(name: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterFName(name));
    } catch (error: any) {
      return error;
    }
  }
  private async filterCNPJ(cnpj: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterCNPJ(cnpj));
    } catch (error: any) {
      return error;
    }
  }
  private async filterCPF(cpf: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.clientService.filterCPF(cpf));
    } catch (error: any) {
      return error;
    }
  }

}
