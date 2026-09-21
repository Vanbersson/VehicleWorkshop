import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { RadioButtonModule } from 'primeng/radiobutton';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { CategoryPart } from '@/app/models/parts/category.part';
import { CategoryPartService } from '@/app/services/parts/category.part.service';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';


@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, RadioButtonModule,
    ButtonModule, TableModule, IconFieldModule, InputIconModule, DialogModule, ToastModule

  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  providers: [MessageService]
})
export default class CategoryComponent {
  private isNewCategory: boolean = true;
  private category!: CategoryPart;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;
  formCat = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    description: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
  });
  listCategories = signal<CategoryPart[]>([]);
  dialogVisible: boolean = false;

  constructor(
    private storageService: StorageService,
    private categoryService: CategoryPartService,
    private messageService: MessageService,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.init();
  }
  private async init() {
    this.loadingService.show();
    this.listCategories.set(await this.listAll());
    this.loadingService.hide();
  }
  showNewCat() {
    this.isNewCategory = true;
    this.category = new CategoryPart();
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
    this.formCat.patchValue({
      description: '',
      status: this.enabled
    });
  }
  edit(cat: CategoryPart) {
    this.isNewCategory = false;
    this.category = cat;
    this.cleanForm();
    this.showDialog();

    this.formCat.patchValue({
      description: this.category.description,
      status: this.category.status,
    });
  }
  save() {
    if (this.isNewCategory) {
      this.saveNewCat();
    } else {
      this.saveUpdateCat();
    }
  }

  private async saveNewCat() {
    const { value, valid } = this.formCat;
    if (!valid) {
      return;
    }
    this.category.companyId = this.storageService.companyId;
    this.category.resaleId = this.storageService.resaleId;
    this.category.description = value.description!;
    this.category.status = value.status!;

    this.loadingService.show();
    const result = await this.saveNew(this.category);
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
  private async saveUpdateCat() {
    const { value, valid } = this.formCat;
    if (!valid) {
      return;
    }
    this.category.description = value.description!;
    this.category.status = value.status!;

    this.loadingService.show();
    const result = await this.saveUpdate(this.category);
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

  private async saveNew(cat: CategoryPart): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.categoryService.save(cat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveUpdate(cat: CategoryPart): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.categoryService.update(cat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAll(): Promise<CategoryPart[]> {
    try {
      return await lastValueFrom(this.categoryService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

}
