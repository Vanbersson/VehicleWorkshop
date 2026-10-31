import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//PrimeNG
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DialogModule } from 'primeng/dialog';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StorageService } from '@/app/services/storage/storage.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
    selector: 'app-filterclient',
    standalone: true,
    imports: [TagModule, CommonModule, DialogModule, ButtonModule, TableModule, InputTextModule, InputGroupModule, ReactiveFormsModule, FormsModule, InputMaskModule, InputNumberModule, RadioButtonModule, InputIconModule, IconFieldModule],
    templateUrl: './filter.client.component.html',
    styleUrl: './filter.client.component.scss'
})
export class FilterClientComponent {
    @Output() public outputClient = new EventEmitter<ClientCompany>();
    @Input() isDisabled: boolean = false;

    readonly loading = signal(false);
    readonly searched = signal(false);
    readonly searchError = signal('');
    private searchVersion = 0;
    resultQuery = '';
    enabled = StatusEnabDisabEnum.ENABLED;
    disabled = StatusEnabDisabEnum.DISABLED;

    //Filter Client
    dialogListClientCompany = signal<ClientCompany[]>([]);
    dialogSelectClientCompany: ClientCompany | null = null;
    dialogVisibleClientCompany: boolean = false;
    formClientCompanyFilter = new FormGroup({
        clientCompanyId: new FormControl<number | null>(null),
        clientCompanyFantasia: new FormControl<string>(''),
        clientCompanyName: new FormControl<string>(''),
        clientCompanyCnpj: new FormControl<string>(''),
        clientCompanyCpf: new FormControl<string>(''),
        clientCompanyRg: new FormControl<string | null>(null),
        clientCompanyTipo: new FormControl<string>('j')
    });

    constructor(
        private clientService: ClientCompanyService,
        private storageService: StorageService
    ) {}

    //Filter Client
    public showDialogFilterClientCompany() {
        if (this.isDisabled) return;
        this.dialogVisibleClientCompany = true;
        this.cleanAll();
        this.dialogSelectClientCompany = null;
    }

    public hideDialogFilterClientCompany() {
        this.dialogVisibleClientCompany = false;
        ++this.searchVersion;
        this.loading.set(false);
    }

    public async selectClientCompany() {
        if (this.isDisabled || this.loading()) return;
        if (this.dialogSelectClientCompany) {
            if (this.dialogSelectClientCompany.status == this.enabled) {
                this.outputClient.emit(this.dialogSelectClientCompany);
                this.dialogVisibleClientCompany = false;
            }
        }
    }

    maskCNPJ(cnpj: string): string {
        if (cnpj == '') return '';
        const CNPJ = cnpj.substring(0, 2) + '.' + cnpj.substring(2, 5) + '.' + cnpj.substring(5, 8) + '/' + cnpj.substring(8, 12) + '-' + cnpj.substring(12, 14);
        return CNPJ;
    }

    maskCPF(cpf: string): string {
        if (cpf == '') return '';
        const CPF = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6, 9) + '-' + cpf.substring(9, 11);
        return CPF;
    }

    cleanAll() {
        this.resultQuery = '';
        ++this.searchVersion;
        this.loading.set(false);
        this.searched.set(false);
        this.searchError.set('');
        this.dialogSelectClientCompany = null;
        this.formClientCompanyFilter.patchValue({
            clientCompanyId: null,
            clientCompanyFantasia: '',
            clientCompanyName: '',
            clientCompanyCnpj: '',
            clientCompanyCpf: '',
            clientCompanyRg: null,
            clientCompanyTipo: 'j'
        });

        this.dialogListClientCompany.set([]);
    }

    public async filterClientCompany(): Promise<void> {
        if (this.loading() || this.isDisabled) return;
        this.dialogSelectClientCompany = null;
        this.resultQuery = '';
        this.dialogListClientCompany.set([]);
        this.searchError.set('');
        const value = this.formClientCompanyFilter.getRawValue();
        const legal = value.clientCompanyTipo === 'j';
        const name = value.clientCompanyName?.trim();
        const tradeName = value.clientCompanyFantasia?.trim();
        const document = legal ? value.clientCompanyCnpj : value.clientCompanyCpf;
        if (!value.clientCompanyId && !tradeName && !name && !document) {
            this.searchError.set('Informe um código, nome, fantasia ou documento para pesquisar.');
            return;
        }
        const version = ++this.searchVersion;
        this.loading.set(true);
        this.searched.set(true);
        try {
            let result: HttpResponse<MessageResponse>;
            if (value.clientCompanyId) result = await this.filterId(value.clientCompanyId);
            else if (tradeName) result = legal ? await this.filterJFantasia(tradeName) : await this.filterFFantasia(tradeName);
            else if (name) result = legal ? await this.filterJName(name) : await this.filterFName(name);
            else result = legal ? await this.filterCNPJ(document!) : await this.filterCPF(document!);
            if (version !== this.searchVersion) return;
            if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) {
                this.searchError.set(result.body?.message || 'Não foi possível concluir a pesquisa. Tente novamente.');
                return;
            }
            const data = result.body.data;
            this.dialogListClientCompany.set(Array.isArray(data) ? data : data ? [data] : []);
        } catch {
            if (version === this.searchVersion) this.searchError.set('Não foi possível concluir a pesquisa. Tente novamente.');
        } finally {
            if (version === this.searchVersion) this.loading.set(false);
        }
    }

    private async filterId(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterId(id));
        } catch (error: any) {
            return error;
        }
    }
    private async filterJFantasia(fantasia: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterJFantasia(fantasia));
        } catch (error: any) {
            return error;
        }
    }
    private async filterFFantasia(fantasia: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterFFantasia(fantasia));
        } catch (error: any) {
            return error;
        }
    }
    private async filterJName(name: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterJName(name));
        } catch (error: any) {
            return error;
        }
    }
    private async filterFName(name: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterFName(name));
        } catch (error: any) {
            return error;
        }
    }
    private async filterCNPJ(cnpj: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterCNPJ(cnpj));
        } catch (error: any) {
            return error;
        }
    }
    private async filterCPF(cpf: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.clientService.filterCPF(cpf));
        } catch (error: any) {
            return error;
        }
    }
}
