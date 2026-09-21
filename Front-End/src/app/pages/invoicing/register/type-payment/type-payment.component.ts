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
import { TypePayment } from '@/app/models/type.payment';
import { TypePaymentService } from '@/app/services/client/type.payment.service';
import { ClientCategory } from '@/app/models/client.category';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
  selector: 'app-type-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, InputTextModule, InputNumberModule,
    InputGroupModule, IconFieldModule, TableModule, RadioButtonModule,
    ButtonModule, InputIconModule, DialogModule],
  templateUrl: './type-payment.component.html',
  styleUrl: './type-payment.component.scss',
  providers: [MessageService]
})
export default class TypePaymentComponent implements OnInit {
  visibleDialog: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  typePays = signal<TypePayment[]>([]);
  typePayment!: TypePayment;
  isNewPay: boolean = true;

  formPay = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    description: new FormControl<string>("", Validators.required),
  });

  constructor(
    private storageService: StorageService,
    private loadingService: LoadingService,
    private paymentService: TypePaymentService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    //open Load
    this.loadingService.show();
    this.typePays.set(await this.listAllTypePay());
    //Close Load
    this.loadingService.hide();
  }

  private showDialog() {
    this.visibleDialog = true;
  }

  showNewPay() {
    this.isNewPay = true;
    this.typePayment = new ClientCategory();
    this.cleanForm();
    this.showDialog();
  }

  hideDialog() {
    this.visibleDialog = false;
  }

  private cleanForm() {
    this.formPay.patchValue({
      id: null,
      description: "",
      status: StatusEnabDisabEnum.ENABLED
    });
  }
  edit(pay: TypePayment) {
    this.typePayment = pay;
    this.isNewPay = false;
    this.cleanForm();
    this.formPay.patchValue({
      id: pay.id,
      description: pay.description,
      status: pay.status
    });
    this.showDialog();
  }
  save() {
    if (this.isNewPay) {
      this.savePay();
    } else {
      this.updatePay();
    }
  }

  private async savePay() {
    const { value, valid } = this.formPay;
    if (!valid) {
      return;
    }
    this.typePayment.companyId = this.storageService.companyId;
    this.typePayment.resaleId = this.storageService.resaleId;
    this.typePayment.status = value.status!;
    this.typePayment.description = value.description!;

    //open Load
    this.loadingService.show();
    const resultSave = await this.saveTypePay(this.typePayment);
    //Close Load
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.typePayment = resultSave.body.data;
      this.formPay.get("id")?.setValue(this.typePayment.id);
      this.isNewPay = false;
      this.init();
    }
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async updatePay() {
    const { value, valid } = this.formPay;
    if (!valid) {
      return;
    }
    this.typePayment.status = value.status!;
    this.typePayment.description = value.description!;
    //open Load
    this.loadingService.show();
    const resultSave = await this.updateTypePay(this.typePayment);
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
  private async listAllTypePay(): Promise<TypePayment[]> {
    try {
      return await lastValueFrom(this.paymentService.listAll());
    } catch (error: any) {

      return [];
    }
  }
  private async saveTypePay(pay: TypePayment): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.paymentService.save(pay));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateTypePay(pay: TypePayment): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.paymentService.update(pay));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
}
