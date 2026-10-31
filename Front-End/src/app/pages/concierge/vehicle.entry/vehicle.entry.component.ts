import { Component, DoCheck, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

//PrimeNg
import { StepperModule } from 'primeng/stepper';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ImageModule } from 'primeng/image';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';

import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { User } from '@/app/models/user';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';
import { VehicleModel } from '@/app/models/vehicle.model';
import { IColor } from '@/app/interfaces/i.color';
import { StorageService } from '@/app/services/storage/storage.service';
import { UserService } from '@/app/services/user/user.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { FilterDriverComponent } from '@/app/components/filter.driver/filter.driver.component';
import { ModuleConciergeService } from '@/app/services/module/module.concierge.service';
import { ModuleConciergeVehicleChecklist } from '@/app/models/module.concierge.vehicle.checklist';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { LoadingService } from '@/app/services/loading/loading.service';

interface IUpdateImage {
    vehicleId?: number;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
}

@Component({
    selector: 'app-vehicle-entry',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DividerModule,
        FilterClientComponent,
        FilterDriverComponent,
        StepperModule,
        ImageModule,
        ToastModule,
        CheckboxModule,
        TagModule,
        DialogModule,
        SelectModule,
        TabsModule,
        TableModule,
        IconFieldModule,
        InputIconModule,
        CardModule,
        InputNumberModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        DatePickerModule,
        RadioButtonModule,
        InputGroupModule,
        InputMaskModule
    ],
    providers: [MessageService],
    templateUrl: './vehicle.entry.component.html',
    styleUrl: './vehicle.entry.component.scss'
})
export default class VehicleEntryComponent implements OnInit, DoCheck {
    readonly loading = signal(false);
    readonly loadError = signal('');
    readonly adding = signal(false);
    readonly saving = signal(false);
    private photoVersion = 0;
    private vehicleEntry: VehicleEntry = new VehicleEntry();
    private vehiclePlateTogether: string = '';
    activeStepper: number = 1;
    private upperCasePipe = new UpperCasePipe();
    //ClientCompany
    selectClientCompany = signal<ClientCompany>(new ClientCompany());
    clientCompany!: ClientCompany;
    formClientCompany = new FormGroup({
        clientCompanyNot: new FormControl<boolean>(false, { nonNullable: true }),
        clientCompanyId: new FormControl<number | null>({ value: null, disabled: true }),
        clientCompanyName: new FormControl<string>({ value: '', disabled: true }),
        clientCompanyCnpj: new FormControl<string>({ value: '', disabled: true }),
        clientCompanyCpf: new FormControl<string>({ value: '', disabled: true }),
        clientCompanyRg: new FormControl<string | null>({ value: null, disabled: true })
    });
    //Driver
    driverEntryPhoto!: string;
    driverEntryPhotoDoc1!: string;
    driverEntryPhotoDoc2!: string;
    driver!: Driver;
    selectDriver = signal<Driver>(new Driver());
    formDriver = new FormGroup({
        driverEntryId: new FormControl<number | null>({ value: null, disabled: true }),
        driverEntryName: new FormControl<string>({ value: '', disabled: true }),
        driverEntryCpf: new FormControl<string>({ value: '', disabled: true }),
        driverEntryRg: new FormControl<string | null>({ value: null, disabled: true })
    });
    //Vehicle
    colors: IColor[] = [];
    isSavePhoto = signal<boolean>(false);
    photoVehicle1 = signal<string>('');
    photoVehicle2 = signal<string>('');
    photoVehicle3 = signal<string>('');
    photoVehicle4 = signal<string>('');
    vehicleModels = signal<VehicleModel[]>([]);
    yes = YesNotEnum.YES;
    not = YesNotEnum.NOT;

    formVehicle = new FormGroup({
        vehiclePlate: new FormControl<string>(''),
        vehicleFleet: new FormControl<string>(''),
        vehicleKmEntry: new FormControl<number | null>(null),
        modelVehicle: new FormControl<VehicleModel | null>(null, Validators.required),
        entryDate: new FormControl<Date | null>(new Date(), Validators.required),
        exitDatePrevision: new FormControl<Date | null>(null),
        vehicleColor: new FormControl<IColor | null>(null),
        attendant: new FormControl<User | null>(null),
        vehicleNew: new FormControl<YesNotEnum>(YesNotEnum.NOT),
        vehicleServiceOrder: new FormControl<YesNotEnum>(YesNotEnum.YES),
        entryInformation: new FormControl<string>(''),
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
    attendants = signal<User[]>([]);
    formCompanyIsEditable = false;

    modChecklist: ModuleConciergeVehicleChecklist = new ModuleConciergeVehicleChecklist();
    listChecklist: VehicleEntryChecklist[] = [];
    vehicleEntryChecklist!: VehicleEntryChecklist;

    //Dialog Vehicle entry
    dialogVehicleVisible: boolean = false;
    listVehicleEntry: VehicleEntry[] = [];
    constructor(
        private loadingService: LoadingService,
        private permissionUserService: PermissionUserService,
        private storageService: StorageService,
        private vehicleModelService: VehicleModelService,
        private vehicleService: VehicleEntryService,
        private userService: UserService,
        private messageService: MessageService,
        private photoService: PhotoService,
        private modService: ModuleConciergeService
    ) {}

    ngOnInit(): void {
        this.colors = [{ color: 'Branco' }, { color: 'Preto' }, { color: 'Azul' }, { color: 'Verde' }, { color: 'Cinza' }, { color: 'Vermelho' }, { color: 'Amarelo' }, { color: 'Rosa' }, { color: 'Roxo' }, { color: 'Outro' }];
        this.addRequirePlaca();
        //Consulta os Attendants
        this.loadOptions();
    }

    ngDoCheck(): void {
        if (this.saving() || this.adding()) return;
        //Client
        if (this.selectClientCompany().id != null) {
            this.clientCompany = this.selectClientCompany();
            this.formClientCompany.patchValue({
                clientCompanyNot: false,
                clientCompanyId: this.selectClientCompany().id,
                clientCompanyName: this.selectClientCompany().name,
                clientCompanyCnpj: this.selectClientCompany().cnpj,
                clientCompanyCpf: this.selectClientCompany().cpf,
                clientCompanyRg: this.selectClientCompany().rg == '' ? null : this.selectClientCompany().rg
            });
            this.selectClientCompany.set(new ClientCompany());
        }
        //Driver
        if (this.selectDriver().id != null) {
            this.formDriver.patchValue({
                driverEntryId: this.selectDriver().id,
                driverEntryName: this.selectDriver().name,
                driverEntryCpf: this.selectDriver().cpf,
                driverEntryRg: this.selectDriver().rg
            });
            this.driver = this.selectDriver();
            this.driverEntryPhoto = this.selectDriver().photoDriverUrl;
            this.driverEntryPhotoDoc1 = this.selectDriver().photoDoc1Url;
            this.driverEntryPhotoDoc2 = this.selectDriver().photoDoc2Url;
            this.selectDriver.set(new Driver());
        }
    }

    //ClientCompany
    public validationClientCompany() {
        this.cleanFormClientCompany();
        this.clientCompany = this.formClientCompany.controls.clientCompanyNot.value ? new ClientCompany() : null!;
    }
    private cleanFormClientCompany() {
        this.formClientCompany.patchValue({
            clientCompanyId: null,
            clientCompanyName: '',
            clientCompanyCnpj: '',
            clientCompanyCpf: '',
            clientCompanyRg: null
        });
    }
    public async nextStepperClientCompany() {
        if (this.clientCompany != null) {
            //Aba motorista
            this.activeStepper = 2;
        } else {
            this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Empresa não selecionada', icon: 'pi pi-info-circle' });
        }
    }
    public stepperClientCompany() {
        //Aba empresa
        this.activeStepper = 1;
    }

    //Driver
    public nextSterpperDriver() {
        if (this.clientCompany != null && this.driver != null) {
            //Aba veículo
            this.activeStepper = 3;
        } else {
            this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Motorista não informado', icon: 'pi pi-info-circle' });
        }
    }
    public stepperDriver() {
        if (this.clientCompany != null) {
            //Aba motorista
            this.activeStepper = 2;
        } else {
            this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Empresa não selecionada', icon: 'pi pi-info-circle' });
        }
    }
    private cleanFormDriver() {
        this.formDriver.reset();
        this.formDriver.patchValue({
            driverEntryName: '',
            driverEntryCpf: '',
            driverEntryRg: null
        });
        this.driverEntryPhoto = '';
        this.driverEntryPhotoDoc1 = '';
        this.driverEntryPhotoDoc2 = '';
    }
    //Vehicle
    applyDateTimeMask(event: any) {
        let value = event.target.value.replace(/\D/g, '');

        if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d)/, '$1/$2');
        }

        if (value.length > 5) {
            value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
        }

        if (value.length > 10) {
            value = value.replace(/^(\d{2})\/(\d{2})\/(\d{4})(\d)/, '$1/$2/$3 $4');
        }

        if (value.length > 12) {
            value = value.replace(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2})(\d)/, '$1/$2/$3 $4:$5');
        }
        event.target.value = value;
    }
    async loadOptions(): Promise<void> {
        this.loading.set(true);
        this.loadError.set('');
        try {
            await Promise.all([this.getAttendants(), this.getChecklist(), this.getModelVehicles()]);
        } catch {
            this.loadError.set('Não foi possível carregar os dados da entrada. Tente novamente.');
        } finally {
            this.loading.set(false);
        }
    }
    private async getAttendants() {
        const result = await this.filterUserRoleId();
        if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) throw new Error('getAttendants');
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
            this.attendants.set(result.body.data);
        }
    }
    private async getChecklist() {
        const result = await this.filterModeluChecklist();
        if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) throw new Error('getChecklist');
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
            this.modChecklist = result.body.data;
        }
    }

    private async getModelVehicles() {
        this.vehicleModels.set(await this.modelVehicles());
    }
    public stepperVehicle() {
        if (this.clientCompany != null) {
            if (this.driver != null) {
                //Aba veículo
                this.activeStepper = 3;
            } else {
                this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Motorista não informado', icon: 'pi pi-info-circle' });
            }
        } else {
            this.messageService.add({ severity: 'info', summary: 'Atenção', detail: 'Empresa não selecionada', icon: 'pi pi-info-circle' });
        }
    }

    public async photoFile1Vehicle() {
        if (this.saving() || this.adding()) return;
        const version = this.photoVersion;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (version !== this.photoVersion || this.saving() || this.adding()) return;
        if (photo.status == StatusPhotoResult.SUCCESS) {
            this.photoVehicle1.set(photo.base64!);
        }
        if (photo.status == StatusPhotoResult.LIMIT) {
            this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
        }
        if (photo.status == StatusPhotoResult.ERROR) {
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
        }
    }
    public async photoFile2Vehicle() {
        if (this.saving() || this.adding()) return;
        const version = this.photoVersion;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (version !== this.photoVersion || this.saving() || this.adding()) return;
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
        if (this.saving() || this.adding()) return;
        const version = this.photoVersion;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (version !== this.photoVersion || this.saving() || this.adding()) return;
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
        if (this.saving() || this.adding()) return;
        const version = this.photoVersion;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (version !== this.photoVersion || this.saving() || this.adding()) return;
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
        if (this.saving() || this.adding()) return;
        this.photoVehicle1.set('');
    }
    public deleteFileVehicle2() {
        if (this.saving() || this.adding()) return;
        this.photoVehicle2.set('');
    }
    public deleteFileVehicle3() {
        if (this.saving() || this.adding()) return;
        this.photoVehicle3.set('');
    }
    public deleteFileVehicle4() {
        if (this.saving() || this.adding()) return;
        this.photoVehicle4.set('');
    }
    public addRequirePlaca() {
        this.formVehicle.controls['vehiclePlate'].addValidators(Validators.required);
        this.formVehicle.controls['vehiclePlate'].updateValueAndValidity();
    }
    public deleteRequirePlaca() {
        this.formVehicle.controls['vehiclePlate'].removeValidators(Validators.required);
        this.formVehicle.controls['vehiclePlate'].updateValueAndValidity();
        this.cleanPlaca();
    }
    private cleanPlaca() {
        this.formVehicle.get('vehiclePlate')?.setValue('');
    }
    private cleanFormVehicle() {
        ++this.photoVersion;
        this.formVehicle.markAsUntouched();
        this.formVehicle.patchValue({
            vehiclePlate: '',
            vehicleKmEntry: null,
            vehicleFleet: null,
            modelVehicle: null,
            entryDate: new Date(),
            exitDatePrevision: null,
            vehicleColor: null,
            vehicleNew: YesNotEnum.NOT,
            vehicleServiceOrder: YesNotEnum.YES,
            attendant: null,
            entryInformation: '',
            checklist1Desc: '',
            checklist2Desc: '',
            checklist3Desc: '',
            checklist4Desc: '',
            checklist5Desc: '',
            checklist6Desc: '',
            checklist7Desc: '',
            checklist8Desc: '',
            checklist9Desc: '',
            checklist10Desc: '',
            checklist11Desc: '',
            checklist12Desc: '',
            checklist13Desc: '',
            checklist14Desc: '',
            checklist15Desc: '',
            checklist16Desc: '',
            checklist17Desc: '',
            checklist18Desc: '',
            checklist19Desc: '',
            checklist20Desc: ''
        });
        this.photoVehicle1.set('');
        this.photoVehicle2.set('');
        this.photoVehicle3.set('');
        this.photoVehicle4.set('');

        this.addRequirePlaca();
    }
    //Dialog Vehicle entry
    public showDialogVehicle() {
        this.dialogVehicleVisible = true;
    }
    //adicionar o veículo a lista de entrada
    public async addVehicleEntry(): Promise<void> {
        if (this.adding() || this.saving() || this.loading() || this.loadError()) return;
        if (this.listVehicleEntry.some((vehicle) => vehicle.id != null)) {
            this.messageService.add({ severity: 'info', summary: 'Entrada pendente', detail: 'Finalize as fotos da entrada já registrada antes de adicionar outro veículo.' });
            return;
        }
        this.formVehicle.markAllAsTouched();
        if (!this.clientCompany || !this.driver) {
            this.messageService.add({ severity: 'info', summary: 'Entrada', detail: 'Selecione o proprietário e o motorista antes de adicionar o veículo.' });
            return;
        }
        const value = this.formVehicle.getRawValue();
        if (this.formVehicle.invalid) return;
        if (!value.entryDate || Number.isNaN(value.entryDate.getTime()) || value.entryDate > new Date() || (value.exitDatePrevision && (Number.isNaN(value.exitDatePrevision.getTime()) || value.exitDatePrevision < value.entryDate))) {
            this.messageService.add({ severity: 'error', summary: 'Datas do atendimento', detail: 'Informe uma entrada válida e uma previsão de saída igual ou posterior à entrada.' });
            return;
        }
        if (value.vehicleKmEntry != null && value.vehicleKmEntry < 0) {
            this.messageService.add({ severity: 'error', summary: 'Quilometragem', detail: 'A quilometragem não pode ser negativa.' });
            return;
        }
        this.adding.set(true);
        try {
            if (value.vehicleNew === YesNotEnum.NOT) {
                const plate = (value.vehiclePlate ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase();
                if (!plate || this.listVehicleEntry.some((v) => v.vehicleNew !== YesNotEnum.YES && v.vehiclePlate.replace(/[^a-z0-9]/gi, '').toUpperCase() === plate)) {
                    this.messageService.add({ severity: 'info', summary: 'Placa', detail: 'Informe uma placa que ainda não foi adicionada à lista.' });
                    return;
                }
                const result = await this.filterFreeAdmission(plate);
                if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) {
                    this.messageService.add({ severity: 'error', summary: 'Entrada do veículo', detail: result.body?.message || 'Não foi possível verificar a placa. Tente novamente.' });
                    return;
                }
                this.formVehicle.controls.vehiclePlate.setValue(plate);
            }
            this.loadVehicleEntry({ ...value, vehiclePlate: value.vehicleNew === YesNotEnum.YES ? '' : (value.vehiclePlate ?? '').replace(/[^a-z0-9]/gi, '').toUpperCase() });
        } finally {
            this.adding.set(false);
        }
    }
    public deleteVehicleEntry(index: number) {
        if (this.saving() || this.listVehicleEntry[index]?.id != null) return;
        var listTemp: any[] = [];
        for (let i = 0; i < this.listVehicleEntry.length; i++) {
            const element = this.listVehicleEntry[i];
            if (i != index) {
                listTemp.push(element);
            }
        }
        this.listVehicleEntry = [];
        for (let vehicle of listTemp) {
            this.listVehicleEntry.push(vehicle);
        }
        //Checklist
        var listTemp1: any[] = [];
        for (let b = 0; b < this.listChecklist.length; b++) {
            const element = this.listChecklist[b];
            if (b != index) {
                listTemp1.push(element);
            }
        }
        this.listChecklist = [];
        for (let ch of listTemp1) {
            this.listChecklist.push(ch);
        }
        if (this.listVehicleEntry.length == 0) {
            this.dialogVehicleVisible = false;
        }
    }
    formatDateTime(date: Date): string {
        const datePipe = new DatePipe('en-US');

        // Obtém o fuso horário local no formato ±hh:mm
        const tzOffset = -date.getTimezoneOffset();
        const sign = tzOffset >= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(tzOffset) / 60)
            .toString()
            .padStart(2, '0');
        const minutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
        const timezone = `${sign}${hours}:${minutes}`;

        // Formata a data e adiciona o fuso horário
        return datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") + timezone;
    }
    //save
    private loadVehicleEntry(vehicleValue = this.formVehicle.getRawValue()) {
        this.vehicleEntry.companyId = this.storageService.companyId;
        this.vehicleEntry.resaleId = this.storageService.resaleId;
        this.vehicleEntry.entryUserId = this.storageService.id;
        this.vehicleEntry.entryUserName = this.storageService.name;
        this.vehicleEntry.entryDate = this.formatDateTime(vehicleValue.entryDate!);

        this.vehicleEntry.entryPhoto1Url = this.photoVehicle1();
        this.vehicleEntry.entryPhoto2Url = this.photoVehicle2();
        this.vehicleEntry.entryPhoto3Url = this.photoVehicle3();
        this.vehicleEntry.entryPhoto4Url = this.photoVehicle4();

        this.vehicleEntry.exitDatePrevision = vehicleValue.exitDatePrevision == null ? '' : this.formatDateTime(vehicleValue.exitDatePrevision);
        this.vehicleEntry.entryInformation = vehicleValue?.entryInformation ?? '';
        if (!this.formClientCompany.controls.clientCompanyNot.value) {
            this.vehicleEntry.clientCompanyId = this.clientCompany.id;
            this.vehicleEntry.clientCompanyName = this.clientCompany.name;
        }
        this.vehicleEntry.driverEntryId = this.driver.id;
        this.vehicleEntry.driverEntryName = this.driver.name;
        this.vehicleEntry.attendantUserId = vehicleValue.attendant?.id ?? null;
        this.vehicleEntry.attendantUserName = vehicleValue.attendant?.name ?? '';
        this.vehicleEntry.modelId = vehicleValue.modelVehicle!.id;
        this.vehicleEntry.modelDescription = vehicleValue.modelVehicle!.description;
        this.vehicleEntry.vehiclePlate = vehicleValue?.vehiclePlate ?? '';
        this.vehicleEntry.vehicleFleet = vehicleValue.vehicleFleet != null ? vehicleValue.vehicleFleet : '';
        this.vehicleEntry.vehicleNew = vehicleValue.vehicleNew!;
        this.vehicleEntry.vehicleServiceOrder = vehicleValue.vehicleServiceOrder!;
        this.vehicleEntry.vehicleColor = vehicleValue.vehicleColor?.color ?? null;
        this.vehicleEntry.vehicleKmEntry = vehicleValue.vehicleKmEntry != null ? vehicleValue.vehicleKmEntry.toString() : '';
        /* Checklist */
        const checklist: VehicleEntryChecklist = new VehicleEntryChecklist();
        checklist.companyId = this.vehicleEntry.companyId;
        checklist.resaleId = this.vehicleEntry.resaleId;

        if (this.modChecklist.checklist1Enabled == this.yes) {
            checklist.checklist1Enabled = this.yes;
            checklist.checklist1Label = this.modChecklist.checklist1Desc;
            checklist.checklist1Desc = vehicleValue.checklist1Desc!;
        }
        if (this.modChecklist.checklist2Enabled == this.yes) {
            checklist.checklist2Enabled = this.yes;
            checklist.checklist2Label = this.modChecklist.checklist2Desc;
            checklist.checklist2Desc = vehicleValue.checklist2Desc!;
        }
        if (this.modChecklist.checklist3Enabled == this.yes) {
            checklist.checklist3Enabled = this.yes;
            checklist.checklist3Label = this.modChecklist.checklist3Desc;
            checklist.checklist3Desc = vehicleValue.checklist3Desc!;
        }
        if (this.modChecklist.checklist4Enabled == this.yes) {
            checklist.checklist4Enabled = this.yes;
            checklist.checklist4Label = this.modChecklist.checklist4Desc;
            checklist.checklist4Desc = vehicleValue.checklist4Desc!;
        }
        if (this.modChecklist.checklist5Enabled == this.yes) {
            checklist.checklist5Enabled = this.yes;
            checklist.checklist5Label = this.modChecklist.checklist5Desc;
            checklist.checklist5Desc = vehicleValue.checklist5Desc!;
        }
        if (this.modChecklist.checklist6Enabled == this.yes) {
            checklist.checklist6Enabled = this.yes;
            checklist.checklist6Label = this.modChecklist.checklist6Desc;
            checklist.checklist6Desc = vehicleValue.checklist6Desc!;
        }
        if (this.modChecklist.checklist7Enabled == this.yes) {
            checklist.checklist7Enabled = this.yes;
            checklist.checklist7Label = this.modChecklist.checklist7Desc;
            checklist.checklist7Desc = vehicleValue.checklist7Desc!;
        }
        if (this.modChecklist.checklist8Enabled == this.yes) {
            checklist.checklist8Enabled = this.yes;
            checklist.checklist8Label = this.modChecklist.checklist8Desc;
            checklist.checklist8Desc = vehicleValue.checklist8Desc!;
        }
        if (this.modChecklist.checklist9Enabled == this.yes) {
            checklist.checklist9Enabled = this.yes;
            checklist.checklist9Label = this.modChecklist.checklist9Desc;
            checklist.checklist9Desc = vehicleValue.checklist9Desc!;
        }
        if (this.modChecklist.checklist10Enabled == this.yes) {
            checklist.checklist10Enabled = this.yes;
            checklist.checklist10Label = this.modChecklist.checklist10Desc;
            checklist.checklist10Desc = vehicleValue.checklist10Desc!;
        }
        if (this.modChecklist.checklist11Enabled == this.yes) {
            checklist.checklist11Enabled = this.yes;
            checklist.checklist11Label = this.modChecklist.checklist11Desc;
            checklist.checklist11Desc = vehicleValue.checklist11Desc!;
        }
        if (this.modChecklist.checklist12Enabled == this.yes) {
            checklist.checklist12Enabled = this.yes;
            checklist.checklist12Label = this.modChecklist.checklist12Desc;
            checklist.checklist12Desc = vehicleValue.checklist12Desc!;
        }
        if (this.modChecklist.checklist13Enabled == this.yes) {
            checklist.checklist13Enabled = this.yes;
            checklist.checklist13Label = this.modChecklist.checklist13Desc;
            checklist.checklist13Desc = vehicleValue.checklist13Desc!;
        }
        if (this.modChecklist.checklist14Enabled == this.yes) {
            checklist.checklist14Enabled = this.yes;
            checklist.checklist14Label = this.modChecklist.checklist14Desc;
            checklist.checklist14Desc = vehicleValue.checklist14Desc!;
        }
        if (this.modChecklist.checklist15Enabled == this.yes) {
            checklist.checklist15Enabled = this.yes;
            checklist.checklist15Label = this.modChecklist.checklist15Desc;
            checklist.checklist15Desc = vehicleValue.checklist15Desc!;
        }
        if (this.modChecklist.checklist16Enabled == this.yes) {
            checklist.checklist16Enabled = this.yes;
            checklist.checklist16Label = this.modChecklist.checklist16Desc;
            checklist.checklist16Desc = vehicleValue.checklist16Desc!;
        }
        if (this.modChecklist.checklist17Enabled == this.yes) {
            checklist.checklist17Enabled = this.yes;
            checklist.checklist17Label = this.modChecklist.checklist17Desc;
            checklist.checklist17Desc = vehicleValue.checklist17Desc!;
        }
        if (this.modChecklist.checklist18Enabled == this.yes) {
            checklist.checklist18Enabled = this.yes;
            checklist.checklist18Label = this.modChecklist.checklist18Desc;
            checklist.checklist18Desc = vehicleValue.checklist18Desc!;
        }
        if (this.modChecklist.checklist19Enabled == this.yes) {
            checklist.checklist19Enabled = this.yes;
            checklist.checklist19Label = this.modChecklist.checklist19Desc;
            checklist.checklist19Desc = vehicleValue.checklist19Desc!;
        }
        if (this.modChecklist.checklist20Enabled == this.yes) {
            checklist.checklist20Enabled = this.yes;
            checklist.checklist20Label = this.modChecklist.checklist20Desc;
            checklist.checklist20Desc = vehicleValue.checklist20Desc!;
        }
        //Add list of checklist
        this.listChecklist.push(checklist);
        //Add list of vehicle
        this.listVehicleEntry.push(this.vehicleEntry);
        this.vehicleEntry = new VehicleEntry();
        this.messageService.add({ severity: 'success', summary: 'Veículo adicionado', detail: this.listVehicleEntry.at(-1)?.modelDescription, icon: 'pi pi-car' });
        this.cleanFormVehicle();
        this.scrollTop();
    }
    scrollTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    firstSecondaryName(name: string): string {
        var nameArr = name.split(' ');
        if (nameArr.length == 1) {
            name = nameArr[0];
        }
        if (nameArr.length >= 2) {
            name = nameArr[0] + ' ' + nameArr[1];
        }
        return name;
    }
    private generateSecureId(): string {
        const timestamp = Date.now();
        const array = new Uint8Array(6);
        crypto.getRandomValues(array);

        const random = Array.from(array, (b) => (b % 36).toString(36)).join('');

        return `${timestamp}_${random}`;
    }

    private async validPermission(): Promise<boolean> {
        /* PERMISSION - 108 */
        /* ENTRADA DE VEÍCULO */
        const result = await this.searchPermission(108);
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
            return true;
        } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
        }
        return false;
    }

    private async searchPermission(permission: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.permissionUserService.filterPermission(this.storageService.companyId, this.storageService.resaleId, this.storageService.id, permission));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }

    public async save(): Promise<void> {
        if (this.saving() || this.adding() || !this.listVehicleEntry.length) return;
        this.saving.set(true);
        try {
            if (!(await this.validPermission())) return;
            this.loadingService.show();
            if (this.listVehicleEntry.length > 1 && !this.vehiclePlateTogether) this.vehiclePlateTogether = this.generateSecureId();
            while (this.listVehicleEntry.length) {
                const vehicle = this.listVehicleEntry[0];
                vehicle.vehiclePlateTogether = this.vehiclePlateTogether;
                if (vehicle.checklistId == null) {
                    const checklist = await this.saveChecklist(this.listChecklist[0]);
                    if (checklist.status !== 201 || checklist.body?.status !== StatusSuccessError.succes || checklist.body.data?.id == null) throw new Error(checklist.body?.message || 'Não foi possível salvar o checklist. Tente novamente.');
                    vehicle.checklistId = checklist.body.data.id;
                }
                if (vehicle.id == null) {
                    const payload = Object.assign(new VehicleEntry(), vehicle, { entryPhoto1Url: '', entryPhoto2Url: '', entryPhoto3Url: '', entryPhoto4Url: '' });
                    const result = await this.saveVehicle(payload);
                    if (result.status !== 201 || result.body?.status !== StatusSuccessError.succes || result.body.data?.id == null) throw new Error(result.body?.message || 'Não foi possível registrar a entrada. Tente novamente.');
                    vehicle.id = result.body.data.id;
                }
                for (const index of [1, 2, 3, 4] as const) {
                    const key = `entryPhoto${index}Url` as const;
                    if (vehicle[key] && !/^https?:\/\//i.test(vehicle[key])) {
                        const url = await this.savePhoto(vehicle.id!, vehicle[key], index);
                        if (!url) throw new Error('Entrada registrada. A foto ' + index + ' não foi salva. Clique em Finalizar novamente para tentar concluir as fotos.');
                        vehicle[key] = url;
                    }
                }
                if ([vehicle.entryPhoto1Url, vehicle.entryPhoto2Url, vehicle.entryPhoto3Url, vehicle.entryPhoto4Url].some(Boolean)) {
                    await this.updateImage({ vehicleId: vehicle.id!, image1: vehicle.entryPhoto1Url, image2: vehicle.entryPhoto2Url, image3: vehicle.entryPhoto3Url, image4: vehicle.entryPhoto4Url });
                }
                this.messageService.add({ severity: 'success', summary: vehicle.modelDescription, detail: 'Entrada registrada com sucesso.' });
                this.listVehicleEntry = this.listVehicleEntry.slice(1);
                this.listChecklist = this.listChecklist.slice(1);
            }
            this.dialogVehicleVisible = false;
            this.vehiclePlateTogether = '';
            this.cleanFormDriver();
            this.driver = null!;
            this.cleanFormClientCompany();
            this.clientCompany = null!;
            this.formClientCompany.controls.clientCompanyNot.setValue(false);
            this.cleanFormVehicle();
            this.stepperClientCompany();
        } catch (error: unknown) {
            this.messageService.add({ severity: 'error', summary: 'Finalizar entrada', detail: error instanceof Error ? error.message : 'Não foi possível concluir. Os itens pendentes foram mantidos para tentar novamente.' });
        } finally {
            this.loadingService.hide();
            this.saving.set(false);
        }
    }

    private async savePhoto(id: number, img: string, order: number): Promise<string> {
        if (img == '') {
            return '';
        }
        try {
            let path = `${this.storageService.companyId}/` + `${this.storageService.resaleId}/concierge/vehicle/` + `${id}/entry/image${order}.jpg`;
            const { base64, mime } = this.cleanBase64(img);
            const file = this.base64ToFile(base64, mime);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('local', path);
            const resultSave = await this.saveImage(formData);
            if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
                return `${environment.apiuUrl}${resultSave.body.data['url']}`;
            }
        } catch (error) {
            return '';
        }
        return '';
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
    private async saveVehicle(vehicle: VehicleEntry): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entrySave(vehicle));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async updateImage(imgUpdate: IUpdateImage): Promise<void> {
        await lastValueFrom(this.vehicleService.updateImage(imgUpdate));
    }
    private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.saveImage(data));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterFreeAdmission(plate: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.filterFreeAdmission(plate));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterUserRoleId(): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.userService.filterRoleId(2));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterModeluChecklist(): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.modService.filterCompanyResale());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async saveChecklist(ch: VehicleEntryChecklist): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.saveChecklist(ch));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }

    private async modelVehicles(): Promise<VehicleModel[]> {
        try {
            return await lastValueFrom(this.vehicleModelService.getAllEnabled());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            throw error;
        }
    }
}
