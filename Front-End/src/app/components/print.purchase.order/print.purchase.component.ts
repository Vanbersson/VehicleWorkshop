import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import printJS from 'print-js';

import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';

@Component({
  selector: 'app-printPurchase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print.purchase.component.html',
  styleUrl: './print.purchase.component.scss'
})
export class PrintPurchaseComponent {
  purchaseOrder = signal<PurchaseOrder>(new PurchaseOrder());
  totalItemsDiscount = signal<number>(0);
  totalItemsPrice = signal<number>(0);
  purchaseOrderItems = signal<PurchaseOrderItem[]>([]);
  purchaseOrderItemsCons = signal<PurchaseOrderItemCons[]>([]);

  estoque = TypePurchaseOrderEnum.ESTOQUE;
  consumo = TypePurchaseOrderEnum.CONSUMO;

  constructor() { }

  public async print(pu: PurchaseOrder, itemsEstoque: PurchaseOrderItem[], itemsConsumo: PurchaseOrderItemCons[]) {
    this.purchaseOrder.set(pu);
    if (this.purchaseOrder().type === TypePurchaseOrderEnum.ESTOQUE) {
      const items = Array.from(
        { length: 40 },
        (_, index) => itemsEstoque[index] ?? new PurchaseOrderItem()
      );
      this.purchaseOrderItems.set(items);
    } else {
      const items = Array.from(
        { length: 40 },
        (_, index) => itemsConsumo[index] ?? new PurchaseOrderItem()
      );
      this.purchaseOrderItemsCons.set(items);
    }
    this.totalItem();
    setTimeout(() => {
      const print = document.getElementById('print-sectionId');
      if (!print) {
        console.error('Elemento print-sectionId não encontrado.');
        return;
      }
      print.style.display = 'block';
      printJS({
        printable: 'print-sectionId',
        type: 'html',
        targetStyles: ['*'],
        scanStyles: true,
        documentTitle: 'Pedido de compra',
        font_size: '8pt'
      });
      print.style.display = 'none';
    }, 100);
  }

  private totalItem() {
    var tempDiscount: number = 0;
    var tempPrice: number = 0;
    if (this.purchaseOrder().type === TypePurchaseOrderEnum.ESTOQUE) {
      for (let item of this.purchaseOrderItems()) {
        tempDiscount += item.discount!;
        tempPrice += item.price! * item.quantity!;
      }
    } else {
      for (let item of this.purchaseOrderItemsCons()) {
        tempDiscount += item.discount!;
        tempPrice += item.price! * item.quantity!;
      }
    }

    this.totalItemsDiscount.set(tempDiscount);
    this.totalItemsPrice.set(tempPrice);
  }

}
