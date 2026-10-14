import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectModule } from 'primeng/multiselect';

import { Salesperson } from '@/app/models/crm/salesperson';
import { User } from '@/app/models/user';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { UserService } from '@/app/services/user/user.service';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { SalespersonGroupService } from '@/app/services/salesperson/salesperson.group.service';
import { SalespersonGroup } from '@/app/models/salesperson/salesperson.group';
import { SalesTypeEnum } from '@/app/models/crm/sales.type.enum';
import { SalespersonTypeEnum } from '@/app/models/crm/salesperson.type.enum';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';


@Component({
  selector: 'app-salesperson',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, ToastModule, CheckboxModule, RadioButtonModule, InputMaskModule, MultiSelectModule,
    SelectModule, DialogModule, InputTextModule, InputNumberModule, ReactiveFormsModule],
  templateUrl: './salesperson.component.html',
  styleUrl: './salesperson.component.scss',
  providers: [MessageService]
})
export default class SalespersonComponent {

  ufs = [
    { label: 'AC', value: 'AC' },
    { label: 'AL', value: 'AL' },
    { label: 'AP', value: 'AP' },
    { label: 'AM', value: 'AM' },
    { label: 'BA', value: 'BA' },
    { label: 'CE', value: 'CE' },
    { label: 'DF', value: 'DF' },
    { label: 'ES', value: 'ES' },
    { label: 'GO', value: 'GO' },
    { label: 'MA', value: 'MA' },
    { label: 'MT', value: 'MT' },
    { label: 'MS', value: 'MS' },
    { label: 'MG', value: 'MG' },
    { label: 'PA', value: 'PA' },
    { label: 'PB', value: 'PB' },
    { label: 'PR', value: 'PR' },
    { label: 'PE', value: 'PE' },
    { label: 'PI', value: 'PI' },
    { label: 'RJ', value: 'RJ' },
    { label: 'RN', value: 'RN' },
    { label: 'RS', value: 'RS' },
    { label: 'RO', value: 'RO' },
    { label: 'RR', value: 'RR' },
    { label: 'SC', value: 'SC' },
    { label: 'SP', value: 'SP' },
    { label: 'SE', value: 'SE' },
    { label: 'TO', value: 'TO' }
  ];

  photoPerson = signal<string>('');
  isNewPhoto: boolean = false;
  private salesperson!: Salesperson;
  private isNewSalesperson: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  PART = SalesTypeEnum.PART;
  SERVICE = SalesTypeEnum.SERVICE;
  VEHICLE = SalesTypeEnum.VEHICLE;

  IN = SalespersonTypeEnum.INTERNAL;
  EX = SalespersonTypeEnum.EXTERNAL;
  BOTH = SalespersonTypeEnum.BOTH;

  YES = YesNotEnum.YES;
  NOT = YesNotEnum.NOT;

  salespersons = signal<Salesperson[]>([]);
  visible: boolean = false;

  formPerson = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    typeSales: new FormControl<SalespersonTypeEnum>(SalespersonTypeEnum.INTERNAL),
    typeSalesPart: new FormControl<string[] | null>(null),
    typeSalesService: new FormControl<string[] | null>(null),
    typeSalesVehicle: new FormControl<string[] | null>(null),
    id: new FormControl<number | null>({ value: null, disabled: true }),
    name: new FormControl<string>('', [Validators.required]),
    user: new FormControl<User | null>(null, [Validators.required]),
    cpf: new FormControl<string>('', [Validators.required]),

    dddCellphone: new FormControl<string>('', [Validators.required]),
    cellphone: new FormControl<string>('', [Validators.required]),
    limitDiscount: new FormControl<number>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
    group: new FormControl<SalespersonGroup | null>(null, [Validators.required]),

  });

  attendantsUser = signal<User[]>([]);
  groups = signal<SalespersonGroup[]>([]);

  constructor(private messageService: MessageService,
    private storageService: StorageService,
    private userService: UserService,
    private loadingService: LoadingService,
    private photoService: PhotoService,
    private salespersonService: SalespersonService,
    private salespersonGroupService: SalespersonGroupService) { this.init(); }

  private async init() {
    this.loadingService.show();
    this.salespersons.set(await this.listAll());
    this.attendantsUser.set(await this.getUsers());
    this.groups.set(await this.listAllGroups());
    this.loadingService.hide();
  }

  private showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.visible = false;
  }

  cleanForm() {
    this.formPerson.reset();
    this.formPerson.patchValue({
      status: StatusEnabDisabEnum.ENABLED,
      typeSales: SalespersonTypeEnum.INTERNAL,
      typeSalesPart: null,
      typeSalesService: null,
      typeSalesVehicle: null,
    });
    this.photoPerson.set('');
    this.isNewPhoto = false;
    this.salesperson = null as any;

  }

  newSalesperson() {
    this.isNewSalesperson = true;
    this.cleanForm();
    this.showDialog();
  }

  save() {
    if (this.isNewSalesperson) {
      this.saveNewPerson();
    } else {
      this.saveUpdatePerson();
    }
  }

  private async saveNewPerson() {

    const { value } = this.formPerson;
    this.salesperson = new Salesperson();

    this.salesperson.status = value.status!;
    this.salesperson.typeSales = value.typeSales!;
    this.salesperson.typeSalesPart = value.typeSalesPart?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
    this.salesperson.typeSalesService = value.typeSalesService?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
    this.salesperson.typeSalesVehicle = value.typeSalesVehicle?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;

    this.salesperson.name = value.name!;
    this.salesperson.userId = value.user?.id!;
    this.salesperson.cpf = value.cpf!;
    this.salesperson.dddCellphone = value.dddCellphone!;
    this.salesperson.cellphone = value.cellphone!;
    this.salesperson.limitDiscount = value.limitDiscount!;
    this.salesperson.groupId = value.group?.id!;

    console.log('salesperson', this.salesperson);
  }

  private async saveUpdatePerson() { }

  private async getUsers(): Promise<User[]> {
    const result = await this.filterUserEnabled();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      return result.body.data;
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
    return [];
  }

  async onSelectFile() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoPerson.set(photo.base64!);
      this.isNewPhoto = true;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }

  private async saveImage(id: number, name: string, pathImg: string): Promise<string> {
    try {
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/salesperson/` +
        `${id}/${name}`;

      const { base64, mime } = this.cleanBase64(pathImg);
      const file = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('local', path);

      const resultSave = await this.saveImageSalesperson(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
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

  private async listAllGroups(): Promise<SalespersonGroup[]> {
    try {
      return await lastValueFrom(this.salespersonGroupService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async filterUserEnabled(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async saveImageSalesperson(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.salespersonService.saveImage(data));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAll(): Promise<Salesperson[]> {
    try {
      return await lastValueFrom(this.salespersonService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }


}
