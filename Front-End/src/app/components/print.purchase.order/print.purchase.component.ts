import { UserService } from '@/app/services/user/user.service';
import { User } from '@/app/models/user';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { BrandService } from '@/app/services/brand/brand.service';
import { environment } from '@/environments/environment';
import { ChangeDetectorRef, Component, ElementRef, inject, InjectionToken, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import printJS from 'print-js';
import { CompanyService } from '@/app/services/company.service';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';
import { purchasePrintData } from './purchase.order.print';
export const PURCHASE_ORDER_PRINTER = new InjectionToken<typeof printJS>('Purchase order printer', { providedIn: 'root', factory: () => printJS });

@Component({
    selector: 'p-print-purchase',
    standalone: true,
    templateUrl: './print.purchase.component.html',
    styleUrl: './print.purchase.component.scss',
    encapsulation: ViewEncapsulation.ShadowDom
})
export class PrintPurchaseComponent {
    private readonly companies = inject(CompanyService);
    private readonly brands = inject(BrandService);
    private readonly users = inject(UserService);
    private readonly messages = inject(MessageService);
    private readonly printer = inject(PURCHASE_ORDER_PRINTER);
    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly printing = signal(false);
    readonly document = signal<(ReturnType<typeof purchasePrintData> & { resaleLogo: string; brandLogo: string; brandName: string; buyerEmail: string }) | null>(null);
    private readonly changeDetector = inject(ChangeDetectorRef);
    @ViewChild('printDocument') private printDocument?: ElementRef<HTMLElement>;

    display(value: unknown): string {
        return value === null || value === undefined || value === '' ? 'N\u00e3o informado' : String(value);
    }

    async print(order: PurchaseOrder, stock: PurchaseOrderItem[], consumption: PurchaseOrderItemCons[]): Promise<void> {
        if (this.printing()) return;
        this.printing.set(true);
        const snapshot = { ...order };
        const stockSnapshot = stock.map((item) => ({ ...item }));
        const consumptionSnapshot = consumption.map((item) => ({ ...item }));
        try {
            if (!snapshot.companyId || !snapshot.resaleId) throw new Error('Revenda não identificada.');
            const resales = await firstValueFrom(this.companies.resales(snapshot.companyId));
            const resale = resales.find((item) => item.id === snapshot.resaleId && item.companyId === snapshot.companyId);
            if (!resale) throw new Error('Revenda não localizada.');
            const brands = resale.brandId != null ? await firstValueFrom(this.brands.listAll()) : [];
            const brand = brands.find((item) => item.id === resale.brandId);
            if (resale.brandId != null && !brand) throw new Error('Marca vinculada nao localizada.');
            const [resaleLogo, brandLogo, buyerEmail] = await Promise.all([this.loadLogo(resale.logoUrl), this.loadLogo(brand?.logoUrl), this.loadBuyerEmail(snapshot)]);
            this.document.set({ ...purchasePrintData(snapshot, resale, stockSnapshot, consumptionSnapshot), resaleLogo, brandLogo, buyerEmail, brandName: brand?.name ?? '' });
            this.changeDetector.detectChanges();
            const printable = this.printDocument?.nativeElement.outerHTML;
            if (!printable) throw new Error('Documento indisponivel.');
            // Reuse the compiled component stylesheet in the isolated print frame.
            const style = Array.from(this.host.nativeElement.shadowRoot?.querySelectorAll('style') ?? [], (element) => element.textContent ?? '').join('\n');
            await new Promise<void>((resolve, reject) =>
                this.printer({
                    type: 'raw-html',
                    printable,
                    style,
                    documentTitle: `Pedido de compra ${snapshot.id ?? ''}`,
                    onLoadingEnd: resolve,
                    onPrintDialogClose: resolve,
                    onError: reject
                })
            );
        } catch {
            this.messages.add({ severity: 'error', summary: 'Impressão', detail: 'Não foi possível preparar a impressão. Verifique os dados e as logos da revenda e da marca e tente novamente.' });
        } finally {
            this.document.set(null);
            this.printing.set(false);
        }
    }

    private async loadBuyerEmail(order: PurchaseOrder): Promise<string> {
        if (order.responsibleUserId == null) return '';
        try {
            const response = await firstValueFrom(this.users.filterId(order.responsibleUserId));
            const buyer: User | undefined = response.body?.data;
            if (response.body?.status !== StatusSuccessError.succes || buyer?.id !== order.responsibleUserId || buyer.companyId !== order.companyId || buyer.resaleId !== order.resaleId) return '';
            return buyer.email ?? '';
        } catch {
            return '';
        }
    }

    private async loadLogo(path: string | null | undefined): Promise<string> {
        if (!path) return '';
        const url = new URL(path.replace(/^\/+/, ''), environment.apiuUrl.replace(/\/+$/, '') + '/');
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Logo invalida.');
        const response = await fetch(url.href, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Logo indisponivel.');
        const blob = await response.blob();
        if (!['image/png', 'image/jpeg'].includes(blob.type)) throw new Error('Formato de logo invalido.');
        const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Falha ao ler a logo.'));
            reader.readAsDataURL(blob);
        });
        const image = new Image();
        image.src = data;
        await image.decode();
        return data;
    }
}
