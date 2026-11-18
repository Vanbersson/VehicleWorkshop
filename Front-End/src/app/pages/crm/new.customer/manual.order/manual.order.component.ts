import { Component, Input, OnChanges, OnDestroy, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MultiSelectModule } from 'primeng/multiselect';
import { lastValueFrom } from 'rxjs';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { CompanyService } from '@/app/services/company.service';
import { BrandService } from '@/app/services/brand/brand.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { ManualOrderBranding, manualOrderLogoUrl } from './manual.order.branding';
import { ClientCompany } from '@/app/models/client.company';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { manualOrderClientValues, manualOrderQuoteProducts } from './manual.order.prefill';
import { ManualOrderPrintComponent } from '@/app/pages/crm/new.customer/manual.order.print.component/manual.order.print.component';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { MANUAL_ORDER_SECTIONS } from './manual.order.fields';
import { manualOrderTotals, ManualOrderProduct, ManualOrderValues } from '@/app/pages/crm/new.customer/manual.order.print.component/manual.order.print';

@Component({
    selector: 'p-manual-order',
    standalone: true,
    imports: [ManualOrderPrintComponent, CommonModule, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule, SelectModule, MultiSelectModule, TextareaModule],
    templateUrl: './manual.order.component.html',
    styleUrl: './manual.order.component.scss'
})
export class ManualOrderComponent implements OnChanges, OnDestroy {
    @Input() attendanceId: number | null = null;
    @Input() clientId: number | null = null;
    @Input() companyId: number | null = null;
    @Input() resaleId: number | null = null;
    @Input() clientName = '';
    @Input() salespersonName = '';
    readonly sections = MANUAL_ORDER_SECTIONS;
    readonly requiredValidator = Validators.required;
    readonly supportControls: Record<string, FormControl<string[]>> = {
        tipperSupports: new FormControl<string[]>([], { nonNullable: true }),
        canvasSupports: new FormControl<string[]>([], { nonNullable: true }),
        aluminumSupports: new FormControl<string[]>([], { nonNullable: true })
    };
    readonly form = this.createForm();

    visible = false;
    readonly printing = signal(false);
    readonly printError = signal('');
    readonly loadingData = signal(false);
    readonly loadError = signal('');
    readonly additionalProducts = new FormArray<ReturnType<ManualOrderComponent['productForm']>>([]);
    private dataVersion = 0;

    constructor(
        private clientService: ClientCompanyService,
        private attendanceService: CustomerAttendanceService,
        private companyService: CompanyService,
        private brandService: BrandService,
        private storageService: StorageService
    ) {
        for (const [key, control] of Object.entries(this.supportControls)) {
            control.valueChanges.pipe(takeUntilDestroyed()).subscribe((values) => {
                this.form.controls[key].setValue(values.join(', '));
                this.form.controls[key].markAsDirty();
            });
        }
    }

    private createForm(): FormGroup<Record<string, FormControl<string | number | null>>> {
        const controls: Record<string, FormControl<string | number | null>> = {};
        for (const section of this.sections) {
            for (const field of section.fields) {
                const validator = ['client', 'seller', 'product', 'date'].includes(field.key) ? Validators.required : field.numeric ? Validators.min(0) : null;
                controls[field.key] = new FormControl<string | number | null>(field.numeric ? null : '', validator);
            }
        }
        return new FormGroup(controls);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['attendanceId']) {
            this.reset();
            return;
        }
        if (changes['clientName'] && this.form.controls['client'].pristine) this.form.controls['client'].setValue(this.clientName);
        if (changes['salespersonName'] && this.form.controls['seller'].pristine) this.form.controls['seller'].setValue(this.salespersonName);
        if (changes['clientId'] || changes['companyId'] || changes['resaleId']) {
            ++this.dataVersion;
            this.loadingData.set(false);
            if (this.visible) void this.loadDefaults();
        }
    }

    private reset(): void {
        ++this.dataVersion;
        this.loadingData.set(false);
        this.additionalProducts.clear();
        this.visible = false;
        this.form.reset();
        for (const control of Object.values(this.supportControls)) control.reset([], { emitEvent: false });
        this.form.patchValue({ client: this.clientName, seller: this.salespersonName, quantity: 1, date: new Date().toLocaleDateString('pt-BR') });
        this.printError.set('');
        this.loadError.set('');
    }

    ngOnDestroy(): void {
        ++this.dataVersion;
    }

    get totals(): ReturnType<typeof manualOrderTotals> {
        return manualOrderTotals(this.form.getRawValue(), this.additionalProducts.getRawValue());
    }

    async open(): Promise<void> {
        this.visible = true;
        await this.loadDefaults();
    }

    async loadDefaults(): Promise<void> {
        if (this.loadingData()) return;
        const version = ++this.dataVersion;
        this.loadingData.set(true);
        this.loadError.set('');
        const results = await Promise.allSettled([this.loadClient(version), this.loadQuote(version)]);
        if (version !== this.dataVersion) return;
        this.loadError.set(
            results
                .filter((result) => result.status === 'rejected')
                .map((result) => (result.reason instanceof Error ? result.reason.message : 'Não foi possível carregar os dados do pedido.'))
                .join(' ')
        );
        this.loadingData.set(false);
    }

    private patchPristine(values: ManualOrderValues): void {
        for (const [key, value] of Object.entries(values)) {
            const control = this.form.controls[key];
            if (control?.pristine) control.setValue(value);
        }
    }

    private async loadClient(version: number): Promise<void> {
        if (this.clientId == null) return;
        const clientId = this.clientId;
        try {
            const response = await lastValueFrom(this.clientService.filterId(clientId));
            if (version !== this.dataVersion) return;
            if (response.body?.status !== StatusSuccessError.succes || response.body.data?.id !== clientId) throw new Error();
            this.patchPristine(manualOrderClientValues(response.body.data as ClientCompany));
        } catch {
            throw new Error('Não foi possível carregar os dados do cliente.');
        }
    }

    private async loadQuote(version: number): Promise<void> {
        if (this.attendanceId == null) return;
        const attendanceId = this.attendanceId;
        try {
            const response = await lastValueFrom(this.attendanceService.getQuote(attendanceId));
            if (version !== this.dataVersion) return;
            if (response.attendance?.id !== attendanceId) throw new Error();
            if (!response.quote) return;
            const products = manualOrderQuoteProducts(response.quote);
            const canFillProducts = ['product', 'quantity', 'unitPrice', 'discount'].every((key) => this.form.controls[key].pristine) && this.additionalProducts.pristine;
            if (canFillProducts) {
                const [first, ...others] = products;
                if (first) this.patchPristine({ ...first });
                //this.additionalProducts.clear();
                //mostra apenas o primeiro item do orçamento, os demais são ignorados para não poluir o formulário
                //for (const product of others) this.additionalProducts.push(this.productForm(product));
            }
            this.patchPristine({ notes: response.quote.notes });
        } catch {
            throw new Error('Não foi possível carregar os itens do orçamento.');
        }
    }

    private async loadBranding(): Promise<ManualOrderBranding> {
        const companyId = this.companyId ?? this.storageService.companyId;
        const resaleId = this.resaleId ?? this.storageService.resaleId;
        if (!companyId || !resaleId) throw new Error('Não foi possível identificar a revenda do atendimento.');
        const resales = await lastValueFrom(this.companyService.resales(companyId));
        const resale = resales.find((item) => item.id === resaleId && item.companyId === companyId);
        if (!resale) throw new Error('Não foi possível localizar a revenda do atendimento.');
        const brands = resale.brandId != null ? await lastValueFrom(this.brandService.listAll()) : [];
        const brand = brands.find((item) => item.id === resale.brandId);
        if (resale.brandId != null && !brand) throw new Error('Não foi possível localizar a marca vinculada à revenda.');
        return { resaleName: resale.name, resaleLogo: manualOrderLogoUrl(resale.logoUrl), brandName: brand?.name, brandLogo: manualOrderLogoUrl(brand?.logoUrl) };
    }

     private productForm(product: ManualOrderProduct) {
        return new FormGroup({
            product: new FormControl(product.product, { nonNullable: true, validators: Validators.required }),
            quantity: new FormControl(product.quantity, { nonNullable: true, validators: [Validators.required, Validators.min(0.001)] }),
            unitPrice: new FormControl(product.unitPrice, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
            discount: new FormControl(product.discount, { nonNullable: true, validators: [Validators.required, Validators.min(0)] })
        });
    } 

    async print(printer: ManualOrderPrintComponent): Promise<void> {
        if (this.printing() || this.loadingData()) return;
        if (!this.validate()) return;
        this.printing.set(true);
        try {
            const branding = await this.loadBranding();
            await printer.print(this.form.getRawValue(), this.additionalProducts.getRawValue(), branding, this.attendanceId);
        } catch (error: unknown) {
            this.printError.set(error instanceof Error ? error.message : 'Não foi possível preparar a impressão. Tente novamente.');
        } finally {
            this.printing.set(false);
        }
    }

    private validate(): boolean {
        this.form.markAllAsTouched();
        this.additionalProducts.markAllAsTouched();
        this.printError.set('');
        if (this.form.invalid || this.additionalProducts.invalid || ['client', 'seller', 'product', 'date'].some((key) => !String(this.form.controls[key].value ?? '').trim())) {
            this.printError.set('Preencha cliente, responsável pelas vendas, produto e data. Os valores não podem ser negativos.');
            return false;
        }
        const values = this.form.getRawValue();
        const products = [{ product: String(values['product']), quantity: Number(values['quantity']), unitPrice: Number(values['unitPrice']), discount: Number(values['discount']) }, ...this.additionalProducts.getRawValue()];
        if (products.some((item) => !item.product.trim() || item.discount > Math.round(item.quantity * item.unitPrice * 100) / 100)) {
            this.printError.set('Informe o produto e um desconto que não ultrapasse o valor de cada item.');
            return false;
        }
        return true;
    }
}
