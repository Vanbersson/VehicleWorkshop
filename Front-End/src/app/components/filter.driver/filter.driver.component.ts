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
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
//Class
import { Driver } from '@/app/models/driver';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { DriverService } from '@/app/services/driver/driver.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
    selector: 'app-filterdriver',
    standalone: true,
    imports: [
        TagModule,
        CommonModule,
        DialogModule,
        ButtonModule,
        TableModule,
        InputTextModule,
        ToastModule,
        InputGroupModule,
        ReactiveFormsModule,
        FormsModule,
        InputMaskModule,
        InputNumberModule,
        RadioButtonModule,
        InputIconModule,
        IconFieldModule
    ],
    templateUrl: './filter.driver.component.html',
    styleUrl: './filter.driver.component.scss',
    providers: [MessageService]
})
export class FilterDriverComponent {
    @Output() public outputDriver = new EventEmitter<Driver>();
    @Input() isDisabled: boolean = false;

    readonly loading = signal(false);
    readonly searched = signal(false);
    readonly searchError = signal('');
    resultQuery = '';
    private searchVersion = 0;
    enabled = StatusEnabDisabEnum.ENABLED;
    disabled = StatusEnabDisabEnum.DISABLED;

    //Filter Client
    listDrivers = signal<Driver[]>([]);
    dialogSelectDriver: Driver | null = null;
    dialogVisibleDriver: boolean = false;

    formDriver = new FormGroup({
        id: new FormControl<number | null>(null),
        name: new FormControl<string>(''),
        cpf: new FormControl<string>(''),
        rg: new FormControl<string | null>(null),
        cnhRegister: new FormControl<string | null>(null)
    });

    constructor(
        private driverService: DriverService,
        private messageService: MessageService
    ) {}

    maskCPF(cpf: string): string {
        if (cpf == '') return '';
        const CPF = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6, 9) + '-' + cpf.substring(9, 11);
        return CPF;
    }
    public showDialog() {
        if (this.isDisabled) return;
        this.dialogVisibleDriver = true;
        this.cleanForm();
        this.dialogSelectDriver = null;
    }
    public hideDialog() {
        this.dialogVisibleDriver = false;
        ++this.searchVersion;
        this.loading.set(false);
    }
    cleanForm() {
        ++this.searchVersion;
        this.loading.set(false);
        this.searched.set(false);
        this.searchError.set('');
        this.resultQuery = '';
        this.formDriver.patchValue({
            id: null,
            name: '',
            cpf: '',
            rg: null,
            cnhRegister: null
        });
        this.listDrivers.set([]);
        this.dialogSelectDriver = null;
    }
    public async selectDriver() {
        if (this.isDisabled || this.loading()) return;
        if (this.dialogSelectDriver) {
            if (this.dialogSelectDriver.status == this.enabled) {
                this.outputDriver.emit(this.dialogSelectDriver);
                this.hideDialog();
            }
        }
    }
    async filterDriver(): Promise<void> {
        if (this.loading() || this.isDisabled) return;
        this.dialogSelectDriver = null;
        this.resultQuery = '';
        this.listDrivers.set([]);
        this.searchError.set('');
        const value = this.formDriver.getRawValue();
        const name = value.name?.trim();
        if (!value.id && !name && !value.cpf && !value.rg && !value.cnhRegister) {
            this.searchError.set('Informe um código, nome ou documento para pesquisar.');
            return;
        }
        const version = ++this.searchVersion;
        this.loading.set(true);
        this.searched.set(true);
        try {
            let result: HttpResponse<MessageResponse>;
            if (value.id) result = await this.filterDriverId(value.id);
            else if (name) result = await this.filterDriverName(name);
            else if (value.cpf) result = await this.filterDriverCPF(value.cpf);
            else if (value.rg) result = await this.filterDriverRG(String(value.rg));
            else result = await this.filterDriverCNHRegister(String(value.cnhRegister));
            if (version !== this.searchVersion) return;
            if (result.status !== 200 || result.body?.status !== StatusSuccessError.succes) {
                this.searchError.set(result.body?.message || 'Não foi possível concluir a pesquisa. Tente novamente.');
                return;
            }
            const data = result.body.data;
            this.listDrivers.set(Array.isArray(data) ? data : data ? [data] : []);
        } catch {
            if (version === this.searchVersion) this.searchError.set('Não foi possível concluir a pesquisa. Tente novamente.');
        } finally {
            if (version === this.searchVersion) this.loading.set(false);
        }
    }
    private async filterDriverId(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.driverService.filterId(id));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterDriverName(name: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.driverService.filterName(name));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterDriverCPF(cpf: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.driverService.filterCPF(cpf));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterDriverRG(rg: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.driverService.filterRG(rg));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterDriverCNHRegister(cnh: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.driverService.filterCNHRegister(cnh));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }
}
