import { Component, inject, InjectionToken, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import printJS from 'print-js';
import { CompanyService } from '@/app/services/company.service';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';
import { purchasePrintHtml, PURCHASE_PRINT_STYLES } from './purchase.order.print';
export const PURCHASE_ORDER_PRINTER = new InjectionToken<typeof printJS>('Purchase order printer', { providedIn: 'root', factory: () => printJS });
@Component({ selector: 'app-printPurchase', standalone: true, templateUrl: './print.purchase.component.html', styleUrl: './print.purchase.component.scss' })
export class PrintPurchaseComponent {
    private readonly companies = inject(CompanyService);
    private readonly messages = inject(MessageService);
    private readonly printer = inject(PURCHASE_ORDER_PRINTER);
    readonly printing = signal(false);
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
            const printable = purchasePrintHtml(snapshot, resale, stockSnapshot, consumptionSnapshot);
            await new Promise<void>((resolve, reject) =>
                this.printer({ type: 'raw-html', printable, style: PURCHASE_PRINT_STYLES, documentTitle: `Pedido de compra ${snapshot.id ?? ''}`, onLoadingEnd: resolve, onPrintDialogClose: resolve, onError: reject })
            );
        } catch {
            this.messages.add({ severity: 'error', summary: 'Impressão', detail: 'Não foi possível preparar a impressão. Verifique os dados da revenda e tente novamente.' });
        } finally {
            this.printing.set(false);
        }
    }
}
