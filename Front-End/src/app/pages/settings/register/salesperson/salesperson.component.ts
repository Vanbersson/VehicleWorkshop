import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';

import { Salesperson } from '@/app/models/crm/salesperson';
import { User } from '@/app/models/user';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { UserService } from '@/app/services/user/user.service';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { SalespersonGroupService } from '@/app/services/salesperson/salesperson.group.service';
import { SalespersonGroup } from '@/app/models/salesperson/salesperson.group';
import { SalesTypeEnum } from '@/app/models/crm/sales.type.enum';
import { SalespersonTypeEnum } from '@/app/models/crm/salesperson.type.enum';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { YesNotEnum } from '@/app/models/yes.not.enum';

@Component({
    selector: 'app-salesperson',
    standalone: true,
    imports: [
        FormsModule,
        IconFieldModule,
        InputIconModule,
        CommonModule,
        TagModule,
        ButtonModule,
        TableModule,
        ToastModule,
        CheckboxModule,
        RadioButtonModule,
        MultiSelectModule,
        SelectModule,
        DialogModule,
        InputTextModule,
        InputNumberModule,
        ReactiveFormsModule
    ],
    templateUrl: './salesperson.component.html',
    styleUrl: './salesperson.component.scss',
    providers: [MessageService]
})
export default class SalespersonComponent implements OnInit {
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
    readonly loadingSalespersons = signal(false);
    readonly loadError = signal('');
    selectedStatus: StatusEnabDisabEnum | null = null;
    readonly statusOptions = [
        { label: 'Habilitado', value: StatusEnabDisabEnum.ENABLED },
        { label: 'Desabilitado', value: StatusEnabDisabEnum.DISABLED }
    ];
    visible: boolean = false;

    formPerson = new FormGroup({
        status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
        typeSales: new FormControl<SalespersonTypeEnum>(SalespersonTypeEnum.INTERNAL),
        typeSalesPart: new FormControl<string[] | null>(null),
        typeSalesService: new FormControl<string[] | null>(null),
        typeSalesVehicle: new FormControl<string[] | null>(null),
        id: new FormControl<number | null>({ value: null, disabled: true }),
        name: new FormControl<string>('', [Validators.required]),
        user: new FormControl<User | null>(null, Validators.required),
        limitDiscount: new FormControl<number>(0, [Validators.required, Validators.min(0), Validators.max(100)]),
        groups: new FormControl<SalespersonGroup[]>([], Validators.required)
    });

    attendantsUser = signal<User[]>([]);
    groups = signal<SalespersonGroup[]>([]);

    constructor(
        private messageService: MessageService,
        private userService: UserService,
        private loadingService: LoadingService,
        private salespersonService: SalespersonService,
        private salespersonGroupService: SalespersonGroupService
    ) {}
    ngOnInit(): void {
        this.init();
    }

    private async init() {
        this.loadingService.show();
        await this.loadSalespersons();
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
            typeSalesVehicle: null
        });
        this.salesperson = null as any;
    }

    newSalesperson() {
        this.isNewSalesperson = true;
        this.cleanForm();
        this.showDialog();
    }

    save() {
        this.formPerson.markAllAsTouched();
        if (this.isNewSalesperson) {
            this.saveNewPerson();
        } else {
            this.saveUpdatePerson();
        }
    }

    private async saveNewPerson() {
        const { value, valid } = this.formPerson;
        if (!valid) {
            return;
        }
        this.salesperson = new Salesperson();
        this.salesperson.status = value.status!;
        this.salesperson.typeSales = value.typeSales!;
        this.salesperson.typeSalesPart = value.typeSalesPart?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
        this.salesperson.typeSalesService = value.typeSalesService?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
        this.salesperson.typeSalesVehicle = value.typeSalesVehicle?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
        this.salesperson.name = value.name!;
        this.salesperson.userId = value.user?.id!;

        this.salesperson.limitDiscount = value.limitDiscount!;
        this.salesperson.groupIds = value?.groups!.map((g: SalespersonGroup) => g.id).join(',') ?? '';
        this.loadingService.show();
        const resultSave = await this.savePerson(this.salesperson);
        if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
            this.salesperson = resultSave.body.data;
            this.isNewSalesperson = false;
            await this.loadSalespersons();
        }
        this.loadingService.hide();
        if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
        }
    }

    async edit(id: number) {
        this.cleanForm();
        this.loadingService.show();
        const result = await this.filterIdPerson(id);
        this.loadingService.hide();
        if (result.status == 200) {
            this.salesperson = result.body!;
            this.isNewSalesperson = false;
            this.formPerson.patchValue({
                status: this.salesperson.status,
                typeSales: this.salesperson.typeSales,
                typeSalesPart: this.salesperson.typeSalesPart == YesNotEnum.YES ? [YesNotEnum.YES] : null,
                typeSalesService: this.salesperson.typeSalesService == YesNotEnum.YES ? [YesNotEnum.YES] : null,
                typeSalesVehicle: this.salesperson.typeSalesVehicle == YesNotEnum.YES ? [YesNotEnum.YES] : null,
                id: this.salesperson.id,
                name: this.salesperson.name,
                user: this.attendantsUser().find((u) => u.id == this.salesperson.userId) ?? null,

                limitDiscount: this.salesperson.limitDiscount,
                groups: this.salesperson.groupIds ? this.groups().filter((g) => this.salesperson.groupIds.split(',').includes(g.id!.toString())) : []
            });
            this.showDialog();
        }
    }

    private async saveUpdatePerson() {
        const { value, valid } = this.formPerson;
        if (!valid) {
            return;
        }
        this.loadingService.show();
        this.salesperson.status = value.status!;
        this.salesperson.typeSales = value.typeSales!;
        this.salesperson.typeSalesPart = value.typeSalesPart?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
        this.salesperson.typeSalesService = value.typeSalesService?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
        this.salesperson.typeSalesVehicle = value.typeSalesVehicle?.includes(YesNotEnum.YES) ? YesNotEnum.YES : YesNotEnum.NOT;
        this.salesperson.name = value.name?.trim().toLocaleLowerCase()!;
        this.salesperson.userId = value.user?.id!;
        this.salesperson.limitDiscount = value.limitDiscount!;
        this.salesperson.groupIds = value?.groups!.map((g: SalespersonGroup) => g.id).join(',') ?? '';
        const resultSave = await this.updatePerson(this.salesperson);
        this.loadingService.hide();
        if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
            await this.loadSalespersons();
        }
        if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
        }
    }

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

    private async listAllGroups(): Promise<SalespersonGroup[]> {
        try {
            return await lastValueFrom(this.salespersonGroupService.listAllEnabled());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return [];
        }
    }
    private async filterUserEnabled(): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.userService.listAllEnabled());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return error;
        }
    }

    async loadSalespersons(): Promise<void> {
        if (this.loadingSalespersons()) return;
        this.loadingSalespersons.set(true);
        this.loadError.set('');
        try {
            this.salespersons.set(await lastValueFrom(this.salespersonService.listAll()));
        } catch (error: unknown) {
            this.loadError.set('Não foi possível carregar os vendedores. Tente novamente.');
        } finally {
            this.loadingSalespersons.set(false);
        }
    }
    clearFilters(table: Table, search: HTMLInputElement): void {
        table.clear();
        search.value = '';
        this.selectedStatus = null;
    }
    private async filterIdPerson(id: number): Promise<HttpResponse<Salesperson>> {
        try {
            return await lastValueFrom(this.salespersonService.filterId(id));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return error;
        }
    }

    private async savePerson(p: Salesperson): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.salespersonService.save(p));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return error;
        }
    }
    private async updatePerson(p: Salesperson): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.salespersonService.update(p));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
            return error;
        }
    }
}
