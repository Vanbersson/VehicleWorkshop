import { UserService } from '@/app/services/user/user.service';
import { User } from '@/app/models/user';
import { HttpResponse } from '@angular/common/http';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { BrandService } from '@/app/services/brand/brand.service';
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
    let brands: jasmine.SpyObj<BrandService>;
    let users: jasmine.SpyObj<UserService>;
    let printer: jasmine.Spy;
    let messages: jasmine.Spy;
    beforeEach(async () => {
        order = Object.assign(new PurchaseOrder(), { id: 42, companyId: 1, resaleId: 2, generationDate: '2026-10-31', clientCompanyName: 'Fornecedor' });
        service = jasmine.createSpyObj('CompanyService', ['resales']);
        service.resales.and.returnValue(of([resale]));
        brands = jasmine.createSpyObj('BrandService', ['listAll']);
        brands.listAll.and.returnValue(of([]));
        users = jasmine.createSpyObj('UserService', ['filterId']);
        printer = jasmine.createSpy('print').and.callFake((options) => options.onLoadingEnd());
        messages = jasmine.createSpy('add');
        TestBed.configureTestingModule({
            imports: [PrintPurchaseComponent],
            providers: [
                { provide: CompanyService, useValue: service },
                { provide: UserService, useValue: users },
                { provide: BrandService, useValue: brands },
                { provide: MessageService, useValue: { add: messages } },
                { provide: PURCHASE_ORDER_PRINTER, useValue: printer }
            ]
        });
        await TestBed.compileComponents();
        component = TestBed.createComponent(PrintPurchaseComponent).componentInstance;
    });
    it('prints the actual resale identification and escapes record content', async () => {
        order.information = '<script>alert(1)</script>';
        await component.print(order, [], []);
        const html = printer.calls.mostRecent().args[0].printable as string;
        for (const text of ['Revenda &amp; Filhos', '12.345.678/0001-90', '123456789', '(11) 3333-4444', '31/10/2026', 'Fornecedor', '&lt;script&gt;']) expect(html).toContain(text);
        expect(html).not.toContain('<script>');
    });
    it('embeds the logos of the order resale and its linked brand', async () => {
        service.resales.and.returnValue(of([{ ...resale, logoUrl: 'resale/logo.png', brandId: 7 }]));
        brands.listAll.and.returnValue(of([{ id: 7, name: 'Marca vinculada', status: StatusEnabDisabEnum.ENABLED, logoUrl: 'brand/logo.png' }]));
        const fetchLogo = spyOn(window, 'fetch').and.callFake(async () => new Response(new Blob(['logo'], { type: 'image/png' })));
        spyOn(HTMLImageElement.prototype, 'decode').and.resolveTo();
        await component.print(order, [], []);
        const html = printer.calls.mostRecent().args[0].printable as string;
        expect(fetchLogo.calls.count()).toBe(2);
        expect(html.match(/<img\b/g)?.length).toBe(2);
        expect(html).toContain('data:image/png;base64,');
        expect(html).toContain('Logo da revenda Revenda &amp; Filhos');
        expect(html).toContain('Logo da marca Marca vinculada');
    });
    it('prints without image placeholders when logos are not registered', async () => {
        await component.print(order, [], []);
        expect(printer.calls.mostRecent().args[0].printable).not.toContain('<img');
        expect(brands.listAll).not.toHaveBeenCalled();
    });
    it('prints the resale address and the email of the order buyer', async () => {
        service.resales.and.returnValue(of([{ ...resale, address: 'Rua Central', addressNumber: '120', addressComplement: 'Sala 2', neighborhood: 'Centro', city: 'Campinas', state: 'SP', zipCode: '13000000' }]));
        order.responsibleUserId = 9;
        const buyer = Object.assign(new User(), { id: 9, companyId: 1, resaleId: 2, email: 'comprador@example.com' });
        users.filterId.and.returnValue(of(new HttpResponse({ body: { status: StatusSuccessError.succes, header: '', message: '', data: buyer } })));
        await component.print(order, [], []);
        const html = printer.calls.mostRecent().args[0].printable as string;
        expect(users.filterId).toHaveBeenCalledWith(9);
        expect(html).toContain('comprador@example.com');
        expect(html).toContain('Rua Central, 120, Sala 2 - Centro - Campinas / SP - CEP 13000-000');
    });
    it('prints every item, without padding or truncating at forty', async () => {
        const items = Array.from({ length: 45 }, (_, i) => Object.assign(new PurchaseOrderItem(), { itemCode: `CODE-${i}`, itemDescription: `Item ${i}`, quantity: 2, price: 10, discount: 1 }));
        await component.print(order, items, []);
        const html = printer.calls.mostRecent().args[0].printable as string;
        expect(html).toContain('CODE-44');
        expect((html.match(/<tr\b/g) || []).length).toBe(46);
        expect(html.replace(/\s/g, '')).toContain('R$855,000');
    });
    it('selects consumption items and handles mixed orders', async () => {
        const stock = Object.assign(new PurchaseOrderItem(), { itemDescription: 'Stock-only' });
        const consumption = Object.assign(new PurchaseOrderItemCons(), { description: 'Consumption-only' });
        order.type = TypePurchaseOrderEnum.CONSUMO;
        await component.print(order, [stock], [consumption]);
        expect(printer.calls.mostRecent().args[0].printable).not.toContain('Stock-only');
        order.type = TypePurchaseOrderEnum.BOTH;
        await component.print(order, [stock], [consumption]);
        expect(printer.calls.mostRecent().args[0].printable).toContain('Stock-only');
        expect(printer.calls.mostRecent().args[0].printable).toContain('Consumption-only');
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
