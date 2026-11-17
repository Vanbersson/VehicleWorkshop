import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { environment } from '@/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';

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
    readonly saving = signal(false);
    readonly readingLogo = signal(false);
    readonly logoPreview = signal('');
    readonly logoError = signal('');
    readonly saveError = signal('');
    private logoFile: File | null = null;
    private logoRemoved = false;

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
        if (this.saving() || this.readingLogo()) return;
        this.isNewBrand = true;
        this.brand = new Brand();
        this.cleanForm();
        this.showDialog();
    }
    showDialog() {
        this.dialogVisible = true;
    }
    hideDialog() {
        if (this.saving() || this.readingLogo()) return;
        this.dialogVisible = false;
    }
    cleanForm() {
        this.logoFile = null;
        this.logoRemoved = false;
        this.logoError.set('');
        this.saveError.set('');
        this.logoPreview.set(this.logoImageUrl(this.brand?.logoUrl));
        this.formBrand.reset({
            name: '',
            status: this.enabled
        });
    }
    edit(b: Brand) {
        if (this.saving() || this.readingLogo()) return;
        this.isNewBrand = false;
        this.brand = { ...b };
        this.cleanForm();
        this.showDialog();

        this.formBrand.patchValue({
            name: this.brand.name,
            status: this.brand.status
        });
    }
    async save(): Promise<void> {
        if (this.saving() || this.readingLogo()) return;
        this.formBrand.markAllAsTouched();
        this.saveError.set('');
        const { name, status } = this.formBrand.getRawValue();
        if (this.formBrand.invalid || !name?.trim() || !status) {
            this.saveError.set('Informe o nome e o status da marca.');
            return;
        }
        if (!this.isNewBrand && !this.brand.id) {
            this.saveError.set('Atualize a lista e reabra a marca salva para enviar a logo.');
            return;
        }
        this.saving.set(true);
        this.loading.show();
        let registrationSaved = false;
        try {
            const data: Brand = { ...this.brand, name: name.trim(), status };
            const result = await lastValueFrom(this.isNewBrand ? this.brandService.save(data) : this.brandService.update(data));
            if (result.body?.status !== StatusSuccessError.succes) throw new Error(result.body?.message || 'Não foi possível salvar a marca.');
            registrationSaved = true;
            this.isNewBrand = false;
            const saved: Brand | null = result.body.data;
            if (!saved?.id) throw new Error('Atualize a lista e reabra a marca salva para enviar a logo.');
            this.brand = { ...saved };
            if (this.logoFile) this.brand = await lastValueFrom(this.brandService.saveLogo(saved.id, this.logoFile));
            else if (this.logoRemoved) this.brand = await lastValueFrom(this.brandService.removeLogo(saved.id));
            this.logoFile = null;
            this.logoRemoved = false;
            this.dialogVisible = false;
            this.messageService.add({ severity: 'success', summary: 'Marca', detail: 'Cadastro salvo com sucesso.' });
            await this.loadBrands();
        } catch (error: unknown) {
            const message = error instanceof HttpErrorResponse ? error.error?.emessage || error.error?.message || 'Não foi possível salvar a logo. Tente novamente.' : error instanceof Error ? error.message : 'Não foi possível salvar a marca.';
            this.saveError.set((registrationSaved ? 'Os dados da marca foram salvos. ' : '') + message);
        } finally {
            this.loading.hide();
            this.saving.set(false);
        }
    }
    logoImageUrl(value: string | null | undefined): string {
        if (!value) return '';
        try {
            const url = new URL(value.replace(/^\/+/, ''), environment.apiuUrl.replace(/\/+$/, '') + '/');
            return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
        } catch {
            return '';
        }
    }
    async selectLogo(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        input.value = '';
        if (!file || this.saving() || this.readingLogo()) return;
        this.logoError.set('');
        if (!['image/png', 'image/jpeg'].includes(file.type) || file.size === 0 || file.size > 5 * 1024 * 1024) {
            this.logoError.set('Selecione uma imagem PNG ou JPEG de até 5 MB.');
            return;
        }
        this.readingLogo.set(true);
        const preview = URL.createObjectURL(file);
        try {
            const image = new Image();
            image.src = preview;
            await image.decode();
            if (image.naturalWidth > 4096 || image.naturalHeight > 2048) throw new Error('A logo deve ter no máximo 4096 × 2048 pixels.');
            const dataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
                reader.readAsDataURL(file);
            });
            this.logoFile = file;
            this.logoRemoved = false;
            this.logoPreview.set(dataUrl);
        } catch (error: unknown) {
            this.logoError.set(error instanceof Error ? error.message : 'A imagem selecionada não é válida.');
        } finally {
            URL.revokeObjectURL(preview);
            this.readingLogo.set(false);
        }
    }
    removeLogo(): void {
        if (this.saving() || this.readingLogo()) return;
        this.logoFile = null;
        this.logoRemoved = true;
        this.logoPreview.set('');
        this.logoError.set('');
    }
}
