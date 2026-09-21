import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
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
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { ToolControlCategory } from '@/app/models/workshop/tool.control/tool.control.category';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { ToolControlCategoryService } from '@/app/services/workshop/tool.control/tool.control.category.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { ToolControlMaterial } from '@/app/models/workshop/tool.control/tool.control.material';
import { ToolControlMaterialService } from '@/app/services/workshop/tool.control/tool.control.material.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { environment } from '../../../../../../environments/environment';
import { TypeMaterialEnum } from '@/app/models/workshop/type.material.enum';

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [CommonModule, InputTextModule, InputNumberModule, DialogModule, ToastModule,
    InputMaskModule, RadioButtonModule, SelectModule, ConfirmDialogModule,
    ReactiveFormsModule, InputGroupModule, InputIconModule, ButtonModule, TableModule, IconFieldModule],
  templateUrl: './material.component.html',
  styleUrl: './material.component.scss',
  providers: [ConfirmationService, MessageService]
})
export default class MaterialComponent implements OnInit {
  material!: ToolControlMaterial;
  isNewMaterial: boolean = false;
  visibleDialog = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;
  listMat = signal<ToolControlMaterial[]>([]);
  listCat = signal<ToolControlCategory[]>([]);
  photoMat = signal<string>('');
  isNewphoto: boolean = false;
  isDeletePhoto: boolean = false;
  //Dialog
  editQuantityLoan = false;
  editQuantityKit = false;

  LOAN = TypeMaterialEnum.LOAN;
  KIT = TypeMaterialEnum.KIT;
  BOTH = TypeMaterialEnum.BOTH;

  formMat = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    type: new FormControl<TypeMaterialEnum>(TypeMaterialEnum.LOAN, Validators.required),
    numberCA: new FormControl<number | null>(null),
    description: new FormControl<string>("", Validators.required),
    quantityAccountingLoan: new FormControl<number>(0, Validators.required),
    quantityAvailableLoan: new FormControl<number>(0, Validators.required),
    quantityAccountingKit: new FormControl<number>(0, Validators.required),
    quantityAvailableKit: new FormControl<number>(0, Validators.required),
    validityDay: new FormControl<number | null>(null),
    categories: new FormControl<ToolControlCategory | null>(null, Validators.required),
  });

  constructor(
    private permissionUserService: PermissionUserService,
    private loadingService: LoadingService,
    private materialService: ToolControlMaterialService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private storageService: StorageService,
    private categoryService: ToolControlCategoryService,
    private photoService: PhotoService) { }

  ngOnInit(): void {
    this.init();
    this.disableQuantityAccountingLoan();
    this.disableQuantityAvailableLoan();
    this.disableQuantityAccountingKit();
    this.disableQuantityAvailableKit();
  }

  async init() {
    this.loadingService.show();
    this.listMat.set(await this.listAllMaterial());
    this.listCat.set(await this.listAllCat());
    this.loadingService.hide();
  }

  showNewMaterial() {
    this.cleanForm();
    this.isNewMaterial = true;
    this.material = new ToolControlMaterial();
    this.disableQuantityAccountingLoan();
    this.disableQuantityAvailableLoan();
    this.editQuantityLoan = false;
    this.disableQuantityAccountingKit();
    this.disableQuantityAvailableKit();
    this.editQuantityKit = false;
    this.showDialog();
  }
  private showDialog() {
    this.visibleDialog = true;
  }
  hideDialog() {
    this.visibleDialog = false;
  }

  save() {
    if (this.isNewMaterial) {
      this.saveNewMaterial();
    } else {
      this.saveUpdateMaterial();
    }
  }

  private async saveNewMaterial() {
    this.enableQuantityAccountingLoan();
    this.enableQuantityAvailableLoan();
    this.enableQuantityAccountingKit();
    this.enableQuantityAvailableKit();
    const { value, valid } = this.formMat;
    if (!valid) {
      this.disableQuantityAccountingLoan();
      this.disableQuantityAvailableLoan();
      this.editQuantityLoan = false;
      this.disableQuantityAccountingKit();
      this.disableQuantityAvailableKit();
      this.editQuantityKit = false;
      return;
    }
    this.material.companyId = this.storageService.companyId;
    this.material.resaleId = this.storageService.resaleId;
    this.material.status = value.status!;
    this.material.type = value.type!;
    this.material.numberCA = value?.numberCA ?? null;
    this.material.description = value.description!;
    this.material.categoryId = value.categories!.id;
    this.material.validityDay = value?.validityDay ?? null;
    this.material.quantityAccountingLoan = value.quantityAccountingLoan ?? 0;
    this.material.quantityAvailableLoan = value.quantityAvailableLoan ?? 0;
    this.material.quantityAccountingKit = value.quantityAccountingKit ?? 0;
    this.material.quantityAvailableKit = value.quantityAvailableKit ?? 0;
    //this.material.photo = value.photo!;

    this.loadingService.show();
    const resultSave = await this.saveMat(this.material);

    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.isNewMaterial = false;
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.material = resultSave.body.data;
      this.formMat.patchValue({
        quantityAccountingLoan: this.material.quantityAccountingLoan,
        quantityAvailableLoan: this.material.quantityAvailableLoan,
        quantityAccountingKit: this.material.quantityAccountingKit,
        quantityAvailableKit: this.material.quantityAvailableKit
      });
      if (this.isNewphoto) {
        this.isNewphoto = false;
        this.material.photoUrl = await this.savePhoto(this.material.id!, this.photoMat());
        await this.updateMat(this.material);
      }
      this.listMat.set(await this.listAllMaterial());
    }
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
    this.disableQuantityAccountingLoan();
    this.disableQuantityAvailableLoan();
    this.editQuantityLoan = false;
    this.disableQuantityAccountingKit();
    this.disableQuantityAvailableKit();
    this.editQuantityKit = false;
  }
  private async saveUpdateMaterial() {
    this.enableQuantityAccountingLoan();
    this.enableQuantityAvailableLoan();
    this.enableQuantityAccountingKit();
    this.enableQuantityAvailableKit();
    const { value, valid } = this.formMat;
    if (!valid) {
      this.disableQuantityAccountingLoan();
      this.disableQuantityAvailableLoan();
      this.editQuantityLoan = false;
      this.disableQuantityAccountingKit();
      this.disableQuantityAvailableKit();
      this.editQuantityKit = false;
      return;
    }

    if (this.isNewphoto) {
      this.isNewphoto = false;
      this.material.photoUrl = await this.savePhoto(this.material.id!, this.photoMat());
    }
    this.loadingService.show();
    if (this.isDeletePhoto) {
      this.isDeletePhoto = false;
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/workshop/equipment/reg/material/${this.material.id}/image1.jpg`;
      const formData = new FormData();
      formData.append('local', path);
      this.deletePhotoMaterial(formData);
      this.material.photoUrl = '';
    }
    this.material.status = value.status!;
    this.material.type = value.type!;
    this.material.numberCA = value?.numberCA ?? null;
    this.material.description = value.description!;
    this.material.categoryId = value.categories!.id;
    this.material.validityDay = value?.validityDay ?? null;
    this.material.quantityAccountingLoan = value.quantityAccountingLoan ?? 0;
    this.material.quantityAvailableLoan = value.quantityAvailableLoan ?? 0;
    this.material.quantityAccountingKit = value.quantityAccountingKit ?? 0;
    this.material.quantityAvailableKit = value.quantityAvailableKit ?? 0;

    const resultSave = await this.updateMat(this.material);
    this.loadingService.hide();
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.material = resultSave.body.data;
      this.formMat.patchValue({
        quantityAccountingLoan: resultSave.body?.data.quantityAccountingLoan,
        quantityAvailableLoan: resultSave.body?.data.quantityAvailableLoan,
        quantityAccountingKit: resultSave.body?.data.quantityAccountingKit,
        quantityAvailableKit: resultSave.body?.data.quantityAvailableKit
      });
      this.listMat.set(await this.listAllMaterial());
    }
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
    this.disableQuantityAccountingLoan();
    this.disableQuantityAvailableLoan();
    this.editQuantityLoan = false;
    this.disableQuantityAccountingKit();
    this.disableQuantityAvailableKit();
    this.editQuantityKit = false;
  }

  filterCategoriesDesc(id: number): string {
    return this.listCat().find(c => c.id === id)?.description ?? "";
  }

  private cleanForm() {
    this.formMat.patchValue({
      status: StatusEnabDisabEnum.ENABLED,
      description: '',
      categories: null,
      validityDay: null,
      quantityAccountingLoan: 0,
      quantityAvailableLoan: 0,
      quantityAccountingKit: 0,
      quantityAvailableKit: 0,
      type: TypeMaterialEnum.LOAN,
      numberCA: null
    });
    this.photoMat.set('');
    this.isNewphoto = false;
    this.isDeletePhoto = false;
    this.material = null!;
  }

  async onSelectFile() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoMat.set(photo.base64!);
      this.isNewphoto = true;
      this.isDeletePhoto = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  deleteFile() {
    this.photoMat.set('');
    this.isNewphoto = false;
    this.isDeletePhoto = true;
  }
  enableQuantityAccountingLoan() {
    this.formMat.get("quantityAccountingLoan")?.enable();
  }
  disableQuantityAccountingLoan() {
    this.formMat.get("quantityAccountingLoan")?.disable();
  }
  enableQuantityAccountingKit() {
    this.formMat.get("quantityAccountingKit")?.enable();
  }
  disableQuantityAccountingKit() {
    this.formMat.get("quantityAccountingKit")?.disable();
  }
  enableQuantityAvailableLoan() {
    this.formMat.get("quantityAvailableLoan")?.enable();
  }
  disableQuantityAvailableLoan() {
    this.formMat.get("quantityAvailableLoan")?.disable();
  }
  enableQuantityAvailableKit() {
    this.formMat.get("quantityAvailableKit")?.enable();
  }
  disableQuantityAvailableKit() {
    this.formMat.get("quantityAvailableKit")?.disable();
  }

  async confirmEditQuant() {
    /* PERMISSION - 300 */
    /* PERMITIR ALTERAR A QUANTIDADE DE MATERIAIS */
    const permission = await this.searchPermission(300);
    if (!permission) { return; }

    this.confirmationService.confirm({
      header: 'Alterar Quantidade?',
      message: 'Por favor comfirme para alterar.',
      acceptLabel: 'Comfirmar',
      accept: () => {
        switch (this.formMat.get("type")?.value) {
          case TypeMaterialEnum.LOAN:
            if (this.editQuantityKit == false) {
              this.enableQuantityAccountingLoan();
              this.editQuantityLoan = true;
            }
            break;
          case TypeMaterialEnum.KIT:
            if (this.editQuantityLoan == false) {
              this.enableQuantityAccountingKit();
              this.editQuantityKit = true;
            }
            break;
          default:
            this.enableQuantityAccountingLoan();
            this.editQuantityLoan = true;
            this.enableQuantityAccountingKit();
            this.editQuantityKit = true;
            break;
        }
      },
      reject: () => {

      }
    });

  }
  async editMat(id: number) {
    this.loadingService.show();
    const resultFilter = await this.filterMaterial(id);
    this.loadingService.hide();
    if (resultFilter.status == 200 && resultFilter.body?.status == StatusSuccessError.succes) {
      this.material = resultFilter.body.data;
      let category: ToolControlCategory = this.listCat().find(cat => cat.id == this.material.categoryId)!;
      
      this.formMat.patchValue({
        description: this.material.description,
        status: this.material.status!,
        type: this.material.type,
        numberCA: this.material?.numberCA ?? null,
        categories: category,
        validityDay: this.material?.validityDay ?? null,
        quantityAccountingLoan: this.material.quantityAccountingLoan,
        quantityAvailableLoan: this.material.quantityAvailableLoan,
        quantityAccountingKit: this.material.quantityAccountingKit,
        quantityAvailableKit: this.material.quantityAvailableKit
      });

      this.photoMat.set(this.material.photoUrl);
      this.showDialog();
      this.disableQuantityAccountingLoan();
      this.disableQuantityAvailableLoan();
      this.editQuantityLoan = false;
      this.disableQuantityAccountingKit();
      this.disableQuantityAvailableKit();
      this.editQuantityKit = false;
    }
  }

  private async saveMat(mat: ToolControlMaterial): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.materialService.save(mat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: "Erro", detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateMat(mat: ToolControlMaterial): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.materialService.update(mat));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: "Erro", detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAllCat(): Promise<ToolControlCategory[]> {
    try {
      return await lastValueFrom(this.categoryService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: "Erro", detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async searchPermission(permission: number): Promise<boolean> {
    try {
      var result = await lastValueFrom(this.permissionUserService.filterPermission(this.storageService.companyId, this.storageService.resaleId, this.storageService.id, permission));
      if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
        return true;
      } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
      }
      return false;
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return false;
    }
  }

  private async listAllMaterial(): Promise<ToolControlMaterial[]> {
    try {
      return await lastValueFrom(this.materialService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async filterMaterial(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.materialService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async savePhoto(id: number, img: string): Promise<string> {
    try {
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/workshop/equipment/reg/material/` +
        `${id}/image1.jpg`;
      const { base64, mime } = this.cleanBase64(img);
      const file = this.base64ToFile(base64, mime);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('local', path);
      const resultSave = await this.savePhotoMaterial(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error) {
      return "";
    }
    return "";
  }
  private cleanBase64(base64: string): { base64: string; mime: string } {
    if (!base64.includes(',')) {
      return { base64, mime: 'image/jpeg' };
    }

    const [header, data] = base64.split(',');
    const mime = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';

    return { base64: data, mime };
  }
  private base64ToFile(base64: string, mime: string): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ia], 'image.jpg', { type: mime });
  }

  private async savePhotoMaterial(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.materialService.saveImage(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async deletePhotoMaterial(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.materialService.deleteImage(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

}
