import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
//PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { ToolControlCategory } from '@/app/models/workshop/tool.control/tool.control.category';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { ToolControlCategoryService } from '@/app/services/workshop/tool.control/tool.control.category.service';
import { TypeCategoryEnum } from '@/app/models/workshop/type.category.enum';

@Component({
  selector: 'app-category-material',
  standalone: true,
  imports: [CommonModule, InputTextModule, InputNumberModule, DialogModule, ToastModule,
    InputMaskModule, RadioButtonModule,
    ReactiveFormsModule, InputGroupModule, InputIconModule, ButtonModule, TableModule, IconFieldModule],
  templateUrl: './category.material.component.html',
  styleUrl: './category.material.component.scss',
  providers: [MessageService]
})
export default class CategoryMaterialComponent implements OnInit {

  category!: ToolControlCategory;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;
  typeOutro = TypeCategoryEnum.OTHER;
  typeFerr = TypeCategoryEnum.TOOL;
  typeEPI = TypeCategoryEnum.EPI;
  typeUnif = TypeCategoryEnum.UNIFORM;
  categories = signal<ToolControlCategory[]>([]);
  //Dialog
  visibleDialog: boolean = false;
  formCat = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.DISABLED, Validators.required),
    description: new FormControl<string>("", Validators.required),
    quantityReq: new FormControl<number | null>(null),
    type: new FormControl<TypeCategoryEnum>(TypeCategoryEnum.OTHER, Validators.required),
  });

  constructor(
    private loadingService: LoadingService,
    private messageService: MessageService,
    private storageService: StorageService,
    private categoryService: ToolControlCategoryService) { }
  ngOnInit(): void {
    //Inicia o loading
    this.loadingService.show();
    this.listAll();
  }
  private listAll() {
    this.categoryService.listAll().subscribe(data => {
      this.categories.set(data);
      //Fecha o loading
      this.loadingService.hide();
    });
  }
  showDialog() {
    this.cleanForm();
    this.visibleDialog = true;
  }
  hideDialog() {
    this.visibleDialog = false;
  }
  cleanForm() {
    this.formCat.patchValue({
      description: "",
      status: this.enabled,
      quantityReq: null,
      type: this.typeOutro
    });
    this.category = null!;
  }
  editCategory(cat: ToolControlCategory) {
    this.showDialog();
    this.category = cat;

    this.formCat.patchValue({
      description: cat.description,
      status: cat.status,
      type: cat.type,
      quantityReq: cat.quantityReq != 0 ? cat.quantityReq : null
    });
  }
  async saveCategory() {
    const { value, valid } = this.formCat;
    if (!valid) {
      return;
    }

    if (this.category == null) {
      //Save
      this.category = new ToolControlCategory();
      this.category.companyId = this.storageService.companyId;
      this.category.resaleId = this.storageService.resaleId;
      this.category.description = value.description!;
      this.category.status = value.status!;
      this.category.type = value.type!;
      this.category.quantityReq = value.quantityReq != null ? value.quantityReq : 0;
      this.loadingService.show();
      const resultSave = await this.saveCat(this.category);
      this.loadingService.hide();
      if (resultSave.status == 201) {
        this.category.id = resultSave.body!.id;
        this.messageService.add({ severity: 'success', summary: 'Categoria', detail: 'Salva com sucesso', icon: 'pi pi-check' });
      }
    } else {
      //Update
      this.category.description = value.description!;
      this.category.status = value.status!;
      this.category.type = value.type!;
      this.category.quantityReq = value.quantityReq != null ? value.quantityReq : 0;
      this.loadingService.show();
      const resultUpdate = await this.updateCat(this.category);
      this.loadingService.hide();
      if (resultUpdate.status == 200) {
        this.messageService.add({ severity: 'success', summary: 'Categoria', detail: 'Atualizada com sucesso', icon: 'pi pi-check' });
      }
    }
    this.listAll();
  }
  private async saveCat(cat: ToolControlCategory): Promise<HttpResponse<ToolControlCategory>> {
    try {
      return await lastValueFrom(this.categoryService.saveCat(cat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateCat(cat: ToolControlCategory): Promise<HttpResponse<ToolControlCategory>> {
    try {
      return await lastValueFrom(this.categoryService.updateCat(cat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

}
