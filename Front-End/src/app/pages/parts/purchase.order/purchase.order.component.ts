import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { User } from '@/app/models/user';
import { TypePayment } from '@/app/models/type.payment';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { UserService } from '@/app/services/user/user.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { TypePaymentService } from '@/app/services/client/type.payment.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { StatusDeliveryEnum } from '@/app/models/parts/status.delivery.enum';
import { PurchaseOrderService } from '@/app/services/parts/purchase.order.service';


@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, InputTextModule, IconFieldModule,
    InputIconModule, ToastModule, InputGroupModule, TagModule],
  templateUrl: './purchase.order.component.html',
  styleUrl: './purchase.order.component.scss',
  providers: [MessageService]
})
export default class PurchaseOrderComponent implements OnInit {
  purchaseOrders = signal<PurchaseOrder[]>([]);
  listResponsibles: User[] = [];
  listPayments: TypePayment[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    private purchaseOrderService: PurchaseOrderService,
    private paymentService: TypePaymentService,
    private loadingService: LoadingService,

  ) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    this.loadingService.show();
    this.listOpenPurchaseorder();
    const resultUserRole = await this.filterUserRoleId(3);
    if (resultUserRole.status == 200 && resultUserRole.body?.status == StatusSuccessError.succes) {
      this.listResponsibles = resultUserRole.body.data;
    }
    this.listPayments = await this.listAllEnabledTypePayment();
    this.loadingService.hide();
  }

  //Save new
  newPurchaseOrder() {
    this.router.navigateByUrl('part/purchase/order/maintenance/0');
  }

  edit(id: number) {
    this.router.navigateByUrl(`part/purchase/order/maintenance/${id}`);
  }

  private async listOpenPurchaseorder() {
    const listOpen = await this.filterOpenPurchaseOrder();
    const dataNow = new Date();
    dataNow.setHours(0, 0, 0, 0);
    this.purchaseOrders.set([]);
    for (let i of listOpen) {
      i.statusDelivery = this.compararDatas(dataNow, new Date(i.dateDelivery!));
      this.purchaseOrders().push(i);
    }
  }

  private compararDatas(dateNow: Date, dateDelivery: Date): StatusDeliveryEnum {
    const diff = dateDelivery.getTime() - dateNow.getTime();
    if (diff > 0) return StatusDeliveryEnum.ONTIME;
    if (diff < 0) return StatusDeliveryEnum.LATE;
    return StatusDeliveryEnum.TODAY;
  }

  abreviaNome(name: string): string {
    if (name.length <= 22) {
      return name;
    }
    return name.substring(0, 22);
  }
  getStatusSeverity(status: string): any {
    switch (status) {
      case StatusDeliveryEnum.TODAY:
        return 'info';
      case StatusDeliveryEnum.ONTIME:
        return 'success';
      case StatusDeliveryEnum.LATE:
        return 'danger';
    }
    return "danger";
  }

  private async filterUserRoleId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.filterRoleId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async filterOpenPurchaseOrder(): Promise<PurchaseOrder[]> {
    try {
      return await lastValueFrom(this.purchaseOrderService.filterOpen());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async listAllEnabledTypePayment(): Promise<TypePayment[]> {
    try {
      return await lastValueFrom(this.paymentService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
}
