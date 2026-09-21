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
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';

import { Mechanic } from '@/app/models/workshop/mechanic';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { MechanicService } from '@/app/services/workshop/mechanic.service';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MechanicDepartment } from '@/app/models/workshop/mechanic.department';
import { MechanicDepartmentService } from '@/app/services/workshop/mechanic.department.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-mechanic',
  standalone: true,
  imports: [CommonModule, InputTextModule, InputNumberModule, DialogModule, ToastModule,
    InputMaskModule, RadioButtonModule, SelectModule,
    ReactiveFormsModule, InputGroupModule, InputIconModule, ButtonModule, TableModule, IconFieldModule],
  templateUrl: './mechanic.component.html',
  styleUrl: './mechanic.component.scss',
  providers: [MessageService]
})
export default class MechanicComponent implements OnInit {
  mechanics = signal<Mechanic[]>([]);
  mechanic!: Mechanic;
  isNewMechanic: boolean = true;

  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  //Dialog
  visibleDialog: boolean = false;
  photoMec = signal<string>('');
  isNewPhoto: boolean = false;
  //isDeletePhoto: boolean = false;

  formMec = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    name: new FormControl<string>("", Validators.required),
    codePassword: new FormControl<number | null>(null, Validators.required),
    department: new FormControl<MechanicDepartment | null>(null, Validators.required)
  });

  departments = signal<MechanicDepartment[]>([]);

  constructor(
    private loadingService: LoadingService,
    private mechanicService: MechanicService,
    private messageService: MessageService,
    private storageService: StorageService,
    private photoService: PhotoService,
    private departmentService: MechanicDepartmentService) { }

  ngOnInit(): void {
    this.init();
  }

  async init() {
    this.loadingService.show();
    this.mechanics.set(await this.listAllMec());
    this.departments.set(await this.listAllEnabledDepartment());
    this.loadingService.hide();
  }

  showNewMec() {
    this.cleanForm();
    this.isNewMechanic = true;
    this.showDialog();
  }

  private showDialog() {
    this.visibleDialog = true;
  }
  hideDialog() {
    this.visibleDialog = false;
  }
  async onSelectFile() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoMec.set(photo.base64!);
      this.isNewPhoto = true;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  cleanForm() {
    this.formMec.patchValue({
      name: "",
      status: this.enabled,
      codePassword: null,
      department: null
    });
    this.photoMec.set('');
    this.mechanic = null!;
    this.isNewPhoto = false;
  }
  async editMecchanic(id: number) {
    this.loadingService.show();
    const result = await this.filterId(id);
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.cleanForm();

      this.isNewMechanic = false;
      this.mechanic = result.body.data;
      this.photoMec.set(this.mechanic.photoUrl);
      this.formMec.patchValue({
        name: this.mechanic.name,
        codePassword: this.mechanic.codePassword,
        department: this.departments().find(d => d.id === this.mechanic.departmentId),
        status: this.mechanic.status
      });
      this.showDialog();
    }
  }
  save() {
    if (this.isNewMechanic) {
      this.saveNewMechanic();
    } else {
      this.saveUpdateMechanic();
    }
  }

  private async saveNewMechanic() {
    const { value, valid } = this.formMec;
    if (!valid) {
      return;
    }
    if (!this.isNewPhoto) {
      this.messageService.add({ severity: 'info', summary: 'Foto', detail: 'Não informado.', icon: 'pi pi-info-circle' });
      return;
    }
    //Save
    this.mechanic = new Mechanic();
    this.mechanic.companyId = this.storageService.companyId;
    this.mechanic.resaleId = this.storageService.resaleId;
    this.mechanic.name = value.name!;
    this.mechanic.status = value.status!;
    this.mechanic.codePassword = value.codePassword!;
    this.mechanic.departmentId = value.department?.id!;
    this.loadingService.show();
    const resultMec = await this.saveMec(this.mechanic);
    if (resultMec.status == 201 && resultMec.body?.status == StatusSuccessError.succes) {
      this.mechanic.id = resultMec.body.data?.id!;
      if (this.isNewPhoto) {
        this.isNewPhoto = false;
        this.mechanic.photoUrl = await this.savePhoto(this.mechanic.id!, this.photoMec());
        const resultMec = await this.updateMec(this.mechanic);
      }
      this.messageService.add({ severity: 'success', summary: resultMec.body.header, detail: resultMec.body.message, icon: 'pi pi-check' });
      //Lista todos mecânicos 
      this.mechanics.set(await this.listAllMec());
      this.loadingService.hide();
    }
  }
  private async saveUpdateMechanic() {
    const { value, valid } = this.formMec;
    if (!valid) {
      return;
    }
    if (this.photoMec() == '') {
      this.messageService.add({ severity: 'info', summary: 'Foto', detail: 'Não informado.', icon: 'pi pi-info-circle' });
      return;
    }
    this.mechanic.name = value.name!;
    this.mechanic.status = value.status!;
    this.mechanic.codePassword = value.codePassword!;
    this.mechanic.departmentId = value.department?.id!;

    if (this.isNewPhoto) {
      this.isNewPhoto = false;
      this.loadingService.show();
      this.mechanic.photoUrl = await this.savePhoto(this.mechanic.id!, this.photoMec());
      this.loadingService.hide();
    }
    this.loadingService.show();
    const resultMec = await this.updateMec(this.mechanic);
    this.loadingService.hide();
    if (resultMec.status == 200 && resultMec.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultMec.body.header, detail: resultMec.body.message, icon: 'pi pi-check' });
      //Lista todos os mecânicos 
      this.mechanics.set(await this.listAllMec());
    }
    if (resultMec.status == 200 && resultMec.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultMec.body.header, detail: resultMec.body.message, icon: 'pi pi-info-circle' });
    }
  }

  private async savePhoto(mechanicId: number, img: string): Promise<string> {
    try {
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/workshop/reg/mechanic/` +
        `${mechanicId}/image1.jpg`;

      const { base64, mime } = this.cleanBase64(img);
      const file = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('local', path);

      const resultSave = await this.savePhotoMechanic(formData);
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
  private async savePhotoMechanic(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.mechanicService.savePhoto(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async saveMec(mec: Mechanic): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.mechanicService.saveMec(mec));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateMec(mec: Mechanic): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.mechanicService.updateMec(mec));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAllMec(): Promise<Mechanic[]> {
    try {
      return await lastValueFrom(this.mechanicService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async listAllEnabledDepartment(): Promise<MechanicDepartment[]> {
    try {
      return await lastValueFrom(this.departmentService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async filterId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.mechanicService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

}
