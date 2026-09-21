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

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { ClientCategory } from '@/app/models/client.category';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { MechanicDepartment } from '@/app/models/workshop/mechanic.department';
import { MechanicDepartmentService } from '@/app/services/workshop/mechanic.department.service';

@Component({
  selector: 'app-mechanic-department',
  imports: [CommonModule, ReactiveFormsModule, ToastModule, InputTextModule, InputNumberModule,
    InputGroupModule, IconFieldModule, TableModule, RadioButtonModule,
    ButtonModule, InputIconModule, DialogModule],
  templateUrl: './mechanic.department.component.html',
  styleUrl: './mechanic.department.component.scss',
  providers: [MessageService]
})
export default class MechanicDepartmentComponent implements OnInit {
  visibleDialog: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  departments = signal<MechanicDepartment[]>([]);

  depatment!: MechanicDepartment;
  isNewDep: boolean = true;

  formDep = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    description: new FormControl<string>("", Validators.required),
  });

  constructor(
    private storageService: StorageService,
    private loadingService: LoadingService,
    private departmentService: MechanicDepartmentService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    //open Load
    this.loadingService.show();
    this.departments.set(await this.listAll());
    //Close Load
    this.loadingService.hide();
  }

  private showDialog() {
    this.visibleDialog = true;
  }

  showNewPay() {
    this.isNewDep = true;
    this.depatment = new ClientCategory();
    this.cleanForm();
    this.showDialog();
  }

  hideDialog() {
    this.visibleDialog = false;
  }

  private cleanForm() {
    this.formDep.patchValue({
      id: null,
      description: "",
      status: StatusEnabDisabEnum.ENABLED
    });
  }
  edit(dep: MechanicDepartment) {
    this.depatment = dep;
    this.isNewDep = false;
    this.cleanForm();
    this.formDep.patchValue({
      id: dep.id,
      description: dep.description,
      status: dep.status
    });
    this.showDialog();
  }
  save() {
    if (this.isNewDep) {
      this.savePay();
    } else {
      this.updatePay();
    }
  }

  private async savePay() {
    const { value, valid } = this.formDep;
    if (!valid) {
      return;
    }
    this.depatment.companyId = this.storageService.companyId;
    this.depatment.resaleId = this.storageService.resaleId;
    this.depatment.status = value.status!;
    this.depatment.description = value.description!;

    //open Load
    this.loadingService.show();
    const resultSave = await this.saveDep(this.depatment);
    //Close Load
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.depatment = resultSave.body.data;
      this.formDep.get("id")?.setValue(this.depatment.id);
      this.isNewDep = false;
      this.init();
    }
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async updatePay() {
    const { value, valid } = this.formDep;
    if (!valid) {
      return;
    }
    this.depatment.status = value.status!;
    this.depatment.description = value.description!;
    //open Load
    this.loadingService.show();
    const resultSave = await this.updateDep(this.depatment);
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
  private async listAll(): Promise<MechanicDepartment[]> {
    try {
      return await lastValueFrom(this.departmentService.listAll());
    } catch (error: any) {
      return [];
    }
  }
  private async saveDep(dep: MechanicDepartment): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.departmentService.save(dep));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateDep(dep: MechanicDepartment): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.departmentService.update(dep));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
}
