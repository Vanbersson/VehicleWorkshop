import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { StatusDeliveryEnum } from '@/app/models/parts/status.delivery.enum';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';
import { PurchaseOrderService } from '@/app/services/parts/purchase.order.service';

type PurchaseOrderRow = Omit<PurchaseOrder, 'dateDelivery' | 'statusDelivery'> & { dateDelivery: Date | null; statusDelivery: StatusDeliveryEnum | null };

@Component({
    selector: 'app-purchase-order',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, InputTextModule, IconFieldModule, InputIconModule, ToastModule, TagModule, SelectModule],
    templateUrl: './purchase.order.component.html',
    styleUrl: './purchase.order.component.scss',
    providers: [MessageService]
})
export default class PurchaseOrderComponent implements OnInit {
    readonly purchaseOrders = signal<PurchaseOrderRow[]>([]);
    readonly loading = signal(false);
    readonly loadError = signal('');
    selectedDelivery: StatusDeliveryEnum | null = null;
    selectedType: TypePurchaseOrderEnum | null = null;
    readonly deliveryOptions = Object.values(StatusDeliveryEnum).map((value) => ({ label: value, value }));
    readonly typeOptions = [
        { label: 'Estoque', value: TypePurchaseOrderEnum.ESTOQUE },
        { label: 'Consumo', value: TypePurchaseOrderEnum.CONSUMO },
        { label: 'Ambos', value: TypePurchaseOrderEnum.BOTH }
    ];
    constructor(
        private router: Router,
        private purchaseOrderService: PurchaseOrderService
    ) {}
    ngOnInit(): void {
        this.loadPurchaseOrders();
    }
    async loadPurchaseOrders(): Promise<void> {
        if (this.loading()) return;
        this.loading.set(true);
        this.loadError.set('');
        try {
            const orders = await lastValueFrom(this.purchaseOrderService.filterOpen());
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.purchaseOrders.set(
                orders.map((order) => {
                    const delivery = this.deliveryDate(order.dateDelivery);
                    const deadline = delivery ? new Date(delivery) : null;
                    deadline?.setHours(0, 0, 0, 0);
                    const status = deadline ? (deadline.getTime() === today.getTime() ? StatusDeliveryEnum.TODAY : deadline < today ? StatusDeliveryEnum.LATE : StatusDeliveryEnum.ONTIME) : null;
                    return { ...order, dateDelivery: delivery, statusDelivery: status };
                })
            );
        } catch {
            this.loadError.set('Não foi possível carregar os pedidos de compra. Tente novamente.');
        } finally {
            this.loading.set(false);
        }
    }
    private deliveryDate(value: Date | string): Date | null {
        if (!value) return null;
        const date = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(Number(value.slice(0, 4)), Number(value.slice(5, 7)) - 1, Number(value.slice(8, 10))) : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }
    clearFilters(table: Table, input: HTMLInputElement): void {
        table.clear();
        input.value = '';
        this.selectedDelivery = null;
        this.selectedType = null;
    }
    newPurchaseOrder(): void {
        this.router.navigateByUrl('part/purchase/order/maintenance/0');
    }
    edit(id: number): void {
        this.router.navigateByUrl(`part/purchase/order/maintenance/${id}`);
    }
    getStatusSeverity(status: StatusDeliveryEnum | null): 'info' | 'success' | 'danger' | 'secondary' {
        switch (status) {
            case StatusDeliveryEnum.TODAY:
                return 'info';
            case StatusDeliveryEnum.ONTIME:
                return 'success';
            case StatusDeliveryEnum.LATE:
                return 'danger';
            default:
                return 'secondary';
        }
    }
}
