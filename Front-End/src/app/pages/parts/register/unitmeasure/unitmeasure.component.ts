import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { LoadingService } from '@/app/services/loading/loading.service';
import { UnitMeasure } from '@/app/models/parts/unit.measure';
import { UnitMeasureService } from '@/app/services/parts/unit.measure.service';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';

@Component({
  selector: 'app-unitmeasure',
  standalone: true,
  imports: [CommonModule, InputTextModule, IconFieldModule, RadioButtonModule, InputIconModule,
    ButtonModule, InputNumberModule, ReactiveFormsModule, TableModule, ToastModule, DialogModule],
  templateUrl: './unitmeasure.component.html',
  styleUrl: './unitmeasure.component.scss',
  providers: [MessageService]
})
export default class UnitmeasureComponent implements OnInit {
  private isNewUnit: boolean = true;
  private unit!: UnitMeasure;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  formUnit = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    unitMeasure: new FormControl<string>('', [Validators.required, Validators.maxLength(2)]),
    description: new FormControl<string>('', [Validators.required, Validators.maxLength(100)])
  });

  listUnit = signal<UnitMeasure[]>([]);
  dialogVisible: boolean = false;

  constructor(
    private unitService: UnitMeasureService,
    private messageService: MessageService,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.init();
  }
  private async init() {
    this.loadingService.show();
    this.listUnit.set(await this.listAll());
    this.loadingService.hide();
  }
  showNewBrand() {
    this.isNewUnit = true;
    this.unit = new UnitMeasure();
    this.cleanForm();
    this.showDialog();
  }
  showDialog() {
    this.dialogVisible = true;
  }
  hideDialog() {
    this.dialogVisible = false;
  }
  private cleanForm() {
    this.formUnit.patchValue({
      unitMeasure: '',
      description: '',
      status: this.enabled
    });
  }
  edit(un: UnitMeasure) {
    this.isNewUnit = false;
    this.unit = un;
    this.cleanForm();
    this.showDialog();

    this.formUnit.patchValue({
      unitMeasure: this.unit.unitMeasure,
      description: this.unit.description,
      status: this.unit.status
    });
  }
  save() {
    if (this.isNewUnit) {
      this.saveNewUnit();
    } else {
      this.saveUpdateUnit();
    }
  }

  private async saveNewUnit() {
    const { value, valid } = this.formUnit;
    if (!valid) {
      return;
    }
    this.unit.unitMeasure = value.unitMeasure!;
    this.unit.description = value.description!;
    this.unit.status = value.status!;

    this.loadingService.show();
    const result = await this.saveNew(this.unit);
    this.loadingService.hide();
    if (result.status == 201 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.hideDialog();
      this.init();
    }
    if (result.status == 201 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async saveUpdateUnit() {
    const { value, valid } = this.formUnit;
    if (!valid) {
      return;
    }
    this.unit.unitMeasure = value.unitMeasure!;
    this.unit.description = value.description!;
    this.unit.status = value.status!;

    this.loadingService.show();
    const result = await this.saveUpdate(this.unit);
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.hideDialog();
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
    this.init();
  }

  private async saveNew(un: UnitMeasure): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.unitService.save(un));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveUpdate(un: UnitMeasure): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.unitService.update(un));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAll(): Promise<UnitMeasure[]> {
    try {
      return await lastValueFrom(this.unitService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

}
