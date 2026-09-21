import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';

import { VehicleEntry } from '@/app/models/vehicle.entry';
import { LoadingService } from '@/app/services/loading/loading.service';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { VehicleExit } from '@/app/models/vehicle.exit';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';


@Component({
  selector: 'app-vehicle-exit',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, TableModule,
    InputTextModule, IconFieldModule, InputIconModule, DividerModule, TextareaModule, FormsModule, ImageModule,TagModule,
    ConfirmDialogModule, ToastModule, BadgeModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './vehicle.exit.component.html',
  styleUrl: './vehicle.exit.component.scss'
})
export default class VehicleExitComponent implements OnInit {
  listVehicleExit = signal<VehicleEntry[]>([]);
  selectedVehicle: VehicleEntry[] = [];

  valueInfoPlaca: string = '';
  valueInfoModel: string = '';
  valueInfoVehicle: string = '';
  photoVehicle1 = signal<string>('');
  photoVehicle2 = signal<string>('');
  photoVehicle3 = signal<string>('');
  photoVehicle4 = signal<string>('');

  constructor(
    private loadingService: LoadingService,
    private vehicleService: VehicleEntryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private storageService: StorageService,
    private photoService: PhotoService) {
  }

  ngOnInit(): void {
    this.init();
  }

  async init() {
    this.loadingService.show();
    const data = await this.allAuthorized();
    this.loadingService.hide();
    if (data.length > 0) {
      const datePipe = new DatePipe('pt-BR');
      for (let index = 0; index < data.length; index++) {
        data[index].entryDate = datePipe.transform(this.formatDateTime(new Date(data[index].entryDate)), 'dd/MM/yyyy HH:mm')!;
        if (data[index].vehicleNew == YesNotEnum.YES) {
          data[index].vehiclePlate = "NOVO";
        }
        var nome = data[index].clientCompanyName.split(' ');
        data[index].clientCompanyName = nome[0] + " " + nome[1];
      }
      this.listVehicleExit.set(data);
    } else {
      this.listVehicleExit.set(data);
    }
  }

  public async photoFile1Vehicle() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle1.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      //this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  public async photoFile2Vehicle() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle2.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      //this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  public async photoFile3Vehicle() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle3.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      //this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  public async photoFile4Vehicle() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoVehicle4.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      //this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  public deleteFileVehicle1() {
    this.photoVehicle1.set('');
  }
  public deleteFileVehicle2() {
    this.photoVehicle2.set('');
  }
  public deleteFileVehicle3() {
    this.photoVehicle3.set('');
  }
  public deleteFileVehicle4() {
    this.photoVehicle4.set('');
  }
  private cleanSelectionVehicle() {
    this.selectedVehicle = [];
  }
  formatDateTime(date: Date): string {
    const datePipe = new DatePipe('en-US');

    // Obtém o fuso horário local no formato ±hh:mm
    const tzOffset = -date.getTimezoneOffset();
    const sign = tzOffset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
    const timezone = `${sign}${hours}:${minutes}`;

    // Formata a data e adiciona o fuso horário
    return datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") + timezone;
  }
  async confirm() {
    for (let index = 0; index < this.selectedVehicle.length; index++) {
      //clear
      this.valueInfoPlaca = "";
      this.valueInfoVehicle = "";
      this.photoVehicle1.set('');
      this.photoVehicle2.set('');
      this.photoVehicle3.set('');
      this.photoVehicle4.set('');

      var element = this.selectedVehicle[index];
      this.valueInfoPlaca = element.vehiclePlate;
      this.valueInfoModel = element.modelDescription;

      var vehicleExit: VehicleExit = new VehicleExit();
      vehicleExit.companyId = this.storageService.companyId;
      vehicleExit.resaleId = this.storageService.resaleId;
      vehicleExit.vehicleId = element.id;

      vehicleExit.exitUserId = this.storageService.id;
      vehicleExit.exitUserName = this.storageService.name;
      vehicleExit.exitDate = this.formatDateTime(new Date());
      const resultSave = await this.confirmationExit(vehicleExit);
    }
    this.cleanSelectionVehicle();
    this.init();
  }
  private async confirmationExit(exit: VehicleExit): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.confirmationService.confirm({
        header: 'Confirmar saída?',
        message: 'Por favor confirme para continuar.',
        accept: async () => {
          //Inicia load
          this.loadingService.show();
          if (this.photoVehicle1) {
            const resultImg1 = await this.savePhoto(exit, this.photoVehicle1(), 1);
            exit.exitPhoto1Url = resultImg1;
          }
          if (this.photoVehicle2) {
            const resultImg2 = await this.savePhoto(exit, this.photoVehicle2(), 2);
            exit.exitPhoto2Url = resultImg2;
          }
          if (this.photoVehicle3) {
            const resultImg3 = await this.savePhoto(exit, this.photoVehicle3(), 3);
            exit.exitPhoto3Url = resultImg3;
          }
          if (this.photoVehicle4) {
            const resultImg4 = await this.savePhoto(exit, this.photoVehicle4(), 4);
            exit.exitPhoto4Url = resultImg4;
          }
          exit.exitInformation = this.valueInfoVehicle;
          const result = await this.exit(exit);
          //Fecha load
          this.loadingService.hide();
          //Espera
          setTimeout(() => resolve(result), 300);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }
  private async exit(exit: VehicleExit): Promise<boolean> {
    var result = await this.confirmationExitVehicle(exit);
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      var upper = new UpperCasePipe();
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message + " " + upper.transform(this.valueInfoPlaca), icon: 'pi pi-check' });
      return true;
    } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
    return false;
  }
  private async confirmationExitVehicle(vehicle: VehicleExit): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.entryExit(vehicle))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async allAuthorized(): Promise<VehicleEntry[]> {
    try {
      return await lastValueFrom(this.vehicleService.listAllAuthorized());
    } catch (error) {
      return [];
    }
  }
  private async savePhoto(veExit: VehicleExit, img: string, order: number): Promise<string> {
    if (img == "") {
      return "";
    }
    try {
      let path =
        `${veExit.companyId}/` +
        `${veExit.resaleId}/concierge/vehicle/` +
        `${veExit.vehicleId}/exit/`;

      const { base64, mime } = this.cleanBase64(img);
      const file = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', file);

      switch (order) {
        case 1:
          path += "image1.jpg";
          formData.append('local', path);
          break;
        case 2:
          path += "image2.jpg";
          formData.append('local', path);
          break;
        case 3:
          path += "image3.jpg";
          formData.append('local', path);
          break;
        case 4:
          path += "image4.jpg";
          formData.append('local', path);
          break;
      }
      const resultSave = await this.saveImage(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error) {
      return "";
    }
    return "";

  }
  private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.vehicleService.saveImage(data));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
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

}


