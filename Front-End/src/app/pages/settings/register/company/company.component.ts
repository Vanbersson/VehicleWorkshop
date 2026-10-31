import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Company, Resale } from '@/app/models/company';
import { CompanyService } from '@/app/services/company.service';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
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
    readonly companies = signal<Company[]>([]);
    readonly resales = signal<Resale[]>([]);
    readonly selectedCompany = signal<Company | null>(null);
    readonly loading = signal(false);
    readonly loadingResales = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    readonly resaleError = signal('');
    readonly saveError = signal('');
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
        private messages: MessageService
    ) {}
    ngOnInit(): void {
        void this.load();
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
    async selectCompany(company: Company): Promise<void> {
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
    open(kind: 'company' | 'resale', item?: Company): void {
        if (this.saving() || this.loading() || (kind === 'resale' && !this.selectedCompany())) return;
        if (kind === 'company' && !item && (this.companies().length > 0 || this.loadError())) return;
        this.dialogKind = kind;
        this.editingId = item?.id;
        this.form.reset({ status: this.enabled, name: '', cnpj: '', ie: '', email: '', cellphone: '', phone: '', zipCode: '', state: '', city: '', neighborhood: '', address: '', addressNumber: '', addressComplement: '' });
        if (item) this.form.patchValue({ ...item, cnpj: item.cnpj?.replace(/\D/g, '') ?? '', zipCode: item.zipCode?.replace(/\D/g, '') ?? '' });
        this.saveError.set('');
        this.dialogVisible = true;
    }
    async save(): Promise<void> {
        if (this.saving()) return;
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
        const data = { ...this.form.getRawValue(), ...(this.editingId ? { id: this.editingId } : {}) };
        for (const key of Object.keys(data) as (keyof typeof data)[]) {
            if (typeof data[key] === 'string') (data as Record<string, unknown>)[key] = (data[key] as string).trim();
        }
        this.saving.set(true);
        try {
            const { ie, ...companyData } = data;
            if (this.dialogKind === 'company') await lastValueFrom(this.service.saveCompany(companyData));
            else await lastValueFrom(this.service.saveResale({ ...companyData, ie, companyId: company!.id }));
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
    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 409) return 'Já existe um cadastro com esse CNPJ.';
            return error.error?.emessage || error.error?.message || fallback;
        }
        return error instanceof Error ? error.message : fallback;
    }
}
