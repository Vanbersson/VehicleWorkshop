import { Component, DestroyRef, DoCheck, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Validators, FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
//PrimeNg
import { VehiclePrintService, VehiclePrintData } from '@/app/services/vehicle/vehicle.print.service';
import { TimelineModule } from 'primeng/timeline';
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
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { VehicleEntry } from '@/app/models/vehicle.entry';
import { VehicleModel } from '@/app/models/vehicle.model';
import { Salesperson } from '@/app/models/crm/salesperson';
import { IColor } from '@/app/interfaces/i.color';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { DriverService } from '@/app/services/driver/driver.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { PermissionService } from '@/app/services/permission/permission.service';
import { MessageResponse } from '@/app/models/message-response';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { VehicleEntryAuth } from '@/app/models/vehicle.entry.auth';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';
import { StatusVehicleEnum } from '@/app/models/status.vehicle.enum';
import { StatusVehicleAuthEnum } from '@/app/models/status.vehicle.auth.enum';

import { FilterDriverComponent } from '@/app/components/filter.driver/filter.driver.component';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { BudgetService } from '@/app/services/budget/budget.service';
import { IBudgetNew } from '@/app/interfaces/i.budget.new';
import { IBudget } from '@/app/interfaces/i.budget';
import { ShareWhatsappService } from '@/app/services/share/share.whatsapp.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';

@Component({
    selector: 'app-vehicle-maintenance',
    standalone: true,
    imports: [
        CommonModule,
        FilterClientComponent,
        FilterDriverComponent,
        RouterModule,
        TagModule,
        TimelineModule,
        TabsModule,
        FormsModule,
        IconFieldModule,
        SelectModule,
        CheckboxModule,
        ConfirmDialogModule,
        InputIconModule,
        ImageModule,
        DialogModule,
        ToastModule,
        TableModule,
        ReactiveFormsModule,
        TextareaModule,
        InputNumberModule,
        InputTextModule,
        ButtonModule,
        InputMaskModule,
        MultiSelectModule,
        InputGroupModule,
        RadioButtonModule,
        DatePickerModule
    ],
    templateUrl: './vehicle.maintenance.component.html',
    styleUrl: './vehicle.maintenance.component.scss',
    providers: [ConfirmationService, MessageService]
})
export default class VehicleMaintenanceComponent implements OnInit, DoCheck {
    vehicleEntry!: VehicleEntry;
    private readonly vehiclePrinter = inject(VehiclePrintService);
    readonly printing = signal(false);
    async printVehicle(): Promise<void> {
        if (!this.ready() || this.printing() || this.saving() || this.authorizing()) return;
        this.printing.set(true);
        try {
            if (this.storageService.roleFunc === StatusRoleFuncEnum.USER && !(await this.searchPermission(100))) return;
            const values = this.formVehicle.getRawValue();
            const vehicle = Object.assign(new VehicleEntry(), this.vehicleEntry, {
                vehiclePlate: values.vehiclePlate ?? '',
                vehicleFleet: values.vehicleFleet ?? '',
                vehicleColor: values.vehicleColor?.color ?? null,
                modelId: values.modelVehicle?.id ?? this.vehicleEntry.modelId,
                modelDescription: values.modelVehicle?.description ?? this.vehicleEntry.modelDescription,
                entryDate: values.entryDate ?? this.vehicleEntry.entryDate,
                exitDate: values.exitDate ?? this.vehicleEntry.exitDate,
                exitDatePrevision: values.exitDatePrevision ?? '',
                vehicleKmEntry: values.kmEntry ?? '',
                vehicleKmExit: values.kmExit ?? '',
                salespersonId: values.attendant?.id ?? null,
                salespersonName: values.attendant?.name ?? '',
                vehicleNew: values.vehicleNew ?? this.vehicleEntry.vehicleNew,
                vehicleServiceOrder: values.vehicleServiceOrder ?? this.vehicleEntry.vehicleServiceOrder,
                numServiceOrder: values.numServiceOrder ?? '',
                numNfe: values.numNfe ?? '',
                numNfse: values.numNfse ?? '',
                attendantInformation: values.information ?? '',
                clientCompanyId: this.clientCompany?.id ?? null,
                clientCompanyName: this.clientCompany?.name ?? '',
                driverEntryId: this.driverEntry?.id ?? null,
                driverEntryName: this.driverEntry?.name ?? '',
                driverExitId: this.driverExit?.id ?? null,
                driverExitName: this.driverExit?.name ?? '',
                attendantPhoto1Url: this.photoVehicle1(),
                attendantPhoto2Url: this.photoVehicle2(),
                attendantPhoto3Url: this.photoVehicle3(),
                attendantPhoto4Url: this.photoVehicle4()
            });
            const data: VehiclePrintData = {
                vehicle,
                client: this.clientCompany?.id != null ? { ...this.clientCompany } : null,
                driverEntry: this.driverEntry ? { ...this.driverEntry } : null,
                driverExit: this.driverExit ? { ...this.driverExit } : null
            };
            await this.vehiclePrinter.print(data, (message) => this.messageService.add({ severity: 'warn', summary: 'Impressão de imagens', detail: message, life: 8000 }));
        } catch (error: unknown) {
            this.messageService.add({ severity: 'error', summary: 'Imprimir veículo', detail: error instanceof Error ? error.message : 'Não foi possível preparar a impressão. Tente novamente.' });
        } finally {
            this.printing.set(false);
        }
    }
    timelineVisible = false;
    readonly historyLoading = signal(false);
    readonly historyError = signal('');
    readonly historyPassages = signal<VehicleEntry[]>([]);
    readonly historyLimited = signal(false);
    private historyVersion = 0;

    async showHistory(): Promise<void> {
        if (!this.ready() || this.historyLoading()) return;
        this.timelineVisible = true;
        this.historyLoading.set(true);
        this.historyError.set('');
        this.historyPassages.set([]);
        const id = this.vehicleEntry.id!;
        const version = ++this.historyVersion;
        const plate = (this.vehicleEntry.vehiclePlate || '').replace(/[^a-z0-9]/gi, '');
        this.historyLimited.set(this.vehicleEntry.vehicleNew === YesNotEnum.YES || !/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/i.test(plate));
        try {
            const data = await lastValueFrom(this.vehicleService.history(id));
            if (version !== this.historyVersion) return;
            this.historyPassages.set([...data].sort((a, b) => (this.historyDate(b.entryDate)?.getTime() ?? 0) - (this.historyDate(a.entryDate)?.getTime() ?? 0) || (b.id ?? 0) - (a.id ?? 0)));
        } catch {
            if (version === this.historyVersion) this.historyError.set('Não foi possível carregar a linha do tempo. Tente novamente.');
        } finally {
            if (version === this.historyVersion) this.historyLoading.set(false);
        }
    }
    closeHistory(): void {
        this.timelineVisible = false;
        ++this.historyVersion;
        this.historyLoading.set(false);
    }
    historyDate(value: Date | string | null | undefined): Date | null {
        if (!value) return null;
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    historyEvents(vehicle: VehicleEntry): { label: string; date: Date | null; user: string; notes: string; icon: string }[] {
        const events = [{ label: 'Entrada registrada', date: this.historyDate(vehicle.entryDate), user: vehicle.entryUserName, notes: vehicle.entryInformation, icon: 'pi-sign-in' }];
        if (this.historyDate(vehicle.auth1ExitDate)) events.push({ label: '1ª autorização de saída', date: this.historyDate(vehicle.auth1ExitDate), user: vehicle.auth1ExitUserName, notes: '', icon: 'pi-check-circle' });
        if (this.historyDate(vehicle.auth2ExitDate)) events.push({ label: '2ª autorização de saída', date: this.historyDate(vehicle.auth2ExitDate), user: vehicle.auth2ExitUserName, notes: '', icon: 'pi-check-circle' });
        if (this.historyDate(vehicle.exitDate)) events.push({ label: 'Saída registrada', date: this.historyDate(vehicle.exitDate), user: vehicle.exitUserName, notes: vehicle.exitInformation, icon: 'pi-sign-out' });
        return events.sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
    }
    async openHistoryAttendance(vehicle: VehicleEntry): Promise<void> {
        if (vehicle.id == null || vehicle.id === this.vehicleEntry.id || this.saving() || this.authorizing()) return;
        if (this.storageService.roleFunc === StatusRoleFuncEnum.USER && !(await this.searchPermission(100))) return;
        const navigate = () => {
            this.closeHistory();
            this.changerVehicle(vehicle.id!);
        };
        if (this.formVehicle.dirty) {
            this.confirmationService.confirm({
                header: 'Alterações não salvas',
                message: 'Ao abrir outra passagem, as alterações ainda não salvas serão descartadas.',
                acceptLabel: 'Abrir passagem',
                rejectLabel: 'Continuar editando',
                defaultFocus: 'reject',
                accept: navigate
            });
        } else navigate();
    }
    private readonly destroyRef = inject(DestroyRef);
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly authorizing = signal(false);
    readonly loadError = signal('');
    readonly ready = signal(false);
    private loadVersion = 0;
    get authorizationLabel(): string {
        if (this.vehicleEntry?.authExitStatus === StatusVehicleAuthEnum.AUTH) return 'Liberado';
        if (this.vehicleEntry?.authExitStatus === StatusVehicleAuthEnum.FIST) return '1ª liberação';
        return 'Não liberado';
    }
    private id: number = 0;
    //Vehicle
    public colors: IColor[] = [];

    modelVehicles = signal<VehicleModel[]>([]);
    attendants = signal<Salesperson[]>([]);
    photoVehicle1 = signal<string>('');
    isPhotoNew1: boolean = false;
    isPhotoDelete1: boolean = false;

    photoVehicle2 = signal<string>('');
    isPhotoNew2: boolean = false;
    isPhotoDelete2: boolean = false;

    photoVehicle3 = signal<string>('');
    isPhotoNew3: boolean = false;
    isPhotoDelete3: boolean = false;

    photoVehicle4 = signal<string>('');
    isPhotoNew4: boolean = false;
    isPhotoDelete4: boolean = false;

    public dateExitAuth1 = signal<string>('');
    public dateExitAuth2 = signal<string>('');
    vehicleExit: boolean = false;

    yes = YesNotEnum.YES;
    not = YesNotEnum.NOT;

    formVehicle = new FormGroup({
        id: new FormControl<number>({ value: 0, disabled: true }),
        vehiclePlate: new FormControl<string>(''),
        vehicleFleet: new FormControl<string | null>(null),
        vehicleColor: new FormControl<IColor | null>(null),
        kmEntry: new FormControl<string | null>(''),
        kmExit: new FormControl<string | null>(''),
        modelVehicle: new FormControl<VehicleModel | null>(null, Validators.required),
        entryDate: new FormControl<Date | null>(null, Validators.required),
        exitDate: new FormControl<Date | null>({ value: null, disabled: true }),
        exitDatePrevision: new FormControl<Date | null>(null),
        nameUserExitAuth1: new FormControl<string>({ value: '', disabled: true }),
        nameUserExitAuth2: new FormControl<string>({ value: '', disabled: true }),
        attendant: new FormControl<Salesperson | null>(null),
        vehicleNew: new FormControl<string>(YesNotEnum.NOT, Validators.required),
        vehicleServiceOrder: new FormControl<string>(YesNotEnum.YES, Validators.required),
        numServiceOrder: new FormControl<string | null>(null),
        numNfe: new FormControl<string | null>(null),
        numNfse: new FormControl<string | null>(null),
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

    modChecklist: VehicleEntryChecklist = new VehicleEntryChecklist();
    //Porteiro
    entryPhoto1!: string;
    entryPhoto2!: string;
    entryPhoto3!: string;
    entryPhoto4!: string;

    exitPhoto1!: string;
    exitPhoto2!: string;
    exitPhoto3!: string;
    exitPhoto4!: string;

    formConcierge = new FormGroup({
        entryId: new FormControl<number | null>({ value: null, disabled: true }),
        entryName: new FormControl<string>({ value: '', disabled: true }),
        entryInf: new FormControl<string>({ value: '', disabled: true }),
        exitId: new FormControl<number | null>({ value: null, disabled: true }),
        exitName: new FormControl<string>({ value: '', disabled: true }),
        exitInformation: new FormControl<string>({ value: '', disabled: true })
    });
    //ClientCompany
    selectClientCompany = signal<ClientCompany>(new ClientCompany());
    clientCompany!: ClientCompany;
    formClientCompany = new FormGroup({
        clientCompanyNot: new FormControl<string[]>([]),
        clientCompanyId: new FormControl<number | null>({ value: null, disabled: true }),
        clientCompanyName: new FormControl<string>({ value: '', disabled: true }),
        clientCompanyCnpj: new FormControl<string>({ value: '', disabled: true }),
        clientCompanyCpf: new FormControl<string>({ value: '', disabled: true }),
        clientCompanyRg: new FormControl<string | null>({ value: null, disabled: true })
    });
    //Driver
    selectDriverEntry = signal<Driver>(new Driver());
    selectDriverExit = signal<Driver>(new Driver());
    driverEntry!: Driver;
    driverExit!: Driver;
    formDriver = new FormGroup({
        driverEntryId: new FormControl<number | null>({ value: null, disabled: true }),
        driverEntryName: new FormControl<string>({ value: '', disabled: true }),
        driverEntryCpf: new FormControl<string>({ value: '', disabled: true }),
        driverEntryRg: new FormControl<string | null>({ value: null, disabled: true }),

        driverExitId: new FormControl<number | null>({ value: null, disabled: true }),
        driverExitName: new FormControl<string>({ value: '', disabled: true }),
        driverExitCpf: new FormControl<string>({ value: '', disabled: true }),
        driverExitRg: new FormControl<string | null>({ value: null, disabled: true })
    });
    driverEntryPhoto!: string;
    driverEntryPhotoDoc1!: string;
    driverEntryPhotoDoc2!: string;
    driverExitPhoto!: string;
    driverExitPhotoDoc1!: string;
    driverExitPhotoDoc2!: string;
    //Budget
    dialogVisibleOrcamento: boolean = false;
    dialogNomeClientCompany!: string;
    dialogIdClientCompany!: number;
    private budget!: IBudgetNew;

    //dialog visibleVehiclePlateTogether
    visibleVehiclePlateTogether: boolean = false;
    vehiclesTogether = signal<VehicleEntry[]>([]);
    isVehicleTogether = signal<boolean>(false);

    constructor(
        private budgetService: BudgetService,
        private permissionUserService: PermissionUserService,

        private vehicleService: VehicleEntryService,
        private activatedRoute: ActivatedRoute,

        private router: Router,

        private storageService: StorageService,
        private salespersonService: SalespersonService,
        private vehicleModelService: VehicleModelService,
        private confirmationService: ConfirmationService,
        private messageService: MessageService,
        private loadingService: LoadingService,
        private driverService: DriverService,
        private photoService: PhotoService,
        private clientService: ClientCompanyService,
        private shareVehicleService: ShareWhatsappService
    ) {}
    ngOnInit(): void {
        this.colors = [{ color: 'Branco' }, { color: 'Preto' }, { color: 'Azul' }, { color: 'Verde' }, { color: 'Cinza' }, { color: 'Vermelho' }, { color: 'Amarelo' }, { color: 'Rosa' }, { color: 'Roxo' }, { color: 'Outro' }];
        if (this.activatedRoute.snapshot.params['id']) {
            this.activatedRoute.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
                this.id = Number(params['id']);
                this.init();
            });
        }
    }

    ngDoCheck(): void {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        //proprietário
        if (this.selectClientCompany().id != null) {
            this.formClientCompany.patchValue({
                clientCompanyNot: [],
                clientCompanyId: this.selectClientCompany().id,
                clientCompanyName: this.selectClientCompany().name,
                clientCompanyCnpj: this.selectClientCompany().cnpj,
                clientCompanyCpf: this.selectClientCompany().cpf,
                clientCompanyRg: this.selectClientCompany().rg == '' ? null : this.selectClientCompany().rg
            });
            this.clientCompany = this.selectClientCompany();
            this.selectClientCompany.set(new ClientCompany());
        }
        //Motorista entrada
        if (this.selectDriverEntry().id != null) {
            this.driverEntry = this.selectDriverEntry();
            this.formDriver.patchValue({
                driverEntryId: this.driverEntry.id,
                driverEntryName: this.driverEntry?.name ?? '',
                driverEntryCpf: this.driverEntry?.cpf ?? '',
                driverEntryRg: this.driverEntry?.rg || null
            });
            this.driverEntryPhoto = this.driverEntry?.photoDriverUrl ?? '';
            this.driverEntryPhotoDoc1 = this.driverEntry?.photoDoc1Url ?? '';
            this.driverEntryPhotoDoc2 = this.driverEntry?.photoDoc2Url ?? '';
            this.selectDriverEntry.set(new Driver());
        }
        //Motorista saída
        if (this.selectDriverExit().id != null) {
            this.driverExit = this.selectDriverExit();
            this.formDriver.patchValue({
                driverExitId: this.driverExit.id == 0 ? null : this.driverExit.id,
                driverExitName: this.driverExit.name,
                driverExitCpf: this.driverExit.cpf,
                driverExitRg: this.driverExit.rg == '' ? null : this.driverExit.rg
            });
            this.driverExitPhoto = this.driverExit.photoDriverUrl;
            this.driverExitPhotoDoc1 = this.driverExit.photoDoc1Url;
            this.driverExitPhotoDoc2 = this.driverExit.photoDoc2Url;
            this.selectDriverExit.set(new Driver());
        }
    }
    async init(): Promise<void> {
        const version = ++this.loadVersion;
        const id = this.id;
        this.loading.set(true);
        this.ready.set(false);
        this.loadError.set('');
        this.resetRelatedData();
        try {
            await this.getAttendants();
            const models = await this.getVehicleModel();
            const result = await this.getVehicleEntry(id);
            if (version !== this.loadVersion) return;
            if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) throw new Error('load');
            const vehicle: VehicleEntry = result.body.data;
            const [checklist, client, entry, exit] = await Promise.all([
                vehicle.checklistId != null ? this.filterChecklist(vehicle.checklistId) : null,
                vehicle.clientCompanyId != null ? this.filterIdClient(vehicle.clientCompanyId) : null,
                vehicle.driverEntryId != null ? this.filterDriverId(vehicle.driverEntryId) : null,
                vehicle.driverExitId != null ? this.filterDriverId(vehicle.driverExitId) : null
            ]);
            if (version !== this.loadVersion) return;
            // Never save a partially loaded attendance over existing associations.
            for (const response of [checklist, client, entry, exit]) {
                if (response && (response.status !== 200 || response.body?.status !== StatusSuccessError.succes || response.body.data == null)) throw new Error('related');
            }
            this.modelVehicles.set(models);
            this.vehicleEntry = vehicle;
            this.modChecklist = checklist?.body?.data ?? new VehicleEntryChecklist();
            this.clientCompany = client?.body?.data ?? null;
            this.driverEntry = entry?.body?.data ?? null;
            this.driverExit = exit?.body?.data ?? null;
            this.loadForms();
            this.ready.set(true);
        } catch {
            if (version === this.loadVersion) this.loadError.set('Não foi possível carregar o atendimento completo. Tente novamente.');
        } finally {
            if (version === this.loadVersion) this.loading.set(false);
        }
    }
    private resetRelatedData(): void {
        this.closeHistory();
        this.historyPassages.set([]);
        this.clientCompany = null!;
        this.driverEntry = null!;
        this.driverExit = null!;
        this.modChecklist = new VehicleEntryChecklist();
        this.formVehicle.enable();
        for (const key of ['id', 'exitDate', 'nameUserExitAuth1', 'nameUserExitAuth2'] as const) this.formVehicle.controls[key].disable();
        this.formClientCompany.controls.clientCompanyNot.enable();
        this.formClientCompany.reset({ clientCompanyNot: [] });
        this.formDriver.reset();
        this.driverExitPhoto = this.driverExitPhotoDoc1 = this.driverExitPhotoDoc2 = '';
        this.vehicleExit = false;
        this.visibleVehiclePlateTogether = false;
        this.isPhotoNew1 = this.isPhotoNew2 = this.isPhotoNew3 = this.isPhotoNew4 = false;
        this.isPhotoDelete1 = this.isPhotoDelete2 = this.isPhotoDelete3 = this.isPhotoDelete4 = false;
    }
    private loadForms() {
        //mostrar veículos justos
        if (this.vehicleEntry.vehiclePlateTogether) {
            this.isVehicleTogether.set(true);
        } else {
            this.isVehicleTogether.set(false);
        }
        //Vehicle
        this.formVehicle.patchValue({
            id: this.vehicleEntry.id,
            entryDate: new Date(this.vehicleEntry.entryDate),
            exitDate: this.vehicleEntry.exitDate != null ? new Date(this.vehicleEntry.exitDate) : null,
            exitDatePrevision: this.vehicleEntry.exitDatePrevision != null ? new Date(this.vehicleEntry.exitDatePrevision) : null,
            vehicleColor: this.vehicleEntry.vehicleColor != null ? { color: this.vehicleEntry.vehicleColor } : null,
            vehiclePlate: this.vehicleEntry.vehiclePlate,
            vehicleFleet: this.vehicleEntry.vehicleFleet == '' ? null : this.vehicleEntry.vehicleFleet,
            modelVehicle: this.modelVehicles().find((m) => m.id == this.vehicleEntry.modelId),
            kmEntry: this.vehicleEntry.vehicleKmEntry == '' ? null : this.vehicleEntry.vehicleKmEntry,
            kmExit: this.vehicleEntry.vehicleKmExit == '' ? null : this.vehicleEntry.vehicleKmExit,
            attendant: this.attendants().find((a) => a.id == this.vehicleEntry.salespersonId),
            vehicleServiceOrder: this.vehicleEntry.vehicleServiceOrder,
            vehicleNew: this.vehicleEntry.vehicleNew,
            nameUserExitAuth1: this.vehicleEntry.auth1ExitUserName,
            nameUserExitAuth2: this.vehicleEntry.auth2ExitUserName,
            numServiceOrder: this.vehicleEntry.numServiceOrder == '' ? null : this.vehicleEntry.numServiceOrder,
            numNfe: this.vehicleEntry.numNfe == '' ? null : this.vehicleEntry.numNfe,
            numNfse: this.vehicleEntry.numNfse == '' ? null : this.vehicleEntry.numNfse,
            information: this.vehicleEntry.attendantInformation,

            checklist1Desc: this.modChecklist.checklist1Desc,
            checklist2Desc: this.modChecklist.checklist2Desc,
            checklist3Desc: this.modChecklist.checklist3Desc,
            checklist4Desc: this.modChecklist.checklist4Desc,
            checklist5Desc: this.modChecklist.checklist5Desc,
            checklist6Desc: this.modChecklist.checklist6Desc,
            checklist7Desc: this.modChecklist.checklist7Desc,
            checklist8Desc: this.modChecklist.checklist8Desc,
            checklist9Desc: this.modChecklist.checklist9Desc,
            checklist10Desc: this.modChecklist.checklist10Desc,
            checklist11Desc: this.modChecklist.checklist11Desc,
            checklist12Desc: this.modChecklist.checklist12Desc,
            checklist13Desc: this.modChecklist.checklist13Desc,
            checklist14Desc: this.modChecklist.checklist14Desc,
            checklist15Desc: this.modChecklist.checklist15Desc,
            checklist16Desc: this.modChecklist.checklist16Desc,
            checklist17Desc: this.modChecklist.checklist17Desc,
            checklist18Desc: this.modChecklist.checklist18Desc,
            checklist19Desc: this.modChecklist.checklist19Desc,
            checklist20Desc: this.modChecklist.checklist20Desc
        });
        //Imagem consultor
        this.photoVehicle1.set(this.vehicleEntry.attendantPhoto1Url);
        this.photoVehicle2.set(this.vehicleEntry.attendantPhoto2Url);
        this.photoVehicle3.set(this.vehicleEntry.attendantPhoto3Url);
        this.photoVehicle4.set(this.vehicleEntry.attendantPhoto4Url);
        //Validation placa
        if (this.vehicleEntry.vehicleNew == YesNotEnum.YES) {
            this.deleteRequirePlaca();
        } else {
            this.addRequirePlaca();
        }
        //Validation O.S.
        this.addRequireForms();
        //Autorização de saída
        if (this.vehicleEntry.auth1ExitDate) {
            this.dateExitAuth1.set(this.vehicleEntry.auth1ExitDate!.toString());
        } else {
            this.dateExitAuth1.set('');
        }
        if (this.vehicleEntry.auth2ExitDate) {
            this.dateExitAuth2.set(this.vehicleEntry.auth2ExitDate!.toString());
        } else {
            this.dateExitAuth2.set('');
        }
        //porteiro entrada
        this.formConcierge.patchValue({
            entryId: this.vehicleEntry.entryUserId,
            entryName: this.vehicleEntry.entryUserName,
            entryInf: this.vehicleEntry.entryInformation
        });
        this.entryPhoto1 = this.vehicleEntry.entryPhoto1Url;
        this.entryPhoto2 = this.vehicleEntry.entryPhoto2Url;
        this.entryPhoto3 = this.vehicleEntry.entryPhoto3Url;
        this.entryPhoto4 = this.vehicleEntry.entryPhoto4Url;
        //porteiro saída
        this.formConcierge.patchValue({
            exitId: this.vehicleEntry.exitUserId == null ? null : this.vehicleEntry.exitUserId,
            exitName: this.vehicleEntry.exitUserName,
            exitInformation: this.vehicleEntry.exitInformation
        });
        this.exitPhoto1 = this.vehicleEntry.exitPhoto1Url;
        this.exitPhoto2 = this.vehicleEntry.exitPhoto2Url;
        this.exitPhoto3 = this.vehicleEntry.exitPhoto3Url;
        this.exitPhoto4 = this.vehicleEntry.exitPhoto4Url;

        //Form Proprietario
        if (this.vehicleEntry.clientCompanyId != null) {
            this.formClientCompany.patchValue({
                clientCompanyNot: [],
                clientCompanyId: this.clientCompany.id,
                clientCompanyName: this.clientCompany.name,
                clientCompanyCnpj: this.clientCompany.cnpj,
                clientCompanyCpf: this.clientCompany.cpf,
                clientCompanyRg: this.clientCompany.rg == '' ? null : this.clientCompany.rg
            });
        } else {
            this.formClientCompany.get('clientCompanyNot')?.setValue(['not']);
        }
        //tab driver
        this.loadDriver();
        this.vehicleExit = this.vehicleEntry.status === StatusVehicleEnum.EXITED;
        if (this.vehicleExit) {
            this.formVehicle.disable();
            this.formClientCompany.controls.clientCompanyNot.disable();
        }
    }

    private loadDriver() {
        this.formDriver.patchValue({
            driverEntryId: this.driverEntry?.id ?? null,
            driverEntryName: this.driverEntry?.name ?? '',
            driverEntryCpf: this.driverEntry?.cpf ?? '',
            driverEntryRg: this.driverEntry?.rg == '' ? null : this.driverEntry?.rg
        });
        this.driverEntryPhoto = this.driverEntry?.photoDriverUrl ?? '';
        this.driverEntryPhotoDoc1 = this.driverEntry?.photoDoc1Url ?? '';
        this.driverEntryPhotoDoc2 = this.driverEntry?.photoDoc2Url ?? '';

        if (this.driverExit != null) {
            this.formDriver.patchValue({
                driverExitId: this.driverExit.id == 0 ? null : this.driverExit.id,
                driverExitName: this.driverExit.name,
                driverExitCpf: this.driverExit.cpf,
                driverExitRg: this.driverExit.rg == '' ? null : this.driverExit.rg
            });
            this.driverExitPhoto = this.driverExit.photoDriverUrl;
            this.driverExitPhotoDoc1 = this.driverExit.photoDoc1Url;
            this.driverExitPhotoDoc2 = this.driverExit.photoDoc2Url;
        }
    }

    private async getAttendants() {
        const salespeople = await lastValueFrom(this.salespersonService.listAll());
        this.attendants.set(salespeople.filter((person) => person.status === 'Habilitado'));
    }

    private async getVehicleModel(): Promise<VehicleModel[]> {
        try {
            return await lastValueFrom(this.vehicleModelService.getAllEnabled());
        } catch (error: any) {
            return [];
        }
    }

    private async getVehicleEntry(id: number = this.id): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entryFilterId(id));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Vaículo não encontrado', icon: 'pi pi-times' });
            return error;
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
    //Vehicle
    private preList(vehicle: VehicleEntry): VehicleEntry {
        //Format Date
        const datePipe = new DatePipe('pt-BR');
        vehicle.entryDate = datePipe.transform(this.formatDateTime(new Date(vehicle.entryDate)), 'dd/MM/yyyy HH:mm')!;

        if (vehicle.status == StatusVehicleEnum.EXITED) {
            vehicle.exitDate = datePipe.transform(this.formatDateTime(new Date(vehicle.exitDate)), 'dd/MM/yyyy HH:mm')!;
        }
        if (vehicle.vehicleNew == YesNotEnum.YES) {
            vehicle.vehiclePlate = 'NOVO';
        }
        if (vehicle.salespersonName == '') {
            vehicle.salespersonName = 'FALTA';
        }
        if (vehicle.clientCompanyName == '') {
            vehicle.clientCompanyName = 'FALTA';
        } else {
            var nome = vehicle.clientCompanyName.split(' ');
            vehicle.clientCompanyName = nome[0] + ' ' + nome[1];
        }
        return vehicle;
    }
    async showVehicleTogether() {
        if (this.vehicleEntry.vehiclePlateTogether) {
            this.loadingService.show();
            const result = await this.filterVehicleTogether(this.vehicleEntry.vehiclePlateTogether);
            this.loadingService.hide();
            if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
                this.visibleVehiclePlateTogether = true;
                for (let index = 0; index < result.body.data.length; index++) {
                    result.body.data[index] = this.preList(result.body.data[index]);
                }
                this.vehiclesTogether.set(result.body.data);
            }
        }
    }
    changerVehicle(id: number) {
        this.router.navigateByUrl('/concierge/vehicle/maintenance/' + id);
    }

    public placaRequiredAdd() {
        this.addRequirePlaca();
    }
    public placaRequiredRemove() {
        if ((this.formVehicle.controls.vehiclePlate.value ?? '').trim() != '' && this.formVehicle.value.vehicleNew == YesNotEnum.YES) {
            this.confirmationService.confirm({
                header: 'Confirmar',
                message: 'A placa será removida ',
                acceptIcon: 'pi pi-check mr-2',
                rejectIcon: 'pi pi-times mr-2',
                rejectButtonStyleClass: 'p-button-sm',
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-outlined p-button-sm',
                acceptLabel: 'Sim',
                accept: () => {
                    this.deleteRequirePlaca();
                    this.cleanPlaca();
                    this.messageService.add({ severity: 'success', summary: 'Placa', detail: 'Removida com sucesso', life: 2000 });
                },
                reject: () => {
                    this.formVehicle.patchValue({ vehicleNew: 'not' });
                }
            });
        }

        if ((this.formVehicle.controls.vehiclePlate.value ?? '').trim() == '' && this.formVehicle.value.vehicleNew == YesNotEnum.YES) {
            this.deleteRequirePlaca();
            this.cleanPlaca();
        }
    }
    private addRequirePlaca() {
        this.formVehicle.controls['vehiclePlate'].addValidators(Validators.required);
        this.formVehicle.controls['vehiclePlate'].updateValueAndValidity();
    }
    private deleteRequirePlaca() {
        this.formVehicle.controls['vehiclePlate'].removeValidators(Validators.required);
        this.formVehicle.controls['vehiclePlate'].updateValueAndValidity();
    }
    private cleanPlaca() {
        this.formVehicle.get('vehiclePlate')?.setValue('');
    }
    private addRequireAttendant() {
        this.formVehicle.controls['attendant'].addValidators(Validators.required);
        this.formVehicle.controls['attendant'].updateValueAndValidity();
    }
    private deleteRequireAttendant() {
        this.formVehicle.controls['attendant'].removeValidators(Validators.required);
        this.formVehicle.controls['attendant'].updateValueAndValidity();
    }
    /* Save imgage */
    async onFileSelected1() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (photo.status == StatusPhotoResult.SUCCESS) {
            this.photoVehicle1.set(photo.base64!);
            this.vehicleEntry.attendantPhoto1Url = this.photoVehicle1();
            //informa que foi selecionado uma imagem nova
            this.isPhotoNew1 = true;
            //informa que não exclua a imagem
            this.isPhotoDelete1 = false;
        }
        if (photo.status == StatusPhotoResult.LIMIT) {
            this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
        }
        if (photo.status == StatusPhotoResult.ERROR) {
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
        }
    }
    async onFileSelected2() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (photo.status == StatusPhotoResult.SUCCESS) {
            this.photoVehicle2.set(photo.base64!);
            this.vehicleEntry.attendantPhoto2Url = this.photoVehicle2();
            //informa que foi selecionado uma imagem nova
            this.isPhotoNew2 = true;
            //informa que não exclua a imagem
            this.isPhotoDelete2 = false;
        }
        if (photo.status == StatusPhotoResult.LIMIT) {
            this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
        }
        if (photo.status == StatusPhotoResult.ERROR) {
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
        }
    }
    async onFileSelected3() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (photo.status == StatusPhotoResult.SUCCESS) {
            this.photoVehicle3.set(photo.base64!);
            this.vehicleEntry.attendantPhoto3Url = this.photoVehicle3();
            //informa que foi selecionado uma imagem nova
            this.isPhotoNew3 = true;
            //informa que não exclua a imagem
            this.isPhotoDelete3 = false;
        }
        if (photo.status == StatusPhotoResult.LIMIT) {
            this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
        }
        if (photo.status == StatusPhotoResult.ERROR) {
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
        }
    }
    async onFileSelected4() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (photo.status == StatusPhotoResult.SUCCESS) {
            this.photoVehicle4.set(photo.base64!);
            this.vehicleEntry.attendantPhoto4Url = this.photoVehicle4();
            //informa que foi selecionado uma imagem nova
            this.isPhotoNew4 = true;
            //informa que não exclua a imagem
            this.isPhotoDelete4 = false;
        }
        if (photo.status == StatusPhotoResult.LIMIT) {
            this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
        }
        if (photo.status == StatusPhotoResult.ERROR) {
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
        }
    }
    /* Delete image */
    public async deleteFileVehicle1() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        this.photoVehicle1.set('');

        //informa que a imagem não é nova
        this.isPhotoNew1 = false;
        //informa que exclua a imagem
        this.isPhotoDelete1 = true;
    }
    public async deleteFileVehicle2() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        this.photoVehicle2.set('');

        //informa que a imagem não é nova
        this.isPhotoNew2 = false;
        //informa que exclua a imagem
        this.isPhotoDelete2 = true;
    }
    public async deleteFileVehicle3() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        this.photoVehicle3.set('');

        //informa que a imagem não é nova
        this.isPhotoNew3 = false;
        //informa que exclua a imagem
        this.isPhotoDelete3 = true;
    }
    public async deleteFileVehicle4() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        this.photoVehicle4.set('');

        //informa que a imagem não é nova
        this.isPhotoNew4 = false;
        //informa que exclua a imagem
        this.isPhotoDelete4 = true;
    }
    private async savePhoto(ve: VehicleEntry, img: string, order: number): Promise<string> {
        if (img == '') {
            return '';
        }
        try {
            let path = `${ve.companyId}/` + `${ve.resaleId}/concierge/vehicle/` + `${ve.id}/attendant/`;

            const { base64, mime } = this.cleanBase64(img);
            const file = this.base64ToFile(base64, mime);

            const formData = new FormData();
            formData.append('file', file);

            switch (order) {
                case 1:
                    path += 'image1.jpg';
                    formData.append('local', path);
                    break;
                case 2:
                    path += 'image2.jpg';
                    formData.append('local', path);
                    break;
                case 3:
                    path += 'image3.jpg';
                    formData.append('local', path);
                    break;
                case 4:
                    path += 'image4.jpg';
                    formData.append('local', path);
                    break;
            }
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

    private addRequireForms() {
        if (this.vehicleEntry.vehicleServiceOrder == YesNotEnum.YES) {
            this.addRequireAttendant();
        } else {
            this.deleteRequireAttendant();
        }
    }
    public async authExit() {
        if (!this.ready() || this.vehicleExit || this.saving() || this.authorizing()) return;
        this.authorizing.set(true);
        try {
            const uppercase = new UpperCasePipe();
            if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.AUTH) {
                let auth = new VehicleEntryAuth();
                auth.vehicleId = this.vehicleEntry.id;
                //Inicia loading
                this.loadingService.show();
                const permissionResult = await this.addAuthExit(auth);
                //Fecha loading
                this.loadingService.hide();
                if (permissionResult.status == 200 && permissionResult.body?.status == StatusSuccessError.succes) {
                    auth = permissionResult.body.data;
                    //Status auth exit
                    if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.NOT) {
                        this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.FIST;
                        this.messageService.add({ severity: 'success', summary: permissionResult.body.header, detail: permissionResult.body.message, icon: 'pi pi-check-circle' });
                    } else if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.FIST) {
                        this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.AUTH;
                        this.messageService.add({ severity: 'success', summary: permissionResult.body.header, detail: permissionResult.body.message, icon: 'pi pi-thumbs-up-fill' });
                    }

                    if (this.vehicleEntry.auth1ExitUserId == null) {
                        this.formVehicle.get('nameUserExitAuth1')?.setValue(auth.userName);
                        this.vehicleEntry.auth1ExitUserId = auth.userId;
                        this.vehicleEntry.auth1ExitUserName = auth.userName;
                        this.vehicleEntry.auth1ExitDate = auth.dateAuth;
                        this.dateExitAuth1.set(auth.dateAuth as string);
                    } else if (this.vehicleEntry.auth2ExitUserId == null) {
                        this.formVehicle.get('nameUserExitAuth2')?.setValue(auth.userName);
                        this.vehicleEntry.auth2ExitUserId = auth.userId;
                        this.vehicleEntry.auth2ExitUserName = auth.userName;
                        this.vehicleEntry.auth2ExitDate = auth.dateAuth;
                        this.dateExitAuth2.set(auth.dateAuth as string);
                    }
                }
                if (permissionResult.status == 200 && permissionResult.body?.status == StatusSuccessError.error) {
                    this.messageService.add({ severity: 'info', summary: permissionResult.body.header, detail: permissionResult.body.message, icon: 'pi pi-info-circle' });
                }
            } else {
                this.messageService.add({ severity: 'info', summary: 'Veículo Liberado', detail: 'Placa ' + uppercase.transform(this.formVehicle.value.vehiclePlate), icon: 'pi pi-thumbs-up-fill' });
            }
        } finally {
            this.loadingService.hide();
            this.authorizing.set(false);
        }
    }
    private async addAuthExit(auth: VehicleEntryAuth): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entryAddAuth(auth));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private updateAuthExitStatus() {
        if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.FIST) {
            this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.NOT;
            // this.deleteRequireForms();
            //this.deleteRequireAttendant();
        } else if (this.vehicleEntry.authExitStatus == StatusVehicleAuthEnum.AUTH) {
            this.vehicleEntry.authExitStatus = StatusVehicleAuthEnum.FIST;
        }
    }
    public async deleteAuth1() {
        if (!this.ready() || this.vehicleExit || this.saving() || this.authorizing()) return;
        this.authorizing.set(true);
        try {
            if (this.vehicleEntry.auth1ExitUserId != null) {
                let auth = new VehicleEntryAuth();
                auth.vehicleId = this.vehicleEntry.id;
                this.loadingService.show();
                const authResult = await this.delAuth1(auth);
                this.loadingService.hide();
                if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.succes) {
                    this.messageService.add({ severity: 'success', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-check' });
                    this.formVehicle.get('nameUserExitAuth1')?.setValue('');
                    this.vehicleEntry.auth1ExitUserId = null;
                    this.vehicleEntry.auth1ExitUserName = '';
                    this.vehicleEntry.auth1ExitDate = '';
                    this.dateExitAuth1.set('');
                    this.updateAuthExitStatus();
                } else if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.error) {
                    this.messageService.add({ severity: 'info', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-info-circle' });
                }
            }
        } finally {
            this.loadingService.hide();
            this.authorizing.set(false);
        }
    }
    private async delAuth1(auth: VehicleEntryAuth): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entryDeleteAuth1(auth));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    public async deleteAuth2() {
        if (!this.ready() || this.vehicleExit || this.saving() || this.authorizing()) return;
        this.authorizing.set(true);
        try {
            if (this.vehicleEntry.auth2ExitUserId != null) {
                let auth = new VehicleEntryAuth();
                auth.vehicleId = this.vehicleEntry.id;
                this.loadingService.show();
                const authResult = await this.delAuth2(auth);
                this.loadingService.hide();
                if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.succes) {
                    this.messageService.add({ severity: 'success', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-check' });
                    this.formVehicle.get('nameUserExitAuth2')?.setValue('');
                    this.vehicleEntry.auth2ExitUserId = null;
                    this.vehicleEntry.auth2ExitUserName = '';
                    this.vehicleEntry.auth2ExitDate = '';
                    this.dateExitAuth2.set('');
                    this.updateAuthExitStatus();
                } else if (authResult.status == 200 && authResult.body?.status == StatusSuccessError.error) {
                    this.messageService.add({ severity: 'info', summary: authResult.body.header, detail: authResult.body.message, icon: 'pi pi-info-circle' });
                }
            }
        } finally {
            this.loadingService.hide();
            this.authorizing.set(false);
        }
    }
    private async delAuth2(auth: VehicleEntryAuth): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entryDeleteAuth2(auth));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    //Porteiro
    public validationClientCompany() {
        if (this.formClientCompany.value.clientCompanyNot!.length == 0 && this.clientCompany != null) {
            this.cleanFormClientCompany();
            this.clientCompany = null!;
        }
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
    //Driver
    private async filterDriverId(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.driverService.filterId(id));
        } catch (error: any) {
            return error;
        }
    }
    cleanDriverExit() {
        if (!this.ready() || this.vehicleExit || this.saving()) return;
        this.driverExit = null!;
        ((this.vehicleEntry.driverExitId = null), (this.vehicleEntry.driverExitName = ''));
        this.formDriver.patchValue({
            driverExitId: null,
            driverExitName: '',
            driverExitCpf: '',
            driverExitRg: null
        });
        this.driverExitPhoto = '';
        this.driverExitPhotoDoc1 = '';
        this.driverExitPhotoDoc2 = '';
    }

    //Budget
    public async confirmGerarOrcamento() {
        if (this.formVehicle.value.numServiceOrder == '' || this.formVehicle.value.numServiceOrder == null) {
            this.messageService.add({ severity: 'info', summary: 'Número O.S.', detail: 'Não informado', icon: 'pi pi-info-circle' });
            return;
        }

        if (this.vehicleEntry.budgetId != 0) {
            this.router.navigateByUrl('/oficina/manutencao-orcamento/' + this.vehicleEntry.id);
        } else {
            this.confirmationService.confirm({
                header: 'Confirmar',
                message: 'Gerar um orçamento.',
                acceptIcon: 'pi pi-check mr-2',
                rejectIcon: 'pi pi-times mr-2',
                rejectButtonStyleClass: 'p-button-sm',
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-outlined p-button-sm',
                acceptLabel: 'Sim',
                accept: async () => {
                    this.budget = { companyId: this.storageService.companyId, resaleId: this.storageService.resaleId, vehicleEntryId: this.vehicleEntry.id };
                    const budgetResult = await this.saveBudget(this.budget);
                    if (budgetResult.status == 201) {
                        //this.vehicleEntry.budgetId = budgetResult.body.status;
                        this.messageService.add({ severity: 'info', summary: 'Orçamento - ' + budgetResult.body?.id, detail: 'Gerado com sucesso', life: 2000 });

                        setTimeout(async () => {
                            this.router.navigateByUrl('/oficina/manutencao-orcamento/' + this.vehicleEntry.id);
                        }, 2000);
                    }
                }
            });
        }
    }
    private async saveBudget(budget: IBudgetNew): Promise<HttpResponse<IBudget>> {
        try {
            return await lastValueFrom(this.budgetService.addBudget$(this.budget));
        } catch (error: any) {
            return error;
        }
    }
    //Atualizar informações do veículo
    private validInformation(): boolean {
        this.formVehicle.markAllAsTouched();
        const vehicleValue = this.formVehicle.value;
        const clientCompanyValue = this.formClientCompany.value;
        if (vehicleValue.vehicleNew !== YesNotEnum.YES && !vehicleValue.vehiclePlate?.trim()) {
            this.messageService.add({ severity: 'error', summary: 'Placa', detail: 'Informe a placa do veículo.' });
            return false;
        }
        if (vehicleValue.entryDate == null || Number.isNaN(vehicleValue.entryDate.getTime())) {
            this.messageService.add({ severity: 'error', summary: 'Data Entrada', detail: 'Não informada', icon: 'pi pi-times' });
            return false;
        }
        if (vehicleValue.entryDate > new Date()) {
            this.messageService.add({ severity: 'error', summary: 'Data Entrada', detail: 'Maior que data atual', icon: 'pi pi-times' });
            return false;
        }
        if (vehicleValue.exitDatePrevision != null && (Number.isNaN(vehicleValue.exitDatePrevision.getTime()) || vehicleValue.exitDatePrevision < vehicleValue.entryDate)) {
            this.messageService.add({ severity: 'error', summary: 'Data Previsão Saída', detail: 'Menor que data entrada', icon: 'pi pi-times' });
            return false;
        }
        if (vehicleValue.modelVehicle == null) {
            this.messageService.add({ severity: 'error', summary: 'Modelo', detail: 'Não selecionado', icon: 'pi pi-times' });
            return false;
        }
        if (vehicleValue.vehicleServiceOrder == YesNotEnum.YES) {
            if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.NOT) {
                if (vehicleValue.attendant == null) {
                    this.messageService.add({ severity: 'error', summary: 'Consultor', detail: 'Não informado', icon: 'pi pi-times' });
                    return false;
                }
            }
        }
        //Proprietário
        if (clientCompanyValue.clientCompanyNot!.length == 0 && this.clientCompany == null) {
            this.messageService.add({ severity: 'error', summary: 'Proprietário', detail: 'Não informado', icon: 'pi pi-times' });
            return false;
        }
        //Motorista Entrada
        if (this.driverEntry == null) {
            this.messageService.add({ severity: 'error', summary: 'Motorista Entrada', detail: 'Não informado', icon: 'pi pi-times' });
            return false;
        }
        if (this.vehicleEntry.authExitStatus != StatusVehicleAuthEnum.NOT) {
            //Motorista saída
            if (this.driverExit == null) {
                this.messageService.add({ severity: 'error', summary: 'Motorista Saída', detail: 'Não informado', icon: 'pi pi-times' });
                return false;
            }
        }
        return true;
    }
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
    private loadingVehicle() {
        const vehicleValue = this.formVehicle.value;

        this.vehicleEntry.entryDate = this.formatDateTime(vehicleValue.entryDate!);
        this.vehicleEntry.exitDatePrevision = vehicleValue?.exitDatePrevision == null ? null! : this.formatDateTime(vehicleValue.exitDatePrevision);
        this.vehicleEntry.vehiclePlate = vehicleValue.vehiclePlate!;

        this.vehicleEntry.vehicleFleet = vehicleValue.vehicleFleet == null ? '' : vehicleValue.vehicleFleet;
        this.vehicleEntry.modelId = vehicleValue.modelVehicle?.id!;
        this.vehicleEntry.modelDescription = vehicleValue.modelVehicle?.description!;
        this.vehicleEntry.vehicleColor = vehicleValue.vehicleColor?.color ?? null;
        this.vehicleEntry.salespersonId = vehicleValue.attendant?.id ?? null;
        this.vehicleEntry.salespersonName = vehicleValue.attendant?.name ?? '';
        this.vehicleEntry.vehicleKmEntry = vehicleValue?.kmEntry ?? '';
        this.vehicleEntry.vehicleKmExit = vehicleValue?.kmExit ?? '';

        this.vehicleEntry.numServiceOrder = vehicleValue?.numServiceOrder ?? '';
        this.vehicleEntry.numNfe = vehicleValue?.numNfe ?? '';
        this.vehicleEntry.numNfse = vehicleValue?.numNfse ?? '';

        this.vehicleEntry.vehicleNew = vehicleValue.vehicleNew!;
        this.vehicleEntry.vehicleServiceOrder = vehicleValue.vehicleServiceOrder!;
        this.vehicleEntry.attendantInformation = vehicleValue.information!;

        if (this.clientCompany != null) {
            this.vehicleEntry.clientCompanyId = this.clientCompany.id;
            this.vehicleEntry.clientCompanyName = this.clientCompany.name;
        } else {
            this.vehicleEntry.clientCompanyId = null;
            this.vehicleEntry.clientCompanyName = '';
        }

        this.vehicleEntry.driverEntryId = this.driverEntry.id;
        this.vehicleEntry.driverEntryName = this.driverEntry?.name;

        if (this.driverExit != null) {
            this.vehicleEntry.driverExitId = this.driverExit.id;
            this.vehicleEntry.driverExitName = this.driverExit.name;
        }
        //Checklist
        if (this.modChecklist.id != null) {
            this.modChecklist.checklist1Desc = vehicleValue.checklist1Desc!;
            this.modChecklist.checklist2Desc = vehicleValue.checklist2Desc!;
            this.modChecklist.checklist3Desc = vehicleValue.checklist3Desc!;
            this.modChecklist.checklist4Desc = vehicleValue.checklist4Desc!;
            this.modChecklist.checklist5Desc = vehicleValue.checklist5Desc!;
            this.modChecklist.checklist6Desc = vehicleValue.checklist6Desc!;
            this.modChecklist.checklist7Desc = vehicleValue.checklist7Desc!;
            this.modChecklist.checklist8Desc = vehicleValue.checklist8Desc!;
            this.modChecklist.checklist9Desc = vehicleValue.checklist9Desc!;
            this.modChecklist.checklist10Desc = vehicleValue.checklist10Desc!;
            this.modChecklist.checklist11Desc = vehicleValue.checklist11Desc!;
            this.modChecklist.checklist12Desc = vehicleValue.checklist12Desc!;
            this.modChecklist.checklist13Desc = vehicleValue.checklist13Desc!;
            this.modChecklist.checklist14Desc = vehicleValue.checklist14Desc!;
            this.modChecklist.checklist15Desc = vehicleValue.checklist15Desc!;
            this.modChecklist.checklist16Desc = vehicleValue.checklist16Desc!;
            this.modChecklist.checklist17Desc = vehicleValue.checklist17Desc!;
            this.modChecklist.checklist18Desc = vehicleValue.checklist18Desc!;
            this.modChecklist.checklist19Desc = vehicleValue.checklist19Desc!;
            this.modChecklist.checklist20Desc = vehicleValue.checklist20Desc!;
        }
    }
    public async save() {
        if (!this.ready() || this.vehicleExit || this.saving() || this.authorizing()) return;
        this.saving.set(true);
        try {
            if (this.storageService.roleFunc === StatusRoleFuncEnum.USER && !(await this.searchPermission(100))) return;
            if (!this.validInformation()) return;
            this.loadingService.show();
            this.loadingVehicle();
            for (const index of [1, 2, 3, 4] as const) {
                const newKey = `isPhotoNew${index}` as const;
                const deleteKey = `isPhotoDelete${index}` as const;
                const urlKey = `attendantPhoto${index}Url` as const;
                if (this[newKey]) {
                    const url = await this.savePhoto(this.vehicleEntry, this[`photoVehicle${index}`](), index);
                    if (!url) throw new Error('Não foi possível salvar a foto ' + index + '. Tente novamente.');
                    this.vehicleEntry[urlKey] = url;
                    this[newKey] = false;
                }
                if (this[deleteKey]) {
                    const data = new FormData();
                    data.append('local', `${this.vehicleEntry.companyId}/${this.vehicleEntry.resaleId}/concierge/vehicle/${this.vehicleEntry.id}/attendant/image${index}.jpg`);
                    const result = await this.deleteImage(data);
                    if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) throw new Error('Não foi possível remover a foto ' + index + '. Tente novamente.');
                    this.vehicleEntry[urlKey] = '';
                    this[deleteKey] = false;
                }
            }
            const result = await this.updateVehicle(this.vehicleEntry);
            if (result.status === 200 && result.body?.status === StatusSuccessError.succes) {
                if (this.modChecklist.id != null) {
                    const checklist = await this.updateChecklist(this.modChecklist);
                    if (checklist.status !== 200 || checklist.body?.status !== StatusSuccessError.succes) throw new Error('Dados do veículo salvos. Não foi possível salvar o checklist; tente novamente.');
                }
                this.addRequireForms();
                this.formVehicle.markAsPristine();
                this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message });
            } else {
                this.messageService.add({ severity: 'error', summary: 'Salvar veículo', detail: result.body?.message || 'Não foi possível salvar. Tente novamente.' });
            }
        } catch (error: unknown) {
            this.messageService.add({ severity: 'error', summary: 'Salvar veículo', detail: error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.' });
        } finally {
            this.loadingService.hide();
            this.saving.set(false);
        }
    }
    private async updateVehicle(vehicle: VehicleEntry): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.entryUpdate(vehicle));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não catalogado.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async searchPermission(permission: number): Promise<boolean> {
        try {
            const result = await lastValueFrom(this.permissionUserService.filterPermission(this.storageService.companyId, this.storageService.resaleId, this.storageService.id, permission));
            if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
                return true;
            } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
                this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
            }
            return false;
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return false;
        }
    }
    /* Share vehicle data via WhatsApp */
    shareWhatsapp() {
        this.shareVehicleService.shareVehicle(this.vehicleEntry);
    }
    private async filterIdClient(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterId(id));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterVehicleTogether(together: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.filterTogether(together));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.saveImage(data));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async deleteImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.deleteImage(data));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }

    private async filterChecklist(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.filterChecklist(id));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async updateChecklist(ch: VehicleEntryChecklist): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleService.updateChecklist(ch));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a operação.', icon: 'pi pi-times' });
            return error;
        }
    }
}
