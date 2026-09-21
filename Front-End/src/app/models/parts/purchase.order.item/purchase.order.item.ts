import { PurchaseOrderItemId } from "./purchase.order.item.id";

export class PurchaseOrderItem {
    id: PurchaseOrderItemId = new PurchaseOrderItemId();
    itemOrder: number | null = null;
    itemCode: string = '';
    itemDescription: string = '';
    quantity: number | null = null;
    discount: number | null = null;
    price: number | null = null;
}