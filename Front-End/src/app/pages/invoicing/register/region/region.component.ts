import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { LoadingService } from '@/app/services/loading/loading.service';

import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { ClientCompanyRegion } from '@/app/models/client.company.region';
import { ClientCompanyRegionService } from '@/app/services/client/client.company.region';

@Component({
  selector: 'app-client-company-region',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, InputTextModule, InputNumberModule, SelectModule,
    InputGroupModule, IconFieldModule, TableModule, RadioButtonModule,
    ButtonModule, InputIconModule, DialogModule],
  templateUrl: './region.component.html',
  styleUrl: './region.component.scss',
  providers: [MessageService]
})
export default class RegionComponent implements OnInit {
  visibleDialog: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  regions = signal<ClientCompanyRegion[]>([]);


  region!: ClientCompanyRegion;
  isNewReg: boolean = true;

  formReg = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    description: new FormControl<string>('', Validators.required),
    uf: new FormControl<string>('', Validators.required),
  });
  ufs = [
    { label: 'AC', value: 'AC' },
    { label: 'AL', value: 'AL' },
    { label: 'AP', value: 'AP' },
    { label: 'AM', value: 'AM' },
    { label: 'BA', value: 'BA' },
    { label: 'CE', value: 'CE' },
    { label: 'DF', value: 'DF' },
    { label: 'ES', value: 'ES' },
    { label: 'GO', value: 'GO' },
    { label: 'MA', value: 'MA' },
    { label: 'MT', value: 'MT' },
    { label: 'MS', value: 'MS' },
    { label: 'MG', value: 'MG' },
    { label: 'PA', value: 'PA' },
    { label: 'PB', value: 'PB' },
    { label: 'PR', value: 'PR' },
    { label: 'PE', value: 'PE' },
    { label: 'PI', value: 'PI' },
    { label: 'RJ', value: 'RJ' },
    { label: 'RN', value: 'RN' },
    { label: 'RS', value: 'RS' },
    { label: 'RO', value: 'RO' },
    { label: 'RR', value: 'RR' },
    { label: 'SC', value: 'SC' },
    { label: 'SP', value: 'SP' },
    { label: 'SE', value: 'SE' },
    { label: 'TO', value: 'TO' }
  ];
  constructor(
    private loadingService: LoadingService,
    private regionService: ClientCompanyRegionService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    //open Load
    this.loadingService.show();
    this.regions.set(await this.listAllRegions());
    //Close Load
    this.loadingService.hide();
  }

  private showDialog() {
    this.cleanForm();
    this.visibleDialog = true;
  }

  newCategory() {
    this.isNewReg = true;
    this.showDialog();
  }

  hideDialog() {
    this.visibleDialog = false;
  }

  private cleanForm() {
    this.formReg.patchValue({
      id: null,
      description: "",
      status: StatusEnabDisabEnum.ENABLED,
      uf: ""
    });
  }
  edit(reg: ClientCompanyRegion) {
    this.showDialog();

    this.isNewReg = false;
    this.region = reg;

    this.formReg.patchValue({
      id: reg.id,
      description: reg.description,
      status: reg.status,
      uf: reg.uf
    });
  }
  save() {
    if (this.isNewReg) {
      this.saveReg();
    } else {
      this.updateReg();
    }
  }

  private async saveReg() {
    const { value, valid } = this.formReg;
    if (!valid) {
      return;
    }
    this.region = new ClientCompanyRegion();
    this.region.status = value.status!;
    this.region.description = value.description!;
    this.region.uf = value.uf!;
    //open Load
    this.loadingService.show();
    const resultSave = await this.saveRegion(this.region);
    //Close Load
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.region = resultSave.body.data;
      this.formReg.get("id")?.setValue(this.region.id);
      this.isNewReg = false;
      this.init();
    }
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async updateReg() {
    const { value, valid } = this.formReg;
    if (!valid) {
      return;
    }
    this.region.status = value.status!;
    this.region.description = value.description!;
    this.region.uf = value.uf!;
    //open Load
    this.loadingService.show();
    const resultSave = await this.updateRegion(this.region);
    //Close Load
    this.loadingService.hide();
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.init();
    }
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async listAllRegions(): Promise<ClientCompanyRegion[]> {
    try {
      return await lastValueFrom(this.regionService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveRegion(region: ClientCompanyRegion): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.regionService.save(region));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateRegion(region: ClientCompanyRegion): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.regionService.update(region));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
}
