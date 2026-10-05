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
import { SalespersonTypeEnum } from '@/app/models/crm/salesperson.type.enum';
import { SalespersonGroupService } from '@/app/services/salesperson/salesperson.group.service';
import { SalespersonGroup } from '@/app/models/salesperson/salesperson.group';


@Component({
  selector: 'app-salesperson',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, ToastModule, CheckboxModule, RadioButtonModule,InputMaskModule,MultiSelectModule,
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

  PART = SalespersonTypeEnum.PART;
  SERVICE = SalespersonTypeEnum.SERVICE;
  VEHICLE = SalespersonTypeEnum.VEHICLE;

  salespersons = signal<Salesperson[]>([]);
  visible: boolean = false;

  formPerson = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    typeSalesPart: new FormControl<SalespersonTypeEnum | null>(null),
    typeSalesService: new FormControl<SalespersonTypeEnum | null>(null),
    typeSalesVehicle: new FormControl<SalespersonTypeEnum | null>(null),
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
    private userService: UserService,
    private photoService: PhotoService,
    private salespersonGroupService: SalespersonGroupService) { this.init(); }

  private async init() {
    //users
    this.attendantsUser.set(await this.getUsers());
    //groups
    this.groups.set(await this.listAllGroups());
  }

  private showDialog() {
    this.visible = true;
  }

  hideDialog() {
    this.visible = false;
  }

  cleanForm() {

  }

  newSalesperson() {
    this.isNewSalesperson = true;
    this.salesperson = new Salesperson();
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

  private async saveNewPerson() { }

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

  private async filterUserEnabled(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
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

  private async listAllGroups(): Promise<SalespersonGroup[]> {
      try {
        return await lastValueFrom(this.salespersonGroupService.listAllEnabled());
      } catch (error: any) {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
        return [];
      }
    }


}
