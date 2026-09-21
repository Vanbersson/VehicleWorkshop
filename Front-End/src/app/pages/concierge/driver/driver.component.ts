import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

//PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputGroupModule } from 'primeng/inputgroup';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ImageModule } from 'primeng/image';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';

import { Driver } from '@/app/models/driver';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StorageService } from '@/app/services/storage/storage.service';
import { DriverService } from '@/app/services/driver/driver.service';
import { CEPService } from '@/app/services/cep/cep.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusMaleFemaleEnum } from '@/app/models/status-male-female';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { LoadingService } from '@/app/services/loading/loading.service';

interface sexo {
  type: string;
}

@Component({
  selector: 'app-driver',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule, FormsModule, ReactiveFormsModule, InputNumberModule, InputMaskModule, DividerModule,
    ImageModule, DatePickerModule, SelectModule,
    InputGroupModule, InputIconModule, IconFieldModule, InputTextModule, TableModule, DialogModule, RadioButtonModule],
  templateUrl: './driver.component.html',
  styleUrl: './driver.component.scss',
  providers: [MessageService]
})
export default class DriverComponent implements OnInit {

  listDriver = signal<Driver[]>([]);
  private driver!: Driver;
  private isNewDriver: boolean = true;

  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  //Dialog novo
  visibleDialogNew: boolean = false;
  driverPhotoUrl = signal<string>('');
  isDeletePhotoDriver: boolean = false;
  driverPhotoDoc1Url = signal<string>('');
  isDeletePhotoDoc1: boolean = false;
  driverPhotoDoc2Url = signal<string>('');
  isDeletePhotoDoc2: boolean = false;
  sexos: sexo[] | undefined;

  formDriver = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    id: new FormControl<number | null>({ value: null, disabled: true }),
    name: new FormControl<string>("", [Validators.required, Validators.maxLength(100)]),
    dateBirth: new FormControl<string | Date>("", Validators.required),
    cpf: new FormControl<string>("", Validators.required),
    rg: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(11)]),
    maleFemale: new FormControl<sexo | null>(null, Validators.required),
    email: new FormControl<string>(""),
    cnhRegister: new FormControl<string | null>(null, [Validators.required, Validators.maxLength(11)]),
    cnhCategory: new FormControl<string>("", [Validators.required, Validators.maxLength(10)]),
    cnhValidation: new FormControl<string | Date>("", Validators.required),
    dddPhone: new FormControl<string>(""),
    phone: new FormControl<string>(""),
    dddCellphone: new FormControl<string>(""),
    cellphone: new FormControl<string>(""),
    zipCode: new FormControl<string>("", Validators.required),
    address: new FormControl<string>("", [Validators.required, Validators.maxLength(100)]),
    addressNumber: new FormControl<string | null>(null),
    state: new FormControl<string>("", Validators.required),
    city: new FormControl<string>("", [Validators.required, Validators.maxLength(100)]),
    neighborhood: new FormControl<string>("", [Validators.required, Validators.maxLength(100)]),
    addressComplement: new FormControl<string>(""),
  });

  constructor(
    private loadingService: LoadingService,
    private storageService: StorageService,
    private messageService: MessageService,
    private driverService: DriverService,
    private cepService: CEPService,
    private photoService: PhotoService) { }

  ngOnInit(): void {
    this.sexos = [{ type: StatusMaleFemaleEnum.male }, { type: StatusMaleFemaleEnum.female }]
    //Lista motoristas
    this.listDrivers();
  }

  applyDateMask(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    }
    if (value.length > 5) {
      value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }

    event.target.value = value;
  }

  async listDrivers() {
    //Inicia load
    this.loadingService.show();
    const result = await this.listAll();
    this.listDriver.set(result.body?.data);
    //Fecha load
    this.loadingService.hide();
  }

  maskCPF(cpf: string): string {
    if (cpf == "") return "";
    const CPF = cpf.substring(0, 3) + "." + cpf.substring(3, 6) + "." + cpf.substring(6, 9) + "-" + cpf.substring(9, 11);
    return CPF;
  }

  public showDialog() {
    this.cleanForm();
    this.visibleDialogNew = true;
  }

  public hideDialog() {
    this.visibleDialogNew = false;
  }

  private cleanForm() {
    this.formDriver.patchValue({
      status: StatusEnabDisabEnum.ENABLED,
      id: null,
      name: "",
      dateBirth: null,
      cpf: "",
      rg: null,
      email: "",
      cnhRegister: null,
      cnhCategory: "",
      cnhValidation: null,
      maleFemale: null,
      dddPhone: "",
      phone: "",
      dddCellphone: "",
      cellphone: "",
      zipCode: null,
      address: "",
      addressNumber: null,
      state: "",
      city: "",
      neighborhood: "",
      addressComplement: ""
    });

    this.driverPhotoUrl.set('');
    this.driverPhotoDoc1Url.set('');
    this.driverPhotoDoc2Url.set('');
  }

  async selectPhoto() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.driverPhotoUrl.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  async photoFile1Driver() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.driverPhotoDoc1Url.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  async photoFile2Driver() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.driverPhotoDoc2Url.set(photo.base64!);
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  deletePhoto() {
    this.driverPhotoUrl.set('');
    this.driver.photoDriverUrl = "";
    this.isDeletePhotoDriver = true;
  }
  deleteEntryFileDriver1() {
    this.driverPhotoDoc1Url.set('');
    this.driver.photoDoc1Url = "";
    this.isDeletePhotoDoc1 = true;
  }
  deleteEntryFileDriver2() {
    this.driverPhotoDoc2Url.set('');
    this.driver.photoDoc2Url = "";
    this.isDeletePhotoDoc2 = true;
  }
  public newDriver() {
    this.isNewDriver = true;
    this.showDialog();
  }
  public async save() {
    if (this.isNewDriver) {
      this.driver = new Driver();
      this.saveNewDriver();
    } else {
      this.updateSaveDriver();
    }
  }
  private async saveNewDriver() {
    const { value, valid } = this.formDriver;
    if (!valid) {
      return;
    }
    //Save
    this.driver.companyId = this.storageService.companyId;
    this.driver.resaleId = this.storageService.resaleId;
    this.driver.status = value.status!;
    this.driver.name = value.name!;
    this.driver.dateBirth = value.dateBirth!;
    this.driver.cpf = value.cpf!;
    this.driver.rg = value.rg!.toString();
    this.driver.maleFemale = value.maleFemale!['type'] == StatusMaleFemaleEnum.male ? StatusMaleFemaleEnum.male : StatusMaleFemaleEnum.female;
    this.driver.cnhRegister = value.cnhRegister!.toString();
    this.driver.cnhCategory = value.cnhCategory!;
    this.driver.cnhValidation = value.cnhValidation!;
    this.driver.email = value.email!;
    this.driver.dddPhone = value.dddPhone!;
    this.driver.phone = value.phone!;
    this.driver.dddCellphone = value.dddCellphone!;
    this.driver.cellphone = value.cellphone!;
    this.driver.zipCode = value.zipCode!;
    this.driver.address = value.address!;
    this.driver.addressNumber = value.addressNumber == null ? "" : value.addressNumber.toString();
    this.driver.state = value.state!;
    this.driver.city = value.city!;
    this.driver.neighborhood = value.neighborhood!;
    this.driver.addressComplement = value.addressComplement!;
    //Inicia load
    this.loadingService.show();
    const resultSave = await this.saveDriver(this.driver);
    //Fecha load
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.driver = resultSave.body.data;
      this.formDriver.get('id')!.setValue(this.driver.id);
      this.isNewDriver = false;
      //save photo
      if (this.driverPhotoUrl() != "" && this.driver.photoDriverUrl == "") {
        this.driver.photoDriverUrl = await this.savePhoto(this.driverPhotoUrl(), this.driver.id!.toString());
      }
      if (this.driverPhotoDoc1Url() != "" && this.driver.photoDoc1Url == "") {
        this.driver.photoDoc1Url = await this.saveDoc1(this.driverPhotoDoc1Url(), this.driver.id!.toString());
      }
      if (this.driverPhotoDoc2Url() != "" && this.driver.photoDoc2Url == "") {
        this.driver.photoDoc2Url = await this.saveDoc2(this.driverPhotoDoc2Url(), this.driver.id!.toString());
      }
      const resultUpdate = await this.updateDriver(this.driver);
      //Lista motoristas
      this.listDrivers();
    } else if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }

  }
  async edit(id: number) {
    //Inicia load
    this.loadingService.show();
    const result = await this.filterDriverId(id);
    //Fecha load
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {

      this.isNewDriver = false;
      this.showDialog();
      this.driver = result.body.data;

      this.formDriver.patchValue({
        status: this.driver.status,
        id: this.driver.id,
        name: this.driver.name,
        dateBirth: this.driver.dateBirth != null ? new Date(this.driver.dateBirth) : "",
        cpf: this.driver.cpf,
        rg: this.driver.rg,
        maleFemale: { type: this.driver.maleFemale },
        email: this.driver.email,
        cnhRegister: this.driver.cnhRegister,
        cnhCategory: this.driver.cnhCategory,
        cnhValidation: new Date(this.driver.cnhValidation),
        dddPhone: this.driver.dddPhone,
        phone: this.driver.phone,
        dddCellphone: this.driver.dddCellphone,
        cellphone: this.driver.cellphone,
        zipCode: this.driver.zipCode,
        address: this.driver.address,
        addressNumber: this.driver.addressNumber,
        state: this.driver.state,
        city: this.driver.city,
        neighborhood: this.driver.neighborhood,
        addressComplement: this.driver.addressComplement,

      });

      this.driverPhotoUrl.set(this.driver.photoDriverUrl);
      this.driverPhotoDoc1Url.set(this.driver.photoDoc1Url);
      this.driverPhotoDoc2Url.set(this.driver.photoDoc2Url);
    }
  }
  private async updateSaveDriver() {
    const { value, valid } = this.formDriver;
    if (!valid) {
      return;
    }

    //Update
    //Inicia load
    this.loadingService.show();
    //save photo
    if (this.driverPhotoUrl() != "" && this.driver.photoDriverUrl == "") {
      this.driver.photoDriverUrl = await this.savePhoto(this.driverPhotoUrl(), this.driver.id!.toString());
    }
    if (this.driverPhotoDoc1Url() != "" && this.driver.photoDoc1Url == "") {
      this.driver.photoDoc1Url = await this.saveDoc1(this.driverPhotoDoc1Url(), this.driver.id!.toString());
    }
    if (this.driverPhotoDoc2Url() != "" && this.driver.photoDoc2Url == "") {
      this.driver.photoDoc2Url = await this.saveDoc2(this.driverPhotoDoc2Url(), this.driver.id!.toString());
    }
    //delete photo
    const formData = new FormData();
    if (this.isDeletePhotoDriver) {
      this.isDeletePhotoDriver = false;
      formData.append('driver', this.driver.id!.toString());
      formData.append('code', "1");
      formData.append('company', this.storageService.companyId.toString());
      formData.append('resale', this.storageService.resaleId.toString());
      this.deleteImage(formData);
      this.driver.photoDriverUrl = "";
    }
    if (this.isDeletePhotoDoc1) {
      this.isDeletePhotoDoc1 = false;
      formData.append('driver', this.driver.id!.toString());
      formData.append('code', "2");
      formData.append('company', this.storageService.companyId.toString());
      formData.append('resale', this.storageService.resaleId.toString());
      this.deleteImage(formData);
      this.driver.photoDoc1Url = "";
    }
    if (this.isDeletePhotoDoc2) {
      this.isDeletePhotoDoc2 = false;
      formData.append('driver', this.driver.id!.toString());
      formData.append('code', "3");
      formData.append('company', this.storageService.companyId.toString());
      formData.append('resale', this.storageService.resaleId.toString());
      this.deleteImage(formData);
      this.driver.photoDoc2Url = "";
    }

    this.driver.status = value.status!;
    this.driver.name = value.name!;
    this.driver.dateBirth = value.dateBirth!;
    this.driver.cpf = value.cpf!;
    this.driver.rg = value.rg!.toString();
    this.driver.maleFemale = value.maleFemale!['type'] == StatusMaleFemaleEnum.male ? StatusMaleFemaleEnum.male : StatusMaleFemaleEnum.female;
    this.driver.cnhRegister = value.cnhRegister!.toString();
    this.driver.cnhCategory = value.cnhCategory!;
    this.driver.cnhValidation = value.cnhValidation!;
    this.driver.email = value.email!;
    this.driver.dddPhone = value.dddPhone!;
    this.driver.phone = value.phone!;
    this.driver.dddCellphone = value.dddCellphone!;
    this.driver.cellphone = value.cellphone!;
    this.driver.zipCode = value.zipCode!;
    this.driver.address = value.address!;
    this.driver.addressNumber = value.addressNumber == null ? "" : value.addressNumber.toString();
    this.driver.state = value.state!;
    this.driver.city = value.city!;
    this.driver.neighborhood = value.neighborhood!;
    this.driver.addressComplement = value.addressComplement!;
    const resultSave = await this.updateDriver(this.driver);
    //Fecha load
    this.loadingService.hide();
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      //Lista motoristas
      this.listDrivers();
    } else if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async saveDriver(driver: Driver): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.save(driver));
    } catch (error: any) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateDriver(driver: Driver): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.update(driver));
    } catch (error: any) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterDriverId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.filterId(id));
    } catch (error: any) {
      return error;
    }
  }
  private async listAll(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.listAll());
    } catch (error: any) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  public async searchCEP() {
    if (!this.formDriver.get('zipCode')!.value) {
      return;
    }
    const result = await this.cep(this.formDriver.get('zipCode')!.value!);

    if (result.status == 200) {
      this.formDriver.patchValue({
        address: result.body.logradouro,
        addressComplement: result.body.complemento,
        state: result.body.uf,
        city: result.body.localidade,
        neighborhood: result.body.bairro
      });
    }

  }
  private async cep(cep: string): Promise<HttpResponse<any>> {
    try {
      return await lastValueFrom(this.cepService.search(cep));
    } catch (error: any) {
      return error;
    }
  }

  private async savePhoto(imgBase64: string, driverId: string): Promise<string> {
    try {
      const { base64, mime } = this.cleanBase64(imgBase64);
      const imageFile = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('driver', driverId);
      formData.append('company', this.storageService.companyId.toString());
      formData.append('resale', this.storageService.resaleId.toString());

      const resultSave = await this.savePhotoDriver(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        // this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
    }
    return "";
  }
  private async saveDoc1(imgBase64: string, driverId: string): Promise<string> {
    try {
      const { base64, mime } = this.cleanBase64(imgBase64);
      const imageFile = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('driver', driverId);
      formData.append('company', this.storageService.companyId.toString());
      formData.append('resale', this.storageService.resaleId.toString());

      const resultSave = await this.savePhotoDoc1(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        // this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
    }
    return "";
  }
  private async saveDoc2(imgBase64: string, driverId: string): Promise<string> {
    try {
      const { base64, mime } = this.cleanBase64(imgBase64);
      const imageFile = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('driver', driverId);
      formData.append('company', this.storageService.companyId.toString());
      formData.append('resale', this.storageService.resaleId.toString());

      const resultSave = await this.savePhotoDoc2(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        // this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
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
  private async savePhotoDriver(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.savePhotoDriver(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async savePhotoDoc1(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.savePhotoDoc1(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async savePhotoDoc2(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.savePhotoDoc2(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async deleteImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.driverService.deletePhoto(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

}
