import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import printJS from 'print-js';
import { ManualOrderBranding, manualOrderLogoData } from '@/app/pages/crm/new.customer/manual.order/manual.order.branding';
import { fitManualOrderToPage } from './manual.order.layout';
import { buildManualOrderHtml, MANUAL_ORDER_PRINT_STYLE, ManualOrderProduct, ManualOrderValues } from './manual.order.print';

@Component({
    selector: 'p-manual-order-print',
    standalone: true,
    imports: [ButtonModule],
    templateUrl: './manual.order.print.component.html',
    styleUrl: './manual.order.print.component.scss'
})
export class ManualOrderPrintComponent {
    readonly printing = input(false);
    readonly disabled = input(false);
    readonly printRequested = output<void>();
    readonly printError = output<string>();

    async print(values: ManualOrderValues, products: ManualOrderProduct[], branding: ManualOrderBranding, attendanceId: number | null): Promise<void> {
        const [resaleLogo, brandLogo] = await Promise.all([manualOrderLogoData(branding.resaleLogo, 'da revenda'), manualOrderLogoData(branding.brandLogo, 'da marca')]);
        const printable = await fitManualOrderToPage(buildManualOrderHtml(values, products, { ...branding, resaleLogo, brandLogo }), MANUAL_ORDER_PRINT_STYLE);
        printJS({
            printable,
            type: 'raw-html',
            documentTitle: `Pedido manual - Atendimento ${attendanceId ?? ''}`,
            style: MANUAL_ORDER_PRINT_STYLE,
            scanStyles: false,
            onError: () => this.printError.emit('Não foi possível abrir a impressão do pedido. Tente novamente.')
        });
    }
}
