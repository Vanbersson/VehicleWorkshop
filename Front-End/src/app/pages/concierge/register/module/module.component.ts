import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';

import { YesNotEnum } from '@/app/models/yes.not.enum';
import { ModuleConciergeVehicleChecklist } from '@/app/models/module.concierge.vehicle.checklist';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { LoadingService } from '@/app/services/loading/loading.service';
import { ModuleConciergeService } from '@/app/services/module/module.concierge.service';
import { MessageResponse } from '@/app/models/message-response';

@Component({
  selector: 'app-module',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabsModule, ToastModule, InputNumberModule,  InputTextModule, ButtonModule, CheckboxModule],
  templateUrl: './module.component.html',
  styleUrl: './module.component.scss',
  providers: [MessageService]
})
export default class ModuleComponent implements OnInit {
  yes = YesNotEnum.YES;
  not = YesNotEnum.NOT;
  modChecklist!: ModuleConciergeVehicleChecklist;
  //Checklist Entrada
  formChecklist = new FormGroup({
    checklist1Enabled: new FormControl<string[]>([]),
    checklist1Desc: new FormControl<string>(''),
    checklist2Enabled: new FormControl<string[]>([]),
    checklist2Desc: new FormControl<string>(''),
    checklist3Enabled: new FormControl<string[]>([]),
    checklist3Desc: new FormControl<string>(''),
    checklist4Enabled: new FormControl<string[]>([]),
    checklist4Desc: new FormControl<string>(''),
    checklist5Enabled: new FormControl<string[]>([]),
    checklist5Desc: new FormControl<string>(''),
    checklist6Enabled: new FormControl<string[]>([]),
    checklist6Desc: new FormControl<string>(''),
    checklist7Enabled: new FormControl<string[]>([]),
    checklist7Desc: new FormControl<string>(''),
    checklist8Enabled: new FormControl<string[]>([]),
    checklist8Desc: new FormControl<string>(''),
    checklist9Enabled: new FormControl<string[]>([]),
    checklist9Desc: new FormControl<string>(''),
    checklist10Enabled: new FormControl<string[]>([]),
    checklist10Desc: new FormControl<string>(''),
    checklist11Enabled: new FormControl<string[]>([]),
    checklist11Desc: new FormControl<string>(''),
    checklist12Enabled: new FormControl<string[]>([]),
    checklist12Desc: new FormControl<string>(''),
    checklist13Enabled: new FormControl<string[]>([]),
    checklist13Desc: new FormControl<string>(''),
    checklist14Enabled: new FormControl<string[]>([]),
    checklist14Desc: new FormControl<string>(''),
    checklist15Enabled: new FormControl<string[]>([]),
    checklist15Desc: new FormControl<string>(''),
    checklist16Enabled: new FormControl<string[]>([]),
    checklist16Desc: new FormControl<string>(''),
    checklist17Enabled: new FormControl<string[]>([]),
    checklist17Desc: new FormControl<string>(''),
    checklist18Enabled: new FormControl<string[]>([]),
    checklist18Desc: new FormControl<string>(''),
    checklist19Enabled: new FormControl<string[]>([]),
    checklist19Desc: new FormControl<string>(''),
    checklist20Enabled: new FormControl<string[]>([]),
    checklist20Desc: new FormControl<string>(''),
  });
  constructor(private loadingService: LoadingService,
    private modService: ModuleConciergeService,
    private messageService: MessageService) { }
  ngOnInit(): void {
    this.init();
  }

  private async init() {
    this.loadingService.show();
    const result = await this.filterCompanyResale();
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.modChecklist = result.body.data;

      if (this.modChecklist.checklist1Enabled == this.yes) {
        this.formChecklist.get("checklist1Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist1Desc")?.setValue(this.modChecklist.checklist1Desc);
      }
      if (this.modChecklist.checklist2Enabled == this.yes) {
        this.formChecklist.get("checklist2Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist2Desc")?.setValue(this.modChecklist.checklist2Desc);
      }
      if (this.modChecklist.checklist3Enabled == this.yes) {
        this.formChecklist.get("checklist3Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist3Desc")?.setValue(this.modChecklist.checklist3Desc);
      }
      if (this.modChecklist.checklist4Enabled == this.yes) {
        this.formChecklist.get("checklist4Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist4Desc")?.setValue(this.modChecklist.checklist4Desc);
      }
      if (this.modChecklist.checklist5Enabled == this.yes) {
        this.formChecklist.get("checklist5Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist5Desc")?.setValue(this.modChecklist.checklist5Desc);
      }
      if (this.modChecklist.checklist6Enabled == this.yes) {
        this.formChecklist.get("checklist6Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist6Desc")?.setValue(this.modChecklist.checklist6Desc);
      }
      if (this.modChecklist.checklist7Enabled == this.yes) {
        this.formChecklist.get("checklist7Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist7Desc")?.setValue(this.modChecklist.checklist7Desc);
      }
      if (this.modChecklist.checklist8Enabled == this.yes) {
        this.formChecklist.get("checklist8Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist8Desc")?.setValue(this.modChecklist.checklist8Desc);
      }
      if (this.modChecklist.checklist9Enabled == this.yes) {
        this.formChecklist.get("checklist9Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist9Desc")?.setValue(this.modChecklist.checklist9Desc);
      }
      if (this.modChecklist.checklist10Enabled == this.yes) {
        this.formChecklist.get("checklist10Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist10Desc")?.setValue(this.modChecklist.checklist10Desc);
      }
      if (this.modChecklist.checklist11Enabled == this.yes) {
        this.formChecklist.get("checklist11Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist11Desc")?.setValue(this.modChecklist.checklist11Desc);
      }
      if (this.modChecklist.checklist12Enabled == this.yes) {
        this.formChecklist.get("checklist12Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist12Desc")?.setValue(this.modChecklist.checklist12Desc);
      }
      if (this.modChecklist.checklist13Enabled == this.yes) {
        this.formChecklist.get("checklist13Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist13Desc")?.setValue(this.modChecklist.checklist13Desc);
      }
      if (this.modChecklist.checklist14Enabled == this.yes) {
        this.formChecklist.get("checklist14Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist14Desc")?.setValue(this.modChecklist.checklist14Desc);
      }
      if (this.modChecklist.checklist15Enabled == this.yes) {
        this.formChecklist.get("checklist15Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist15Desc")?.setValue(this.modChecklist.checklist15Desc);
      }
      if (this.modChecklist.checklist16Enabled == this.yes) {
        this.formChecklist.get("checklist16Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist16Desc")?.setValue(this.modChecklist.checklist16Desc);
      }
      if (this.modChecklist.checklist17Enabled == this.yes) {
        this.formChecklist.get("checklist17Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist17Desc")?.setValue(this.modChecklist.checklist17Desc);
      }
      if (this.modChecklist.checklist18Enabled == this.yes) {
        this.formChecklist.get("checklist18Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist18Desc")?.setValue(this.modChecklist.checklist18Desc);
      }
      if (this.modChecklist.checklist19Enabled == this.yes) {
        this.formChecklist.get("checklist19Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist19Desc")?.setValue(this.modChecklist.checklist19Desc);
      }
      if (this.modChecklist.checklist20Enabled == this.yes) {
        this.formChecklist.get("checklist20Enabled")?.setValue([this.yes]);
        this.formChecklist.get("checklist20Desc")?.setValue(this.modChecklist.checklist20Desc);
      }

    }
  }

  async save() {
    const { value } = this.formChecklist;
    this.modChecklist.checklist1Desc = value.checklist1Desc!;
    this.modChecklist.checklist1Enabled = value.checklist1Enabled?.at(0) ?? null;
    this.modChecklist.checklist2Desc = value.checklist2Desc!;
    this.modChecklist.checklist2Enabled = value.checklist2Enabled?.at(0) ?? null;
    this.modChecklist.checklist3Desc = value.checklist3Desc!;
    this.modChecklist.checklist3Enabled = value.checklist3Enabled?.at(0) ?? null;
    this.modChecklist.checklist4Desc = value.checklist4Desc!;
    this.modChecklist.checklist4Enabled = value.checklist4Enabled?.at(0) ?? null;
    this.modChecklist.checklist5Desc = value.checklist5Desc!;
    this.modChecklist.checklist5Enabled = value.checklist5Enabled?.at(0) ?? null;
    this.modChecklist.checklist6Desc = value.checklist6Desc!;
    this.modChecklist.checklist6Enabled = value.checklist6Enabled?.at(0) ?? null;
    this.modChecklist.checklist7Desc = value.checklist7Desc!;
    this.modChecklist.checklist7Enabled = value.checklist7Enabled?.at(0) ?? null;
    this.modChecklist.checklist8Desc = value.checklist8Desc!;
    this.modChecklist.checklist8Enabled = value.checklist8Enabled?.at(0) ?? null;
    this.modChecklist.checklist9Desc = value.checklist9Desc!;
    this.modChecklist.checklist9Enabled = value.checklist9Enabled?.at(0) ?? null;
    this.modChecklist.checklist10Desc = value.checklist10Desc!;
    this.modChecklist.checklist10Enabled = value.checklist10Enabled?.at(0) ?? null;
    this.modChecklist.checklist11Desc = value.checklist11Desc!;
    this.modChecklist.checklist11Enabled = value.checklist11Enabled?.at(0) ?? null;
    this.modChecklist.checklist12Desc = value.checklist12Desc!;
    this.modChecklist.checklist12Enabled = value.checklist12Enabled?.at(0) ?? null;
    this.modChecklist.checklist13Desc = value.checklist13Desc!;
    this.modChecklist.checklist13Enabled = value.checklist13Enabled?.at(0) ?? null;
    this.modChecklist.checklist14Desc = value.checklist14Desc!;
    this.modChecklist.checklist14Enabled = value.checklist14Enabled?.at(0) ?? null;
    this.modChecklist.checklist15Desc = value.checklist15Desc!;
    this.modChecklist.checklist15Enabled = value.checklist15Enabled?.at(0) ?? null;
    this.modChecklist.checklist16Desc = value.checklist16Desc!;
    this.modChecklist.checklist16Enabled = value.checklist16Enabled?.at(0) ?? null;
    this.modChecklist.checklist17Desc = value.checklist17Desc!;
    this.modChecklist.checklist17Enabled = value.checklist17Enabled?.at(0) ?? null;
    this.modChecklist.checklist18Desc = value.checklist18Desc!;
    this.modChecklist.checklist18Enabled = value.checklist18Enabled?.at(0) ?? null;
    this.modChecklist.checklist19Desc = value.checklist19Desc!;
    this.modChecklist.checklist19Enabled = value.checklist19Enabled?.at(0) ?? null;
    this.modChecklist.checklist20Desc = value.checklist20Desc!;
    this.modChecklist.checklist20Enabled = value.checklist20Enabled?.at(0) ?? null;

    const resultSave = await this.update(this.modChecklist);
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.init();
    }
  }

  private async update(mod: ModuleConciergeVehicleChecklist): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.modService.updateUser(mod));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterCompanyResale(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.modService.filterCompanyResale());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
}
