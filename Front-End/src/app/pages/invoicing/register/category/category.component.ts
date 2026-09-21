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
import { ClientCategory } from '@/app/models/client.category';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { ClientCategoryService } from '@/app/services/client/client.category.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
  selector: 'app-client-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, InputTextModule, InputNumberModule,
    InputGroupModule, IconFieldModule, TableModule, RadioButtonModule,
    ButtonModule, InputIconModule, DialogModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  providers: [MessageService]
})
export default class CategoryComponent implements OnInit {
  visibleDialog: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;
  categories = signal<ClientCategory[]>([]);
  category!: ClientCategory;
  isNewCat: boolean = true;

  formCat = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    description: new FormControl<string>("", Validators.required),
  });

  constructor(
    private storageService: StorageService,
    private loadingService: LoadingService,
    private categoryService: ClientCategoryService,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    //open Load
    this.loadingService.show();
    const result = await this.listAllCategories();
    //Close Load
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.categories.set(result.body.data!);
    }

  }

  private showDialog() {
    this.cleanForm();
    this.visibleDialog = true;
  }

  newCategory() {
    this.isNewCat = true;
    this.showDialog();
  }

  hideDialog() {
    this.visibleDialog = false;
  }

  private cleanForm() {
    this.formCat.patchValue({
      id: null,
      description: "",
      status: StatusEnabDisabEnum.ENABLED
    });
  }
  edit(cat: ClientCategory) {
    this.showDialog();

    this.isNewCat = false;
    this.category = cat;

    this.formCat.patchValue({
      id: cat.id,
      description: cat.description,
      status: cat.status
    });
  }
  save() {
    if (this.isNewCat) {
      this.saveCat();
    } else {
      this.updateCat();
    }
  }

  private async saveCat() {
    const { value, valid } = this.formCat;
    if (!valid) {
      return;
    }
    this.category = new ClientCategory();
    this.category.companyId = this.storageService.companyId;
    this.category.resaleId = this.storageService.resaleId;
    this.category.status = value.status!;
    this.category.description = value.description!;

    //open Load
    this.loadingService.show();
    const resultSave = await this.saveCategory(this.category);
    //Close Load
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.category = resultSave.body.data;
      this.formCat.get("id")?.setValue(this.category.id);
      this.isNewCat = false;
      this.init();
    }
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async updateCat() {

    const { value, valid } = this.formCat;
    if (!valid) {
      return;
    }

    this.category.status = value.status!;
    this.category.description = value.description!;

    //open Load
    this.loadingService.show();
    const resultSave = await this.updateCategory(this.category);
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
  private async listAllCategories(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.categoryService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveCategory(cat: ClientCategory): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.categoryService.save(cat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateCategory(cat: ClientCategory): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.categoryService.update(cat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
}
