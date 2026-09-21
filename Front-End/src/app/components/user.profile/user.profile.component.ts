import { Component, Provider, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { PasswordModule } from 'primeng/password';
import { ImageModule } from 'primeng/image';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';

import { StorageService } from '../../services/storage/storage.service';

import { PhotoService } from '../../services/photo/photo.service';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { User } from '@/app/models/user';
import { UserService } from '@/app/services/user/user.service';
import { LoadingService } from '@/app/services/loading/loading.service';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ToastModule, ButtonModule, DividerModule,
    InputMaskModule, InputTextModule, RadioButtonModule, DialogModule,InputNumberModule,
    PasswordModule, ImageModule],
  templateUrl: './user.profile.component.html',
  styleUrl: './user.profile.component.scss',
  providers: [MessageService],
})
export class UserProfileComponent {
  private user!: User;
  visible: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;
  userPhotoUrl = signal<string>('');
  isDeletePhoto: boolean = false;
  isAddPhoto: boolean = false;


  userForm = new FormGroup({
    name: new FormControl<string>('', Validators.required),
    email: new FormControl<string>({ value: '', disabled: true }, Validators.required),
    cellphone: new FormControl<string>(''),
    limitDiscount: new FormControl<number>({ value: 0, disabled: true }, Validators.required),
    roleDesc: new FormControl<string>({ value: '', disabled: true }, Validators.required),
    status: new FormControl<string>({ value: this.disabled, disabled: true }, Validators.required),
  });

  constructor(
    private loadingService: LoadingService,
    private photoService: PhotoService,
    private storageService: StorageService,
    private messageService: MessageService,
    private userService: UserService) { }

  private showDialog() {
    this.visible = true;
  }

  showUser(user: User) {
    this.user = user;
    this.dataViewUser();
  }

  private dataViewUser() {
    this.userForm.patchValue({
      name: this.user.name,
      email: this.user.email,
      cellphone: this.user.cellphone,
      limitDiscount: this.user.limitDiscount,
      roleDesc: this.user.roleDesc,
      status: this.user.status,
    });
    this.userPhotoUrl.set(this.user.photoUrl);

    this.showDialog();
  }
  async deletePhoto() {
    this.userPhotoUrl.set('');
    this.user.photoUrl = "";

    this.isDeletePhoto = true;
    this.isAddPhoto = false;
  }
  async selectPhoto() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.userPhotoUrl.set(photo.base64!);
      this.isDeletePhoto = false;
      this.isAddPhoto = true;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }

  async save() {
    const { valid, value } = this.userForm;
    if (!valid) return;

    this.loadingService.show();
    this.user.photoUrl = await this.photo();
    this.user.name = value.name!;
    this.user.cellphone = value.cellphone!;

    const resultUpdate = await this.updateUser(this.user);
    this.loadingService.hide();
    if (resultUpdate.status == 200 && resultUpdate.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultUpdate.body.header, detail: resultUpdate.body.message, icon: 'pi pi-check' });
      //Atualiza os dados local
      this.updateStaroge(resultUpdate.body.data);
    }
  }

  private updateStaroge(user: User) {
    this.storageService.name = user.name;
    this.storageService.cellphone = user.cellphone;
    this.storageService.photo = user.photoUrl;
  }

  private async photo(): Promise<string> {
    let p: string = '';
    const path =
      `${this.storageService.companyId}/` +
      `${this.storageService.resaleId}/users/` +
      `${this.storageService.id}/profile/`;

    //Remove a foto
    if (this.isDeletePhoto) {
      this.isDeletePhoto = false;
      const formdata = new FormData();
      formdata.append("local", path + "image.jpg");
      const resultDel = await this.deleteImage(formdata);
      if (resultDel.status == 200 && resultDel.body?.status == StatusSuccessError.succes) {
        this.messageService.add({ severity: 'success', summary: resultDel.body.header, detail: resultDel.body.message, icon: 'pi pi-check' });
      }
    }
    //Tentar salvar a foto
    if (this.isAddPhoto) {
      this.isAddPhoto = false;
      try {
        const { base64, mime } = this.cleanBase64(this.userPhotoUrl());
        const imageFile = this.base64ToFile(base64, mime);

        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('local', path);

        const resultSave = await this.saveImage(formData);
        if (resultSave.status === 200 && resultSave.body?.status === StatusSuccessError.succes) {
          this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
          p = `${environment.apiuUrl}${resultSave.body.data["url"]}`;
        }
      } catch (error) {
        //this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar imagem de perfil' });
      }
    }
    return p;
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

  private async deleteImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.deleteImage(data));
    } catch (error) {
      let er: MessageResponse = new MessageResponse();
      er.header = 'Atenção';
      er.status = StatusSuccessError.error;
      if (error instanceof HttpErrorResponse) {
        er.message = error.error?.message ?? error.message;
      } else {
        er.message = 'Erro ao atualizar o usuário.';
      }
      return new HttpResponse<MessageResponse>({
        body: er,
        status: 401
      });
    }
  }

  private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.uploadImage(data))
    } catch (error) {
      let er: MessageResponse = new MessageResponse();
      er.header = 'Atenção';
      er.status = StatusSuccessError.error;
      if (error instanceof HttpErrorResponse) {
        er.message = error.error?.message ?? error.message;
      } else {
        er.message = 'Erro ao atualizar o usuário.';
      }
      return new HttpResponse<MessageResponse>({
        body: er,
        status: 401
      });
    }
  }

  private async updateUser(user: User): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.updateUser(user));
    } catch (error) {
      let er: MessageResponse = new MessageResponse();
      er.header = 'Atenção';
      er.status = StatusSuccessError.error;
      if (error instanceof HttpErrorResponse) {
        er.message = error.error?.message ?? error.message;
      } else {
        er.message = 'Erro ao atualizar o usuário.';
      }
      return new HttpResponse<MessageResponse>({
        body: er,
        status: 401
      });
    }
  }
}
