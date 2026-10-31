import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { Table, TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { Brand } from '@/app/models/brand';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { BrandService } from '@/app/services/brand/brand.service';
import { MessageResponse } from '@/app/models/message-response';
import { LoadingService } from '@/app/services/loading/loading.service';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-brand',
    standalone: true,
    imports: [FormsModule, SelectModule, TagModule, CommonModule, InputTextModule, IconFieldModule, RadioButtonModule, InputIconModule, ButtonModule, InputNumberModule, ReactiveFormsModule, TableModule, ToastModule, DialogModule],
    templateUrl: './brand.component.html',
    styleUrl: './brand.component.scss',
    providers: [MessageService]
})
export default class BrandComponent implements OnInit {
    isNewBrand: boolean = true;
    private brand!: Brand;
    enabled = StatusEnabDisabEnum.ENABLED;
    disabled = StatusEnabDisabEnum.DISABLED;

    formBrand = new FormGroup({
        status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
        name: new FormControl<string>('', [Validators.required, Validators.maxLength(100)])
    });

    listBrands = signal<Brand[]>([]);
    readonly loadingBrands = signal(false);
    readonly loadError = signal('');
    selectedStatus: StatusEnabDisabEnum | null = null;
    readonly statusOptions = [
        { label: 'Habilitada', value: StatusEnabDisabEnum.ENABLED },
        { label: 'Desabilitada', value: StatusEnabDisabEnum.DISABLED }
    ];
    dialogVisible: boolean = false;

    constructor(
        private loading: LoadingService,
        private brandService: BrandService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        void this.loadBrands();
    }

    async loadBrands(): Promise<void> {
        if (this.loadingBrands()) return;
        this.loadingBrands.set(true);
        this.loadError.set('');
        try {
            this.listBrands.set(await lastValueFrom(this.brandService.listAll()));
        } catch (error: unknown) {
            this.loadError.set('Não foi possível carregar as marcas. Tente novamente.');
        } finally {
            this.loadingBrands.set(false);
        }
    }
    clearFilters(table: Table, search: HTMLInputElement): void {
        table.clear();
        search.value = '';
        this.selectedStatus = null;
    }
    showNewBrand() {
        this.isNewBrand = true;
        this.brand = new Brand();
        this.cleanForm();
        this.showDialog();
    }
    showDialog() {
        this.dialogVisible = true;
    }
    hideDialog() {
        this.dialogVisible = false;
    }
    cleanForm() {
        this.formBrand.reset({
            name: '',
            status: this.enabled
        });
    }
    edit(b: Brand) {
        this.isNewBrand = false;
        this.brand = b;
        this.cleanForm();
        this.showDialog();

        this.formBrand.patchValue({
            name: this.brand.name,
            status: this.brand.status
        });
    }
    save() {
        this.formBrand.markAllAsTouched();
        if (this.isNewBrand) {
            this.saveNewBrand();
        } else {
            this.saveUpdateBrand();
        }
    }

    private async saveNewBrand() {
        const { value, valid } = this.formBrand;
        if (!valid) {
            return;
        }
        this.brand.name = value.name!;
        this.brand.status = value.status!;

        this.loading.show();
        const result = await this.saveNew(this.brand);
        this.loading.hide();
        if (result.status == 201 && result.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
            this.hideDialog();
            void this.loadBrands();
        }
        if (result.status == 201 && result.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
        }
        if (result.status == 401) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: result.body?.message });
        }
    }
    private async saveUpdateBrand() {
        const { value, valid } = this.formBrand;
        if (!valid) {
            return;
        }
        this.brand.name = value.name!;
        this.brand.status = value.status!;

        this.loading.show();
        const result = await this.saveUpdate(this.brand);
        this.loading.hide();
        if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
            this.hideDialog();
            void this.loadBrands();
        }
        if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
            this.hideDialog();
            void this.loadBrands();
        }
        if (result.status == 401) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: result.body?.message });
        }
    }

    private async saveNew(b: Brand): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.brandService.save(b));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
            return error;
        }
    }
    private async saveUpdate(b: Brand): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.brandService.update(b));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
            return error;
        }
    }
}
