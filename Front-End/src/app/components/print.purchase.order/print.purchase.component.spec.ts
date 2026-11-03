import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { CompanyService } from '@/app/services/company.service';
import { IResale as Resale } from '@/app/interfaces/conf-company/i.resale';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { PrintPurchaseComponent, PURCHASE_ORDER_PRINTER } from './print.purchase.component';
import { purchasePrintHtml } from './purchase.order.print';

describe('Purchase order printing', () => {
    const resale: Resale = {
        id: 2,
        companyId: 1,
        name: 'Revenda & Filhos',
        cnpj: '12345678000190',
        ie: '123456789',
        phone: '1133334444',
        cellphone: '',
        email: '',
        status: StatusEnabDisabEnum.ENABLED,
        zipCode: '',
        state: 'SP',
        city: '',
        neighborhood: '',
        address: '',
        addressNumber: '',
        addressComplement: ''
    };
    let order: PurchaseOrder;
    let component: PrintPurchaseComponent;
    let service: jasmine.SpyObj<CompanyService>;
    let printer: jasmine.Spy;
    let messages: jasmine.Spy;
    beforeEach(() => {
        order = Object.assign(new PurchaseOrder(), { id: 42, companyId: 1, resaleId: 2, generationDate: '2026-10-31', clientCompanyName: 'Fornecedor' });
        service = jasmine.createSpyObj('CompanyService', ['resales']);
        service.resales.and.returnValue(of([resale]));
        printer = jasmine.createSpy('print').and.callFake((options) => options.onLoadingEnd());
        messages = jasmine.createSpy('add');
        TestBed.configureTestingModule({ providers: [PrintPurchaseComponent, { provide: CompanyService, useValue: service }, { provide: MessageService, useValue: { add: messages } }, { provide: PURCHASE_ORDER_PRINTER, useValue: printer }] });
        component = TestBed.inject(PrintPurchaseComponent);
    });
    it('prints the actual resale identification and escapes record content', () => {
        order.information = '<script>alert(1)</script>';
        const html = purchasePrintHtml(order, resale, [], []);
        for (const text of ['Revenda &amp; Filhos', '12.345.678/0001-90', '123456789', '(11) 3333-4444', '31/10/2026', 'Fornecedor', '&lt;script&gt;']) expect(html).toContain(text);
        expect(html).not.toContain('<script>');
    });
    it('prints every item, without padding or truncating at forty', () => {
        const items = Array.from({ length: 45 }, (_, i) => Object.assign(new PurchaseOrderItem(), { itemCode: `CODE-${i}`, itemDescription: `Item ${i}`, quantity: 2, price: 10, discount: 1 }));
        const html = purchasePrintHtml(order, resale, items, []);
        expect(html).toContain('CODE-44');
        expect((html.match(/<tr>/g) || []).length).toBe(46);
        expect(html.replace(/\s/g, '')).toContain('R$855,000');
    });
    it('selects consumption items and handles mixed orders', () => {
        const stock = Object.assign(new PurchaseOrderItem(), { itemDescription: 'Stock-only' });
        const consumption = Object.assign(new PurchaseOrderItemCons(), { description: 'Consumption-only' });
        order.type = TypePurchaseOrderEnum.CONSUMO;
        expect(purchasePrintHtml(order, resale, [stock], [consumption])).not.toContain('Stock-only');
        order.type = TypePurchaseOrderEnum.BOTH;
        expect(purchasePrintHtml(order, resale, [stock], [consumption])).toContain('Stock-only');
        expect(purchasePrintHtml(order, resale, [stock], [consumption])).toContain('Consumption-only');
    });
    it('loads the order company and releases loading without a browser focus event', async () => {
        await component.print(order, [], []);
        expect(service.resales).toHaveBeenCalledWith(1);
        expect(printer).toHaveBeenCalled();
        expect(component.printing()).toBeFalse();
    });
    it('never substitutes a resale belonging to a different company', async () => {
        service.resales.and.returnValue(of([{ ...resale, companyId: 99 }]));
        await component.print(order, [], []);
        expect(printer).not.toHaveBeenCalled();
        expect(messages).toHaveBeenCalled();
        expect(component.printing()).toBeFalse();
    });
    it('allows retry after a loading or printing failure', async () => {
        service.resales.and.returnValue(throwError(() => new Error('offline')));
        await component.print(order, [], []);
        expect(component.printing()).toBeFalse();
        service.resales.and.returnValue(of([resale]));
        printer.and.callFake((options) => options.onError(new Error('printer')));
        await component.print(order, [], []);
        expect(component.printing()).toBeFalse();
        expect(messages.calls.count()).toBe(2);
    });
});
