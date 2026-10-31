import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { Table } from 'primeng/table';
import PurchaseOrderComponent from './purchase.order.component';
import { PurchaseOrderService } from '@/app/services/parts/purchase.order.service';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { StatusDeliveryEnum } from '@/app/models/parts/status.delivery.enum';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';

describe('Purchase order list', () => {
    let component: PurchaseOrderComponent;
    let orders: jasmine.SpyObj<PurchaseOrderService>;
    let router: jasmine.SpyObj<Router>;
    beforeEach(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(2026, 9, 31, 12));
        orders = jasmine.createSpyObj('Orders', ['filterOpen']);
        router = jasmine.createSpyObj('Router', ['navigateByUrl']);
        orders.filterOpen.and.returnValue(of([]));
        TestBed.configureTestingModule({ providers: [PurchaseOrderComponent, { provide: PurchaseOrderService, useValue: orders }, { provide: Router, useValue: router }] });
        component = TestBed.inject(PurchaseOrderComponent);
    });
    afterEach(() => jasmine.clock().uninstall());
    it('classifies delivery dates by calendar day without mutating API records', async () => {
        const today = Object.assign(new PurchaseOrder(), { id: 1, dateDelivery: new Date(2026, 9, 31, 18) });
        const late = Object.assign(new PurchaseOrder(), { id: 2, dateDelivery: '2026-10-30' });
        const future = Object.assign(new PurchaseOrder(), { id: 3, dateDelivery: '2026-11-01' });
        const invalid = Object.assign(new PurchaseOrder(), { id: 4, dateDelivery: 'invalid' });
        orders.filterOpen.and.returnValue(of([today, late, future, invalid]));
        await component.loadPurchaseOrders();
        expect(component.purchaseOrders().map((order) => order.statusDelivery)).toEqual([StatusDeliveryEnum.TODAY, StatusDeliveryEnum.LATE, StatusDeliveryEnum.ONTIME, null]);
        expect(today.statusDelivery).toBe(StatusDeliveryEnum.ONTIME);
        expect(component.purchaseOrders()[1].dateDelivery?.getDate()).toBe(30);
        expect(component.purchaseOrders()[3].dateDelivery).toBeNull();
    });
    it('preserves the last results on failure and allows retry', async () => {
        orders.filterOpen.and.returnValue(of([Object.assign(new PurchaseOrder(), { id: 1 })]));
        await component.loadPurchaseOrders();
        orders.filterOpen.and.returnValue(throwError(() => new Error('offline')));
        await component.loadPurchaseOrders();
        expect(component.purchaseOrders().length).toBe(1);
        expect(component.loadError()).toBeTruthy();
        expect(component.loading()).toBeFalse();
        orders.filterOpen.and.returnValue(of([]));
        await component.loadPurchaseOrders();
        expect(component.loadError()).toBe('');
        expect(component.purchaseOrders()).toEqual([]);
    });
    it('ignores duplicate refreshes while loading', async () => {
        const response = new Subject<PurchaseOrder[]>();
        orders.filterOpen.and.returnValue(response);
        const pending = component.loadPurchaseOrders();
        await component.loadPurchaseOrders();
        expect(orders.filterOpen).toHaveBeenCalledTimes(1);
        expect(component.loading()).toBeTrue();
        response.next([]);
        response.complete();
        await pending;
        expect(component.loading()).toBeFalse();
    });
    it('clears search and both delivery and type filters', () => {
        const clear = jasmine.createSpy('clear');
        const table = { clear } as unknown as Table;
        const input = document.createElement('input');
        input.value = 'supplier';
        component.selectedDelivery = StatusDeliveryEnum.LATE;
        component.selectedType = TypePurchaseOrderEnum.CONSUMO;
        component.clearFilters(table, input);
        expect(clear).toHaveBeenCalled();
        expect(input.value).toBe('');
        expect(component.selectedDelivery).toBeNull();
        expect(component.selectedType).toBeNull();
    });
    it('preserves navigation for creating and editing orders', () => {
        component.newPurchaseOrder();
        component.edit(42);
        expect(router.navigateByUrl).toHaveBeenCalledWith('part/purchase/order/maintenance/0');
        expect(router.navigateByUrl).toHaveBeenCalledWith('part/purchase/order/maintenance/42');
    });
});
