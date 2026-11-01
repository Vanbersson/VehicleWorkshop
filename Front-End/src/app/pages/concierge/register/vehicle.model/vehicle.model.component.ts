import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//primeNG
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { RadioButtonModule } from 'primeng/radiobutton';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { VehicleModel } from '@/app/models/vehicle.model';
import { VehicleModelService } from '@/app/services/vehicle/vehicle.model.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
    selector: 'app-vehicle.model.register',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, InputIconModule, TableModule, TagModule, SelectModule, ButtonModule, DialogModule, InputTextModule, RadioButtonModule, ToastModule, IconFieldModule],
    templateUrl: './vehicle.model.component.html',
    styleUrl: './vehicle.model.component.scss',
    providers: [MessageService]
})
export default class VehicleModelComponent implements OnInit {
    readonly loadingModels = signal(false);
    readonly loadError = signal('');
    selectedStatus: StatusEnabDisabEnum | null = null;
    readonly statusOptions = [
        { label: StatusEnabDisabEnum.ENABLED, value: StatusEnabDisabEnum.ENABLED },
        { label: StatusEnabDisabEnum.DISABLED, value: StatusEnabDisabEnum.DISABLED }
    ];
    clearFilters(table: Table, input: HTMLInputElement): void {
        this.selectedStatus = null;
        input.value = '';
        table.clear();
    }
    isNewModel: boolean = true;
    enabled = StatusEnabDisabEnum.ENABLED;
    disabled = StatusEnabDisabEnum.DISABLED;
    models = signal<VehicleModel[]>([]);
    model!: VehicleModel;
    dialogVisible: boolean = false;

    formModel = new FormGroup({
        description: new FormControl<string>('', Validators.required),
        status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.DISABLED, Validators.required)
    });

    constructor(
        private vehicleModelService: VehicleModelService,
        private storageService: StorageService,
        private messageService: MessageService,
        private loadingService: LoadingService
    ) {}

    ngOnInit(): void {
        this.listaModel();
    }
    listaModel(): void {
        if (this.loadingModels()) return;
        this.loadingModels.set(true);
        this.loadError.set('');
        this.loadingService.show();
        this.vehicleModelService.listAll().subscribe({
            next: (data) => {
                this.models.set(data);
                this.loadingModels.set(false);
                this.loadingService.hide();
            },
            error: () => {
                this.loadError.set('Não foi possível carregar os modelos de veículos.');
                this.loadingModels.set(false);
                this.loadingService.hide();
            }
        });
    }
    hideDialog() {
        this.dialogVisible = false;
    }
    showDialog() {
        this.cleanForm();
        this.dialogVisible = true;
    }
    cleanForm() {
        this.formModel.reset({
            description: '',
            status: this.enabled
        });
    }

    edit(mod: VehicleModel) {
        this.isNewModel = false;
        this.showDialog();
        this.model = mod;

        this.formModel.patchValue({
            description: mod.description,
            status: mod.status
        });
    }

    showNewModel() {
        this.isNewModel = true;
        this.model = new VehicleModel();
        this.showDialog();
    }

    save() {
        if (this.formModel.invalid) {
            this.formModel.markAllAsTouched();
            return;
        }
        if (this.isNewModel) {
            this.saveNewModel();
        } else {
            this.saveUpdateModel();
        }
    }

    private async saveNewModel() {
        const { valid, value } = this.formModel;
        if (!valid) {
            return;
        }

        this.model.companyId = this.storageService.companyId;
        this.model.resaleId = this.storageService.resaleId;
        this.model.status = value.status!;
        this.model.description = value.description!;
        //Fecha load
        this.loadingService.show();
        const resultSave = await this.saveModel(this.model);
        //Fecha load
        this.loadingService.hide();
        if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
            this.model = resultSave.body.data;
            this.isNewModel = false;
            this.listaModel();
        }
        if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
        }
    }
    private async saveUpdateModel() {
        const { valid, value } = this.formModel;
        if (!valid) {
            return;
        }

        this.model.status = value.status!;
        this.model.description = value.description!;
        //Fecha load
        this.loadingService.show();
        const resultSave = await this.updateModel(this.model);
        //Fecha load
        this.loadingService.hide();
        if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
            this.model = resultSave.body.data;
            this.listaModel();
        }
        if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
        }
    }

    private async saveModel(mod: VehicleModel): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleModelService.save(mod));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
            return error;
        }
    }
    private async updateModel(mod: VehicleModel): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.vehicleModelService.update(mod));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
            return error;
        }
    }
}
