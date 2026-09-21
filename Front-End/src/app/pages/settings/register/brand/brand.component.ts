import { Component, inject, OnInit, signal } from '@angular/core';
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
import { Brand } from '@/app/models/brand';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { BrandService } from '@/app/services/brand/brand.service';
import { MessageResponse } from '@/app/models/message-response';
import { LoadingService } from '@/app/services/loading/loading.service';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, InputTextModule, IconFieldModule, RadioButtonModule, InputIconModule,
    ButtonModule, InputNumberModule, ReactiveFormsModule, TableModule, ToastModule, DialogModule],
  templateUrl: './brand.component.html',
  styleUrl: './brand.component.scss',
  providers: [MessageService]
})
export default class BrandComponent implements OnInit {

  private isNewBrand: boolean = true;
  private brand!: Brand;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  formBrand = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    name: new FormControl<string>('', [Validators.required, Validators.maxLength(100)])
  });

  listBrands = signal<Brand[]>([]);
  dialogVisible: boolean = false;

  constructor(
    private layoutService: LayoutService,
    private loading: LoadingService,
    private brandService: BrandService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.init();
  }
  get isMobile(): boolean {
    return this.layoutService.isDesktop();
  }
  private async init() {

    this.loading.show();
    this.listBrands.set(await this.listAll());
    this.loading.hide();
  }
  showNewBrand() {
    this.isNewBrand = true;
    this.brand = new Brand();
    this.cleanForm();
    this.showDialog();
  }
  showDialog() {
    this.dialogVisible = true;
  }
  hideDialog() {
    this.dialogVisible = false;
  }
  cleanForm() {
    this.formBrand.patchValue({
      name: '',
      status: this.enabled
    });
  }
  edit(b: Brand) {
    this.isNewBrand = false;
    this.brand = b;
    this.cleanForm();
    this.showDialog();

    this.formBrand.patchValue({
      name: this.brand.name,
      status: this.brand.status
    });
  }
  save() {
    if (this.isNewBrand) {
      this.saveNewBrand();
    } else {
      this.saveUpdateBrand();
    }
  }

  private async saveNewBrand() {
    const { value, valid } = this.formBrand;
    if (!valid) {
      return;
    }
    this.brand.name = value.name!;
    this.brand.status = value.status!;

    this.loading.show();
    const result = await this.saveNew(this.brand);
    this.loading.hide();
    if (result.status == 201 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.hideDialog();
      this.init();
    }
    if (result.status == 201 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
    if (result.status == 401) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: result.body?.message });
    }
  }
  private async saveUpdateBrand() {
    const { value, valid } = this.formBrand;
    if (!valid) {
      return;
    }
    this.brand.name = value.name!;
    this.brand.status = value.status!;

    this.loading.show();
    const result = await this.saveUpdate(this.brand);
    this.loading.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.hideDialog();
      this.init();
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
      this.hideDialog();
      this.init();
    }
    if (result.status == 401) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: result.body?.message });
    }
  }

  private async saveNew(b: Brand): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.brandService.save(b));
    } catch (error) {
      let er: MessageResponse = new MessageResponse();
      er.header = 'Atenção';
      er.status = StatusSuccessError.error;
      er.message = "Não foi possível salvar";
      return new HttpResponse<MessageResponse>({
        body: er,
        status: 401
      });
    }
  }
  private async saveUpdate(b: Brand): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.brandService.update(b));
    } catch (error) {
      let er: MessageResponse = new MessageResponse();
      er.header = 'Atenção';
      er.status = StatusSuccessError.error;
      er.message = "Não foi possível atualizar";
      return new HttpResponse<MessageResponse>({
        body: er,
        status: 401
      });
    }
  }
  private async listAll(): Promise<Brand[]> {
    try {
      return await lastValueFrom(this.brandService.listAll());
    } catch (error) {
      return [];
    }
  }

}
