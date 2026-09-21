import { YesNotEnum } from '@/app/models/yes.not.enum';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { TabsModule } from 'primeng/tabs';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupModule } from 'primeng/inputgroup';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { StepperModule } from 'primeng/stepper';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { CommonModule, DatePipe } from '@angular/common';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { ShareWhatsappService } from '@/app/services/share/share.whatsapp.service';

@Component({
  selector: 'app-vehicle-details',
  imports: [CommonModule, TagModule,
    TabsModule, IconFieldModule, SelectModule,
    CheckboxModule, StepperModule, ConfirmDialogModule, InputIconModule, ImageModule,
    DialogModule, ToastModule, TableModule, ReactiveFormsModule,
    TextareaModule, InputNumberModule, InputTextModule,
    ButtonModule, InputMaskModule, MultiSelectModule,
    InputGroupModule, RadioButtonModule, DatePickerModule],
  templateUrl: './vehicle.details.component.html',
  styleUrl: './vehicle.details.component.scss',
})
export class VehicleDetailsComponent {
  vehicleEntry!: VehicleEntry;
  yes = YesNotEnum.YES;
  not = YesNotEnum.NOT;
  public dateExitAuth1 = signal<string>('');
  public dateExitAuth2 = signal<string>('');
  modChecklist: VehicleEntryChecklist = new VehicleEntryChecklist();
  photoVehicle1 = signal<string>('');
  photoVehicle2 = signal<string>('');
  photoVehicle3 = signal<string>('');
  photoVehicle4 = signal<string>('');

  formVehicle = new FormGroup({
    id: new FormControl<number>({ value: 0, disabled: true }),
    vehiclePlate: new FormControl<string>(''),
    vehicleFleet: new FormControl<string>(''),
    vehicleColor: new FormControl<string>(''),
    kmEntry: new FormControl<string>(''),
    kmExit: new FormControl<string>(''),
    modelVehicle: new FormControl<string>(''),
    entryDate: new FormControl<string>(''),
    exitDate: new FormControl<string>(''),
    exitDatePrevision: new FormControl<string>(''),
    nameUserExitAuth1: new FormControl<string>(''),
    nameUserExitAuth2: new FormControl<string>(''),
    attendant: new FormControl<string>(''),
    vehicleNew: new FormControl<string>(YesNotEnum.NOT),
    vehicleServiceOrder: new FormControl<string>(YesNotEnum.YES),
    numServiceOrder: new FormControl<string>(''),
    numNfe: new FormControl<string>(''),
    numNfse: new FormControl<string>(''),
    information: new FormControl<string>(''),

    checklist1Desc: new FormControl<string>(''),
    checklist2Desc: new FormControl<string>(''),
    checklist3Desc: new FormControl<string>(''),
    checklist4Desc: new FormControl<string>(''),
    checklist5Desc: new FormControl<string>(''),
    checklist6Desc: new FormControl<string>(''),
    checklist7Desc: new FormControl<string>(''),
    checklist8Desc: new FormControl<string>(''),
    checklist9Desc: new FormControl<string>(''),
    checklist10Desc: new FormControl<string>(''),
    checklist11Desc: new FormControl<string>(''),
    checklist12Desc: new FormControl<string>(''),
    checklist13Desc: new FormControl<string>(''),
    checklist14Desc: new FormControl<string>(''),
    checklist15Desc: new FormControl<string>(''),
    checklist16Desc: new FormControl<string>(''),
    checklist17Desc: new FormControl<string>(''),
    checklist18Desc: new FormControl<string>(''),
    checklist19Desc: new FormControl<string>(''),
    checklist20Desc: new FormControl<string>('')
  });
  //Concierge form
  formConcierge = new FormGroup({
    entryId: new FormControl<number | null>({ value: null, disabled: true }),
    entryName: new FormControl<string>(''),
    entryInf: new FormControl<string>(''),
    exitId: new FormControl<number | null>({ value: null, disabled: true }),
    exitName: new FormControl<string>(''),
    exitInformation: new FormControl<string>(''),
  });

  entryPhoto1!: string;
  entryPhoto2!: string;
  entryPhoto3!: string;
  entryPhoto4!: string;
  exitPhoto1!: string;
  exitPhoto2!: string;
  exitPhoto3!: string;
  exitPhoto4!: string;

  formClientCompany = new FormGroup({
    clientCompanyNot: new FormControl<string[]>([]),
    clientCompanyId: new FormControl<number | null>({ value: null, disabled: true }),
    clientCompanyName: new FormControl<string>(''),
    clientCompanyCnpj: new FormControl<string>(''),
    clientCompanyCpf: new FormControl<string>(''),
    clientCompanyRg: new FormControl<string | null>(null),
  });

  formDriver = new FormGroup({
    driverEntryId: new FormControl<number | null>({ value: null, disabled: true }),
    driverEntryName: new FormControl<string>({ value: '', disabled: true }),
    driverEntryCpf: new FormControl<string>({ value: '', disabled: true }),
    driverEntryRg: new FormControl<string | null>({ value: null, disabled: true }),
    driverExitId: new FormControl<number | null>({ value: null, disabled: true }),
    driverExitName: new FormControl<string>({ value: '', disabled: true }),
    driverExitCpf: new FormControl<string>({ value: '', disabled: true }),
    driverExitRg: new FormControl<string | null>({ value: null, disabled: true }),
  });

  driverEntryPhoto!: string;
  driverEntryPhotoDoc1!: string;
  driverEntryPhotoDoc2!: string;
  driverExitPhoto!: string;
  driverExitPhotoDoc1!: string;
  driverExitPhotoDoc2!: string;

  constructor(private shareVehicleService: ShareWhatsappService) { }

  showDetailsVehicle(vehicle: VehicleEntry, clientCompany: ClientCompany, driverEntry: Driver, driverExit: Driver, checklist: VehicleEntryChecklist) {
    this.vehicleEntry = vehicle;
    const datePipe = new DatePipe('en-US');
    this.formVehicle.patchValue({
      id: vehicle.id,
      vehiclePlate: vehicle.vehiclePlate,
      vehicleFleet: vehicle.vehicleFleet,
      vehicleColor: vehicle.vehicleColor,
      kmEntry: vehicle.vehicleKmEntry,
      kmExit: vehicle.vehicleKmExit,
      modelVehicle: vehicle.modelDescription,
      entryDate: datePipe.transform(vehicle.entryDate, "dd/MM/yyyy HH:mm"),
      exitDate: vehicle.exitDate != null ? datePipe.transform(vehicle.exitDate, "dd/MM/yyyy HH:mm") : '',
      exitDatePrevision: vehicle.exitDatePrevision != null ? datePipe.transform(vehicle.exitDatePrevision, "dd/MM/yyyy HH:mm") : '',
      nameUserExitAuth1: vehicle.auth1ExitUserName,
      nameUserExitAuth2: vehicle.auth2ExitUserName,
      attendant: vehicle.attendantUserName,
      vehicleNew: vehicle.vehicleNew,
      vehicleServiceOrder: vehicle.vehicleServiceOrder,
      numServiceOrder: vehicle.numServiceOrder,
      numNfe: vehicle.numNfe,
      numNfse: vehicle.numNfse,
      information: vehicle.attendantInformation,
      checklist1Desc: checklist.checklist1Desc,
      checklist2Desc: checklist.checklist2Desc,
      checklist3Desc: checklist.checklist3Desc,
      checklist4Desc: checklist.checklist4Desc,
      checklist5Desc: checklist.checklist5Desc,
      checklist6Desc: checklist.checklist6Desc,
      checklist7Desc: checklist.checklist7Desc,
      checklist8Desc: checklist.checklist8Desc,
      checklist9Desc: checklist.checklist9Desc,
      checklist10Desc: checklist.checklist10Desc,
      checklist11Desc: checklist.checklist11Desc,
      checklist12Desc: checklist.checklist12Desc,
      checklist13Desc: checklist.checklist13Desc,
      checklist14Desc: checklist.checklist14Desc,
      checklist15Desc: checklist.checklist15Desc,
      checklist16Desc: checklist.checklist16Desc,
      checklist17Desc: checklist.checklist17Desc,
      checklist18Desc: checklist.checklist18Desc,
      checklist19Desc: checklist.checklist19Desc,
      checklist20Desc: checklist.checklist20Desc
    });
    //checklist
    this.modChecklist = checklist;
    this.photoVehicle1.set(vehicle.attendantPhoto1Url);
    this.photoVehicle2.set(vehicle.attendantPhoto2Url);
    this.photoVehicle3.set(vehicle.attendantPhoto3Url);
    this.photoVehicle4.set(vehicle.attendantPhoto4Url);
    //Concierge form
    this.formConcierge.patchValue({
      entryId: vehicle.entryUserId,
      entryName: vehicle.entryUserName,
      entryInf: vehicle.entryInformation,
      exitId: vehicle.exitUserId,
      exitName: vehicle.exitUserName,
      exitInformation: vehicle.exitInformation
    });
    this.entryPhoto1 = vehicle.entryPhoto1Url;
    this.entryPhoto2 = vehicle.entryPhoto2Url;
    this.entryPhoto3 = vehicle.entryPhoto3Url;
    this.entryPhoto4 = vehicle.entryPhoto4Url;
    this.exitPhoto1 = vehicle.exitPhoto1Url;
    this.exitPhoto2 = vehicle.exitPhoto2Url;
    this.exitPhoto3 = vehicle.exitPhoto3Url;
    this.exitPhoto4 = vehicle.exitPhoto4Url;
    //Client company form
    this.formClientCompany.patchValue({
      clientCompanyNot: vehicle.clientCompanyId == null ? [YesNotEnum.NOT] : [],
      clientCompanyId: clientCompany.id,
      clientCompanyName: clientCompany.name,
      clientCompanyCnpj: clientCompany.cnpj,
      clientCompanyCpf: clientCompany.cpf,
      clientCompanyRg: clientCompany.rg != '' ? clientCompany.rg : null
    });
    //Driver form
    this.formDriver.patchValue({
      driverEntryId: driverEntry.id,
      driverEntryName: driverEntry.name,
      driverEntryCpf: driverEntry.cpf,
      driverEntryRg: driverEntry.rg != '' ? driverEntry.rg : null,
      driverExitId: driverExit.id,
      driverExitName: driverExit.name,
      driverExitCpf: driverExit.cpf,
      driverExitRg: driverExit.rg != '' ? driverExit.rg : null
    });
    this.driverEntryPhoto = driverEntry.photoDriverUrl;
    this.driverEntryPhotoDoc1 = driverEntry.photoDoc1Url;
    this.driverEntryPhotoDoc2 = driverEntry.photoDoc2Url;
    this.driverExitPhoto = driverExit.photoDriverUrl;
    this.driverExitPhotoDoc1 = driverExit.photoDoc1Url;
    this.driverExitPhotoDoc2 = driverExit.photoDoc2Url;
  }

  /* Share vehicle data via WhatsApp */
  shareWhatsapp() {
    this.shareVehicleService.shareVehicle(this.vehicleEntry);
  }

}
