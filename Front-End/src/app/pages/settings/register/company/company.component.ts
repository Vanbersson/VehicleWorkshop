import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';
import { Brand } from '@/app/models/brand';
import { BrandService } from '@/app/services/brand/brand.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CompanyService } from '@/app/services/company.service';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { ICompany, CompanySave } from '@/app/interfaces/conf-company/i.company';
import { IResale } from '@/app/interfaces/conf-company/i.resale';
import { environment } from '@/environments/environment';
const requiredText = () => new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)] });
@Component({
    selector: 'p-company',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, InputMaskModule, SelectModule, TableModule, TagModule, ToastModule],
    templateUrl: './company.component.html',
    styleUrl: './company.component.scss',
    providers: [MessageService]
})
export default class CompanyComponent implements OnInit {
    readonly companies = signal<ICompany[]>([]);
    readonly resales = signal<IResale[]>([]);
    readonly selectedCompany = signal<ICompany | null>(null);
    readonly loading = signal(false);
    readonly loadingResales = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    readonly resaleError = signal('');
    readonly saveError = signal('');
    readonly brands = signal<Brand[]>([]);
    readonly loadingBrands = signal(false);
    readonly brandError = signal('');
    readonly brandOptions = computed(() => this.brands().map((brand) => ({ ...brand, disabled: brand.status !== this.enabled })));
    private originalBrandId: number | null = null;
    readonly logoPreview = signal('');
    readonly logoError = signal('');
    readonly readingLogo = signal(false);
    private logoFile: File | null = null;
    private logoRemoved = false;
    private logoRequest = 0;
    readonly enabled = StatusEnabDisabEnum.ENABLED;
    readonly statuses = [
        { label: 'Habilitado', value: StatusEnabDisabEnum.ENABLED },
        { label: 'Desabilitado', value: StatusEnabDisabEnum.DISABLED }
    ];
    readonly states = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
    private resaleRequest = 0;
    editingId: number | undefined;
    dialogKind: 'company' | 'resale' = 'company';
    dialogVisible = false;
    readonly form = new FormGroup({
        brandId: new FormControl<number | null>(null),
        status: new FormControl(StatusEnabDisabEnum.ENABLED, { nonNullable: true, validators: [Validators.required] }),
        name: requiredText(),
        cnpj: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{14}$/)] }),
        ie: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(30)] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(255)] }),
        cellphone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
        phone: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
        zipCode: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{8}$/)] }),
        state: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^[A-Z]{2}$/)] }),
        city: requiredText(),
        neighborhood: requiredText(),
        address: requiredText(),
        addressNumber: requiredText(),
        addressComplement: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] })
    });
    constructor(
        private service: CompanyService,
        private messages: MessageService,
        private brandService: BrandService
    ) {}
    ngOnInit(): void {
        void this.load();
        void this.loadBrands();
    }
    async loadBrands(): Promise<void> {
        if (this.loadingBrands()) return;
        this.loadingBrands.set(true);
        this.brandError.set('');
        try {
            this.brands.set(await lastValueFrom(this.brandService.listAll()));
        } catch (error: unknown) {
            this.brandError.set(this.errorMessage(error, 'Não foi possível carregar as marcas.'));
        } finally {
            this.loadingBrands.set(false);
        }
    }
    brandName(id: number | null | undefined): string {
        return id == null ? 'Não informada' : (this.brands().find((brand) => brand.id === id)?.name ?? 'Marca #' + id);
    }
    async load(): Promise<void> {
        if (this.loading() || this.saving()) return;
        this.loading.set(true);
        this.loadError.set('');
        try {
            const list = await lastValueFrom(this.service.list());
            this.companies.set(list);
            const selected = list.find((item) => item.id === this.selectedCompany()?.id) ?? list[0];
            if (selected) await this.selectCompany(selected);
            else {
                ++this.resaleRequest;
                this.selectedCompany.set(null);
                this.resales.set([]);
                this.loadingResales.set(false);
            }
        } catch (error: unknown) {
            this.loadError.set(this.errorMessage(error, 'Não foi possível carregar as empresas.'));
        } finally {
            this.loading.set(false);
        }
    }
    async selectCompany(company: ICompany): Promise<void> {
        const request = ++this.resaleRequest;
        this.selectedCompany.set(company);
        this.resales.set([]);
        this.resaleError.set('');
        this.loadingResales.set(true);
        try {
            const result = await lastValueFrom(this.service.resales(company.id));
            if (request === this.resaleRequest) this.resales.set(result);
        } catch (error: unknown) {
            if (request === this.resaleRequest) this.resaleError.set(this.errorMessage(error, 'Não foi possível carregar as revendas.'));
        } finally {
            if (request === this.resaleRequest) this.loadingResales.set(false);
        }
    }
    open(kind: 'company' | 'resale', item?: ICompany | IResale): void {
        if (this.saving() || this.loading() || this.readingLogo() || (kind === 'resale' && !this.selectedCompany())) return;
        if (kind === 'company' && !item && (this.companies().length > 0 || this.loadError())) return;
        this.dialogKind = kind;
        this.editingId = item?.id;
        this.originalBrandId = kind === 'resale' && item && 'companyId' in item ? (item.brandId ?? null) : null;
        ++this.logoRequest;
        this.logoFile = null;
        this.logoRemoved = false;
        this.logoError.set('');
        this.logoPreview.set(kind === 'resale' ? this.logoImageUrl(item?.logoUrl) : '');
        this.form.reset({ brandId: null, status: this.enabled, name: '', cnpj: '', ie: '', email: '', cellphone: '', phone: '', zipCode: '', state: '', city: '', neighborhood: '', address: '', addressNumber: '', addressComplement: '' });
        if (item) this.form.patchValue({ ...item, cnpj: item.cnpj?.replace(/\D/g, '') ?? '', zipCode: item.zipCode?.replace(/\D/g, '') ?? '' });
        this.saveError.set('');
        this.dialogVisible = true;
    }
    async save(): Promise<void> {
        if (this.saving() || this.readingLogo()) return;
        if (this.dialogKind === 'company' && !this.editingId && (this.companies().length > 0 || this.loading() || this.loadError())) {
            this.saveError.set('É permitido cadastrar apenas uma empresa. Atualize a lista para editar o cadastro existente.');
            return;
        }
        this.form.markAllAsTouched();
        this.saveError.set('');
        if (this.form.invalid) {
            this.saveError.set('Revise os campos obrigatórios, o CNPJ, o CEP e o e-mail.');
            return;
        }
        const company = this.selectedCompany();
        if (this.dialogKind === 'resale' && !company) return;
        const brandId = this.form.controls.brandId.value;
        if (this.dialogKind === 'resale' && brandId != null && brandId !== this.originalBrandId && !this.brands().some((brand) => brand.id === brandId && brand.status === this.enabled)) {
            this.saveError.set('Selecione uma marca habilitada.');
            return;
        }
        const data: CompanySave & { brandId: number | null } = { ...this.form.getRawValue(), ...(this.editingId ? { id: this.editingId } : {}) };
        for (const key of Object.keys(data) as (keyof typeof data)[]) {
            if (typeof data[key] === 'string') (data as Record<string, unknown>)[key] = (data[key] as string).trim();
        }
        this.saving.set(true);
        try {
            const { ie, brandId, ...companyData } = data;
            if (this.dialogKind === 'company') await lastValueFrom(this.service.saveCompany(companyData));
            else {
                const resale = await lastValueFrom(this.service.saveResale({ ...companyData, ie, brandId, companyId: company!.id }));
                this.editingId = resale.id;
                this.originalBrandId = resale.brandId ?? null;
                try {
                    if (this.logoFile) {
                        const updated = await lastValueFrom(this.service.saveResaleLogo(company!.id, resale.id, this.logoFile));
                        this.logoPreview.set(this.logoImageUrl(updated.logoUrl));
                    } else if (this.logoRemoved) await lastValueFrom(this.service.removeResaleLogo(company!.id, resale.id));
                    this.logoFile = null;
                    this.logoRemoved = false;
                } catch (error: unknown) {
                    this.saveError.set('Os dados da revenda foram salvos. ' + this.errorMessage(error, 'Não foi possível atualizar a logo. Tente salvar novamente.'));
                    this.saving.set(false);
                    return;
                }
            }
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível salvar o cadastro.'));
            this.saving.set(false);
            return;
        }
        this.dialogVisible = false;
        this.messages.add({ severity: 'success', summary: 'Cadastro salvo', detail: this.dialogKind === 'company' ? 'Empresa salva com sucesso.' : 'Revenda salva com sucesso.' });
        // A refresh failure after saving must not invite a duplicate creation.
        try {
            if (this.dialogKind === 'company') {
                const list = await lastValueFrom(this.service.list());
                this.companies.set(list);
                const saved = list.find((item) => (this.editingId ? item.id === this.editingId : item.cnpj.replace(/\D/g, '') === data.cnpj));
                if (saved) await this.selectCompany(saved);
            } else await this.selectCompany(company!);
        } catch (error: unknown) {
            this.loadError.set(this.errorMessage(error, 'Cadastro salvo. Atualize a lista para visualizar as alterações.'));
        } finally {
            this.saving.set(false);
        }
    }
    formatCnpj(value: string): string {
        return value.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
        if (!file || this.saving() || this.readingLogo() || this.dialogKind !== 'resale') return;
        this.logoError.set('');
        if (!['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) {
            this.logoError.set('Selecione uma imagem PNG ou JPEG de até 5 MB.');
            return;
        }
        const request = ++this.logoRequest;
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
            if (request !== this.logoRequest) return;
            this.logoFile = file;
            this.logoRemoved = false;
            this.logoPreview.set(dataUrl);
        } catch (error: unknown) {
            if (request === this.logoRequest) this.logoError.set(this.errorMessage(error, 'A imagem selecionada não é válida.'));
        } finally {
            URL.revokeObjectURL(preview);
            if (request === this.logoRequest) this.readingLogo.set(false);
        }
    }
    removeLogo(): void {
        if (this.saving() || this.readingLogo()) return;
        ++this.logoRequest;
        this.logoFile = null;
        this.logoRemoved = true;
        this.logoPreview.set('');
        this.logoError.set('');
    }
    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 409) return 'Já existe um cadastro com esse CNPJ.';
            return error.error?.emessage || error.error?.message || fallback;
        }
        return error instanceof Error ? error.message : fallback;
    }
}
