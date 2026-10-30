import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';

import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { ClientCompany } from '@/app/models/client.company';

import { Visit } from '@/app/models/crm/visit/visit';
import { ContactTypeEnum } from '@/app/models/crm/visit/contact.type.enum';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { lastValueFrom } from 'rxjs';
import { Salesperson } from '@/app/models/crm/salesperson';
import { UserService } from '@/app/services/user/user.service';
import { HttpResponse } from '@angular/common/http';
import { User } from '@/app/models/user';
import { ISalespersonType } from '@/app/interfaces/salesperson/i.salesperson.type';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { LoadingService } from '@/app/services/loading/loading.service';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';

interface IReazonVisit {
    id: number;
    description: string;
}

interface IProductsInterest {
    id: number;
    description: string;
}

@Component({
    selector: 'app-visit-maintenance',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        FilterClientComponent,
        SelectModule,
        DatePickerModule,
        DialogModule,
        StepperModule,
        InputTextModule,
        RadioButtonModule,
        TextareaModule,
        ToastModule,
        ButtonModule,
        RouterModule,
        InputMaskModule,
        InputNumberModule,
        CheckboxModule
    ],
    templateUrl: './visit.maintenance.component.html',
    styleUrl: './visit.maintenance.component.scss',
    providers: [MessageService]
})
export default class VisitMaintenanceComponent implements OnInit {
    private visit: Visit | null = null;
    private previousContactType = ContactTypeEnum.IN_PERSON;
    saving = signal(false);
    initializing = signal(true);
    saveStatus = signal('');
    stepError = signal('');
    readonly stepLabels = ['Cliente', 'Contato', 'Motivo', 'Produtos', 'Conclusão'];
    readonly stepIcons = ['pi-building', 'pi-phone', 'pi-clipboard', 'pi-box', 'pi-check'];
    activeStepper = signal<number>(1);
    visibleSalesperson: boolean = false;
    selectClient = signal<ClientCompany | null>(null);
    INPERSON = ContactTypeEnum.IN_PERSON;
    PHONE = ContactTypeEnum.PHONE;
    CELLPHONE = ContactTypeEnum.CELLPHONE;
    EMAIL = ContactTypeEnum.EMAIL;
    FEIRAS_EVENTOS = ContactTypeEnum.FEIRAS_EVENTOS;
    formVisit = new FormGroup({
        clientNotExists: new FormControl<boolean>(false),
        clientId: new FormControl<number | null>(null),
        clientName: new FormControl<string>('', Validators.required),
        clientCNPJ: new FormControl<string>(''),
        clientCPF: new FormControl<string>(''),
        contactType: new FormControl<ContactTypeEnum>(ContactTypeEnum.IN_PERSON),
        contact: new FormControl<string>(''),
        reasonVisit: new FormControl<IReazonVisit[]>([]),
        reasonInfoChecked: new FormControl<boolean>(false),
        reasonInfo: new FormControl<string>(''),
        products: new FormControl<IProductsInterest[]>([]),
        productsInfoChecked: new FormControl<boolean>(false),
        productsInfo: new FormControl<string>(''),
        salesperson: new FormControl<Salesperson | null>(null, Validators.required),
        salespersonInfo: new FormControl<string>(''),
        dateVisit: new FormControl<Date>(new Date(), Validators.required),
        timeVisit: new FormControl<Date>(new Date(), Validators.required)
    });
    reasonVisits = signal<IReazonVisit[]>([]);
    products = signal<IProductsInterest[]>([]);
    salespersons = signal<Salesperson[]>([]);
    salespersonImage = signal<string>('');
    visibleDateVisit: boolean = false;

    constructor(
        private router: Router,
        private visitService: VisitService,
        private loadingService: LoadingService,
        private userService: UserService,
        private salespersonService: SalespersonService,
        private messageService: MessageService,
        private location: Location
    ) {}

    ngOnInit(): void {
        const state = this.location.getState() as { visit?: Visit };
        this.visit = state?.visit ?? null;

        this.reasonVisits.set([
            { id: 1, description: 'Implemento Librelato' },
            { id: 2, description: 'Consorcio Nacional Librelato' },
            { id: 3, description: 'Sistema de telemetria (Sigaway)' },
            { id: 4, description: 'Peças e pneus' },
            { id: 5, description: 'Oficina: Serviços mecânicos, hidráulicos, pneumáticos' },
            { id: 6, description: 'Reforma ou corretiva (Pintura, desempeno chassis, jateamento, solda)' },
            { id: 7, description: 'Plano manutenção preventiva' }
        ]);
        this.products.set([
            { id: 1, description: 'Consórcio' },
            { id: 2, description: 'Serviços e Peças' },
            { id: 3, description: 'Graneleiro' },
            { id: 4, description: 'Porta Container' },
            { id: 5, description: 'Bau lonado / sider' },
            { id: 6, description: 'Bau Aluminio' },
            { id: 7, description: 'Tanque' },
            { id: 8, description: 'Carrega tudo' },
            { id: 9, description: 'Frigorifico' }
        ]);
        this.init();
    }

    private async init(): Promise<void> {
        this.loadingService.show();
        try {
            const types: ISalespersonType = { typeSalesPart: YesNotEnum.NOT, typeSalesService: YesNotEnum.NOT, typeSalesVehicle: YesNotEnum.YES };
            this.salespersons.set(await this.filterTypeSalesperson(types));
            if (this.visit) {
                const v = this.visit;
                this.previousContactType = v.contactType;
                const salesperson = this.salespersons().find((p) => p.id === v.salespersonId) ?? null;
                const date = v.dateVisit ? new Date(v.dateVisit) : new Date();
                this.formVisit.patchValue({
                    clientNotExists: v.clientId == null,
                    clientId: v.clientId,
                    clientName: v.clientName,
                    clientCNPJ: v.clientCNPJ,
                    clientCPF: v.clientCPF,
                    salesperson,
                    salespersonInfo: v.salespersonInfo,
                    contactType: v?.contactType ?? ContactTypeEnum.IN_PERSON,
                    contact: v.contact,
                    reasonVisit: this.reasonVisits().filter((item) => (v.reasonVisit ?? '').split(',').includes(String(item.id))),
                    reasonInfoChecked: !!v.reasonVisitInfo,
                    reasonInfo: v.reasonVisitInfo,
                    products: this.products().filter((item) => (v.products ?? '').split(',').includes(String(item.id))),
                    productsInfoChecked: !!v.productsInfo,
                    productsInfo: v.productsInfo,
                    dateVisit: Number.isNaN(date.getTime()) ? new Date() : date,
                    timeVisit: Number.isNaN(date.getTime()) ? new Date() : date
                });
                if (v.clientId != null) this.selectClient.set(Object.assign(new ClientCompany(), { id: v.clientId, name: v.clientName, cnpj: v.clientCNPJ, cpf: v.clientCPF }));
                this.salespersonImage.set(salesperson?.photoUrl ?? '');
            } else {
                const result = await this.getUser();
                const salesperson = this.salespersons().find((p) => p.userId === result.body?.id);
                if (salesperson) {
                    this.formVisit.controls.salesperson.setValue(salesperson);
                    this.salespersonImage.set(salesperson.photoUrl);
                }
            }
        } finally {
            this.initializing.set(false);
            this.loadingService.hide();
        }
    }

    async goToStep(target: number): Promise<void> {
        if (this.saving() || this.initializing() || target === this.activeStepper()) return;
        const through = target > this.activeStepper() ? target - 1 : this.activeStepper() - 1;
        if (!this.validateSteps(through)) return;
        if (await this.persist()) {
            this.stepError.set('');
            this.activeStepper.set(target);
        }
    }

    private validateSteps(through: number): boolean {
        const v = this.formVisit.getRawValue();
        const failures: [number, boolean, string][] = [
            [1, !v.clientName?.trim() || (!v.clientNotExists && (!v.clientId || this.selectClient()?.id !== v.clientId)), 'Selecione um cliente pelo filtro ou informe o nome do cliente sem cadastro.'],
            [1, !v.salesperson, 'Selecione o vendedor.'],
            [2, !this.contactValid(), 'Informe um e-mail válido ou o número completo com DDD.'],
            [3, !v.reasonVisit?.length && !v.reasonInfoChecked, 'Selecione um motivo ou marque Outro e descreva.'],
            [3, !!v.reasonInfoChecked && !v.reasonInfo?.trim(), 'Descreva o outro motivo da visita.'],
            [4, !v.products?.length && !v.productsInfoChecked, 'Selecione um produto ou marque Outro e descreva.'],
            [4, !!v.productsInfoChecked && !v.productsInfo?.trim(), 'Descreva o outro produto de interesse.'],
            [5, !this.contactValid(), 'Informe onde foi a feira ou evento.']
        ];
        const failure = failures.find(([step, invalid]) => step <= through && invalid);
        if (!failure) {
            this.stepError.set('');
            return true;
        }
        this.formVisit.markAllAsTouched();
        this.activeStepper.set(failure[0]);
        this.stepError.set(failure[2]);
        this.messageService.add({ severity: 'warn', summary: 'Verifique o preenchimento', detail: failure[2] });
        return false;
    }

    private contactValid(): boolean {
        const { contactType, contact } = this.formVisit.getRawValue();
        if (contactType === this.INPERSON) return true;
        if (contactType === this.EMAIL) return !!contact?.trim() && !Validators.email(new FormControl(contact.trim()));
        if (contactType === this.FEIRAS_EVENTOS) return !!contact?.trim();
        return (contact ?? '').replace(/\D/g, '').length === (contactType === this.PHONE ? 10 : 11);
    }

    selectionSummary(kind: 'reason' | 'products'): string {
        const v = this.formVisit.getRawValue();
        const items = kind === 'reason' ? v.reasonVisit : v.products;
        const other = kind === 'reason' ? (v.reasonInfoChecked ? v.reasonInfo : '') : v.productsInfoChecked ? v.productsInfo : '';
        return [...(items ?? []).map((item) => item.description), ...(other?.trim() ? [other.trim()] : [])].join(', ');
    }

    //STEP CLIENT
    onChangecheckBoxClient(event: CheckboxChangeEvent) {
        //Limpa os dados do cliente
        this.selectClient.set(null);
        this.formVisit.patchValue({
            clientId: null,
            clientName: '',
            clientCNPJ: '',
            clientCPF: ''
        });
    }

    onSelectClient(client: ClientCompany | null) {
        this.formVisit.markAsDirty();
        this.selectClient.set(client);
        this.formVisit.patchValue({
            clientId: client?.id ?? null,
            clientName: client?.name ?? '',
            clientCNPJ: client?.cnpj ?? '',
            clientCPF: client?.cpf ?? ''
        });
    }

    changeContactType(): void {
        const type = this.formVisit.controls.contactType.value;
        if (type === this.previousContactType) return;
        this.previousContactType = type ?? this.INPERSON;
        this.formVisit.controls.contact.setValue('');
        this.stepError.set('');
    }

    onChangeSalesperson(event: SelectChangeEvent) {
        if (event.value) {
            const p: Salesperson = event.value;
            this.formVisit.get('salesperson')?.setValue(p);
            this.salespersonImage.set(p.photoUrl);
        } else {
            this.formVisit.get('salesperson')?.setValue(null);
            this.salespersonImage.set('');
        }
    }

    private async persist(complete = false): Promise<boolean> {
        if (this.saving() || this.initializing()) return false;
        this.saving.set(true);
        this.saveStatus.set('Salvando…');
        const v = this.formVisit.getRawValue();
        const payload = Object.assign(new Visit(), this.visit, {
            clientId: v.clientNotExists ? null : v.clientId,
            clientName: v.clientName?.trim().toLocaleLowerCase() ?? '',
            clientCNPJ: v.clientCNPJ ?? '',
            clientCPF: v.clientCPF ?? '',
            salespersonId: v.salesperson?.id ?? null,
            salespersonName: v.salesperson?.name.trim().toLocaleLowerCase() ?? '',
            salespersonInfo: v.salespersonInfo?.trim().toLocaleLowerCase() ?? '',
            contactType: v.contactType ?? this.INPERSON,
            contact: v.contact?.trim() ?? '',
            reasonVisit: (v.reasonVisit ?? []).map((item) => item.id).join(','),
            reasonVisitInfo: v.reasonInfoChecked ? (v.reasonInfo?.trim().toLocaleLowerCase() ?? '') : '',
            products: (v.products ?? []).map((item) => item.id).join(','),
            productsInfo: v.productsInfoChecked ? (v.productsInfo?.trim().toLocaleLowerCase() ?? '') : ''
        });
        if (complete) {
            const date = v.dateVisit;
            const time = v.timeVisit;
            if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !(time instanceof Date) || Number.isNaN(time.getTime())) {
                this.stepError.set('Informe uma data e um horário válidos.');
                this.saveStatus.set('Data ou horário inválido');
                this.saving.set(false);
                return false;
            }
            payload.status = StatusVisitEnum.CLOSE;
            payload.dateVisit = this.formatDateTime(new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes()));
        }
        try {
            this.loadingService.show();
            const result = await lastValueFrom(this.visit?.id ? this.visitService.registerUpdate(payload) : this.visitService.registerNew(payload));
            this.loadingService.hide();
            if (!result.body?.id) throw new Error('O servidor não retornou o registro salvo.');
            this.visit = result.body;
            this.formVisit.markAsPristine();
            this.saveStatus.set(complete ? 'Visita concluída' : 'Alterações salvas');
            return true;
        } catch (error: unknown) {
            this.saveStatus.set('Não foi possível salvar. Tente novamente.');
            const detail = error instanceof Error ? error.message : 'Verifique sua conexão e tente novamente.';
            this.messageService.add({ severity: 'error', summary: 'Erro ao salvar visita', detail });
            return false;
        } finally {
            this.saving.set(false);
        }
    }

    async saveComplete(): Promise<void> {
        if (!this.validateSteps(4)) {
            this.visibleDateVisit = false;
            return;
        }
        if (await this.persist(true)) {
            this.visibleDateVisit = false;
            await this.router.navigate(['/crm/visit']);
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

    private async filterTypeSalesperson(types: ISalespersonType): Promise<Salesperson[]> {
        try {
            return await lastValueFrom(this.salespersonService.filterType(types));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.emessage ?? 'Não foi possível carregar os dados. Tente novamente.', icon: 'pi pi-times' });
            return [];
        }
    }

    private async getUser(): Promise<HttpResponse<User>> {
        try {
            return await lastValueFrom(this.userService.getUser());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.emessage ?? 'Não foi possível carregar os dados. Tente novamente.', icon: 'pi pi-times' });
            return error;
        }
    }

    openDateVisit(): void {
        if (this.saving() || this.initializing() || !this.validateSteps(4)) return;
        this.visibleDateVisit = true;
    }
}
