import { Component, EventEmitter, Input, model, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//PrimeNG
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IPartFilter } from '@/app/interfaces/i.part.filter';
import { PartService } from '@/app/services/parts/part.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
    selector: 'app-filter-parts',
    standalone: true,
    imports: [IconFieldModule, InputIconModule, CommonModule, ButtonModule, TableModule, InputTextModule, InputGroupModule, DialogModule, ReactiveFormsModule, ToastModule, InputNumberModule],
    templateUrl: './filter.parts.component.html',
    styleUrl: './filter.parts.component.scss',
    providers: [MessageService]
})
export class FilterPartsComponent {
    visiblePart: boolean = false;
    readonly loading = signal(false);
    readonly preparing = signal(false);
    readonly searched = signal(false);
    readonly searchError = signal('');
    readonly selectionError = signal('');
    private searchVersion = 0;
    @Output() public outputPart = new EventEmitter<IPartFilter[]>();
    inputParts = model<IPartFilter[]>([]);

    disabledButtonSelected = true;
    disabledButtonDelete = true;

    listParts = signal<IPartFilter[]>([]);
    listPartsSelected = signal<IPartFilter[]>([]);
    selectedPart!: IPartFilter;
    deleteSelectPart!: IPartFilter;
    isUpdatePart: boolean = false;
    totalParts = signal<number>(0.0);
    totalPartsDiscount = signal<number>(0.0);

    formFilterParts = new FormGroup({
        filterCode: new FormControl<string>(''),
        filterDesc: new FormControl<string>('')
    });

    //Select parts
    visibleSelected: boolean = false;
    descriptionPart: string = '';

    formSelectPart = new FormGroup({
        price: new FormControl<number>(0, Validators.required),
        discount: new FormControl<number>(0, Validators.required),
        quantity: new FormControl<number>(0, Validators.required)
    });

    constructor(
        private partService: PartService,
        private loadingService: LoadingService,
        private messageService: MessageService
    ) {}

    async showDialogParts(): Promise<void> {
        if (this.preparing()) return;
        this.clearFormFilter();
        this.cleanSelected();
        this.deleteSelectPart = null!;
        this.visibleSelected = false;
        this.visiblePart = true;
        this.preparing.set(true);
        const version = this.searchVersion;
        const selected = this.inputParts().map((part) => ({ ...part }));
        this.listPartsSelected.set(selected);
        this.updateTotal();
        try {
            const hydrated = await Promise.all(
                selected.map(async (item) => {
                    const response = await this.filterCode(item.code);
                    const data = response.body?.data;
                    const matches: IPartFilter[] = Array.isArray(data) ? data : data ? [data] : [];
                    const match = matches.find((part) => part.id === item.id || part.code === item.code);
                    return match ? { ...item, unit: match.unit, brand: match.brand, group: match.group, category: match.category } : item;
                })
            );
            if (version === this.searchVersion) this.listPartsSelected.set(hydrated);
        } finally {
            this.preparing.set(false);
        }
    }

    hideDialogParts() {
        if (this.preparing() || this.loading()) return;
        ++this.searchVersion;
        this.visiblePart = false;
        this.outputPart.emit(this.listPartsSelected());
    }

    private showDialogSelectPart() {
        this.visibleSelected = true;
    }
    hideDialogSelectPart() {
        this.visibleSelected = false;
    }

    selectPartsConfirme() {
        if (this.disabledButtonSelected || !this.selectedPart || this.loading() || this.preparing()) return;
        this.selectionError.set('');
        // Verifica se já existe antes de processar
        const alreadyExists = this.listPartsSelected().some((p) => p.id === this.selectedPart.id);

        if (alreadyExists) {
            this.messageService.add({
                severity: 'info',
                summary: 'Peça',
                detail: 'Já adicionada',
                icon: 'pi pi-info-circle'
            });
            return;
        }

        // Reset
        this.formSelectPart.reset({
            price: 0,
            discount: 0,
            quantity: 0
        });
        this.descriptionPart = this.selectedPart.description;
        this.formSelectPart.get('price')?.setValue(this.selectedPart.price);
        this.isUpdatePart = false;
        this.showDialogSelectPart();
    }

    editSelectPart() {
        if (this.disabledButtonDelete || !this.deleteSelectPart || this.preparing()) return;
        this.selectionError.set('');
        this.descriptionPart = this.deleteSelectPart.description;
        this.formSelectPart.patchValue({
            price: this.deleteSelectPart.selectPrice,
            discount: this.deleteSelectPart.selectDiscount,
            quantity: this.deleteSelectPart.selectQuantity
        });
        this.isUpdatePart = true;
        this.showDialogSelectPart();
    }

    confirmSelectPart() {
        this.formSelectPart.markAllAsTouched();
        this.selectionError.set('');
        const values = this.formSelectPart.getRawValue();
        if (!Number.isFinite(values.price) || !Number.isFinite(values.quantity) || !Number.isFinite(values.discount) || values.price! <= 0 || values.quantity! <= 0 || values.discount! < 0 || values.discount! > values.price! * values.quantity!) {
            this.selectionError.set('Informe valor e quantidade maiores que zero. O desconto deve estar entre zero e o total dos itens.');
            return;
        }
        if (this.isUpdatePart) {
            const { price, quantity, discount } = this.formSelectPart.value;
            // Validação
            if (price! <= 0 || quantity! <= 0 || discount! < 0) return;
            // Desconto maior que o total
            if (discount! > price! * quantity!) return;

            if (price == null || quantity == null || discount == null) return;

            this.listPartsSelected().map((i) => {
                if (i.code == this.deleteSelectPart.code) {
                    i.selectPrice = price;
                    i.selectDiscount = discount;
                    i.selectQuantity = quantity;
                }
            });
            this.isUpdatePart = false;
            this.deleteSelectPart = null!;
            this.disabledButtonDelete = true;
            // Atualiza totais
            this.updateTotal();
        } else {
            if (this.disabledButtonSelected || !this.selectedPart) return;

            const { price, quantity, discount } = this.formSelectPart.value;

            // Validação
            if (price! <= 0 || quantity! <= 0 || discount! < 0) return;
            // Desconto maior que o total
            if (discount! > price! * quantity!) return;

            if (price == null || quantity == null || discount == null) return;

            // Monta objeto (evita mutar diretamente o selectedPart)
            const part = {
                ...this.selectedPart,
                selectPrice: price,
                selectQuantity: quantity,
                selectDiscount: discount
            };
            // Adiciona na lista
            this.listPartsSelected.set([...this.listPartsSelected(), part]);
            // Atualiza totais
            this.updateTotal();
            // Reset
            this.formSelectPart.reset({
                price: 0,
                discount: 0,
                quantity: 0
            });
            this.selectedPart = null!;
            this.disabledButtonSelected = true;
        }
        this.hideDialogSelectPart();
    }

    updateTotal() {
        let tempDiscount = 0;
        let tempPrice = 0;
        for (const i of this.listPartsSelected()) {
            tempDiscount += i.selectDiscount;
            tempPrice += i.selectPrice * i.selectQuantity - i.selectDiscount;
        }
        this.totalPartsDiscount.set(tempDiscount);
        this.totalParts.set(tempPrice);
    }

    removerSelectPart() {
        if (!this.disabledButtonDelete && this.deleteSelectPart) {
            this.listPartsSelected.set(this.listPartsSelected().filter((p) => p.id !== this.deleteSelectPart.id));
            this.disabledButtonDelete = true;
            //Atualiza totais
            this.updateTotal();
        }
    }

    async filterPart(): Promise<void> {
        if (this.loading() || this.preparing()) return;
        this.cleanSelected();
        this.listParts.set([]);
        this.searchError.set('');
        const code = this.formFilterParts.controls.filterCode.value?.trim();
        const description = this.formFilterParts.controls.filterDesc.value?.trim();
        if (!code && !description) {
            this.searchError.set('Informe um código ou uma descrição para pesquisar.');
            return;
        }
        const version = ++this.searchVersion;
        this.loading.set(true);
        this.searched.set(true);
        try {
            const response = code ? await this.filterCode(code) : await this.filterDesc(description!);
            if (version !== this.searchVersion) return;
            if (response.status !== 200 || response.body?.status !== StatusSuccessError.succes) {
                this.searchError.set(response.body?.message || 'Não foi possível pesquisar as peças. Tente novamente.');
                return;
            }
            const data = response.body.data;
            this.listParts.set(Array.isArray(data) ? data : data ? [data] : []);
        } catch {
            if (version === this.searchVersion) this.searchError.set('Não foi possível pesquisar as peças. Tente novamente.');
        } finally {
            if (version === this.searchVersion) this.loading.set(false);
        }
    }
    private async filterCode(code: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.partService.filterCode(code));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async filterDesc(desc: string): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.partService.filterDesc(desc));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message ?? 'Não foi possível concluir a pesquisa.', icon: 'pi pi-times' });
            return error;
        }
    }

    onSelectEventParts(event: any) {
        this.disabledButtonSelected = false;
        this.deleteSelectPart = null!;
        this.disabledButtonDelete = true;
    }

    onUnSelectEventParts(event: any) {
        this.disabledButtonSelected = true;
    }

    onSelectDeleteEventParts(event: any) {
        this.disabledButtonSelected = true;
        this.selectedPart = null!;
        this.disabledButtonDelete = false;
    }
    onUnSelectDeleteEventParts(event: any) {
        this.disabledButtonDelete = true;
    }

    clearFormFilter() {
        ++this.searchVersion;
        this.loading.set(false);
        this.searched.set(false);
        this.searchError.set('');
        this.listParts.set([]);
        this.cleanSelected();
        this.formFilterParts.patchValue({
            filterCode: '',
            filterDesc: ''
        });
    }
    cleanSelected() {
        this.deleteSelectPart = null!;
        this.disabledButtonSelected = true;
        this.disabledButtonDelete = true;
        this.selectedPart = null!;
    }
}
