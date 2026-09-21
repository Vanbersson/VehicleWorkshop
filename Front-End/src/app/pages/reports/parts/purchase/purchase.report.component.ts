import { Component, DoCheck, EventEmitter, OnInit, Output, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
//PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { PrintPurchaseComponent } from '@/app/components/print.purchase.order/print.purchase.component';
import { ClientCompany } from '@/app/models/client.company';
import { User } from '@/app/models/user';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { UserService } from '@/app/services/user/user.service';
import { StatusPurchaseOrderEnum } from '@/app/models/parts/status.purchase.order.enum';
import { PurchaseOrderReportService } from '@/app/services/reports/part/purchase/purchase.order.report.service';
import { PrimeNG } from 'primeng/config';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { StatusDeliveryEnum } from '@/app/models/parts/status.delivery.enum';
import { PurchaseOrderService } from '@/app/services/parts/purchase.order.service';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';
import { PurchaseOrderItemConsService } from '@/app/services/parts/purchase.order.item.cons.service';
import { PurchaseOrderItemService } from '@/app/services/parts/purchase.order.item.service';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';

export interface IFilterPurchaseOrder {
  companyId: number;
  resaleId: number;
  dateInit?: Date | string;
  dateFinal?: Date | string;
  status: StatusPurchaseOrderEnum;
  clientCompanyId?: number;
  responsibleId?: number;
  id?: number;
  nfNum?: number;
}

@Component({
  selector: 'app-purchase-report',
  standalone: true,
  imports: [CommonModule, FilterClientComponent, TagModule, ReactiveFormsModule, ToastModule, TableModule, ButtonModule, InputMaskModule,
    InputTextModule, IconFieldModule, InputIconModule, InputNumberModule, SelectModule, PrintPurchaseComponent,
    InputGroupModule, RadioButtonModule, DialogModule, DatePickerModule],
  templateUrl: './purchase.report.component.html',
  styleUrl: './purchase.report.component.scss',
  providers: [MessageService]
})
export default class PurchaseReportComponent implements OnInit, DoCheck {
  purchaseOrders = signal<PurchaseOrder[]>([]);
  responsable = signal<User[]>([]);

  selectClientCompany = signal<ClientCompany>(new ClientCompany());
  dialogVisible: boolean = false;

  OPEN = StatusPurchaseOrderEnum.OPEN;
  CLOSE = StatusPurchaseOrderEnum.CLOSE;
  BOTH = StatusPurchaseOrderEnum.BOTH;

  TODAY = StatusDeliveryEnum.TODAY;
  LATE = StatusDeliveryEnum.LATE;
  ONTIME = StatusDeliveryEnum.ONTIME;

  formFilter = new FormGroup({
    dateInit: new FormControl<Date | string>(''),
    dateFinal: new FormControl<Date | string>(''),
    status: new FormControl<StatusPurchaseOrderEnum>(StatusPurchaseOrderEnum.BOTH),
    clientCompanyId: new FormControl<number | null>({ value: null, disabled: true }),
    clientCompanyName: new FormControl<string>({ value: '', disabled: true }),
    responsible: new FormControl<User | null>(null),
    purchaseOrderId: new FormControl<number | null>(null),
    nfNum: new FormControl<number | null>(null)
  });

  //Print
  @ViewChild('printComponent') printComponent!: PrintPurchaseComponent;

  constructor(private primeng: PrimeNG,
    private loadingService: LoadingService,
    private storageService: StorageService,
    private messageService: MessageService,
    private reportService: PurchaseOrderReportService,
    private userService: UserService,
    private purchaseOrderService: PurchaseOrderService,
    private purchaseOrderItemService: PurchaseOrderItemService,
    private purchaseOrderItemConsService: PurchaseOrderItemConsService
  ) { }

  ngOnInit(): void {
    this.primeng.setTranslation({
      startsWith: 'Inicia com',
      contains: 'Contém',
      notContains: 'Não contém',
      endsWith: 'Termina com',
      equals: 'Igual',
      notEquals: 'Diferente',
      noFilter: 'Sem filtro',
      lt: 'Menor que',
      lte: 'Menor ou igual',
      gt: 'Maior que',
      gte: 'Maior ou igual',
      dateIs: 'Data igual',
      dateIsNot: 'Data diferente',
      dateBefore: 'Antes de',
      dateAfter: 'Depois de',
      clear: 'Limpar',
      apply: 'Aplicar',
      matchAll: 'Corresponder a todos',
      matchAny: 'Corresponder a qualquer',
      dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
      dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
      dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
      monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
    });
    this.getResposible();
  }
  ngDoCheck(): void {
    if (this.selectClientCompany().id != null) {
      this.formFilter.patchValue({
        clientCompanyId: this.selectClientCompany().id,
        clientCompanyName: this.selectClientCompany().name
      });
    }

  }
  compararDatas(dateG: Date, dateD: Date): string {
    const diff = dateD.getTime() - dateG.getTime();
    if (diff > 0) return StatusDeliveryEnum.ONTIME;
    if (diff < 0) return StatusDeliveryEnum.LATE;
    return StatusDeliveryEnum.TODAY;
  }
  formatDateTime(date: Date): string {
    const datePipe = new DatePipe('en-US');

    // Formata a data e adiciona o fuso horário
    return datePipe.transform(date, "yyyy-MM-dd") + "T00:00:00.000-03:00";
  }
  getStatusDelivery(pu: PurchaseOrder): string {
    if (pu.status == StatusPurchaseOrderEnum.OPEN) {
      const data1 = this.formatDateTime(new Date());
      const dateDelivery = new Date(pu.dateDelivery);
      return this.compararDatas(new Date(data1), dateDelivery);
    } else {
      var status = StatusDeliveryEnum.ONTIME;
      const dateDelivery = new Date(pu.dateDelivery);
      const dateReceived = new Date(pu.dateReceived);
      const diff = dateDelivery.getTime() - dateReceived.getTime();
      if (diff < 0) status = StatusDeliveryEnum.LATE;
      return status;
    }

  }
  getStatusSeverity(pu: PurchaseOrder): any {
    var status = "";
    if (pu.status == StatusPurchaseOrderEnum.OPEN) {
      const data1 = this.formatDateTime(new Date());
      const data2 = new Date(pu.dateDelivery);
      status = this.compararDatas(new Date(data1), data2);
    } else {
      const data1 = new Date(pu.dateDelivery);
      const data2 = new Date(pu.dateReceived);

      const diff = data1.getTime() - data2.getTime();

      if (diff > 0) status = StatusDeliveryEnum.ONTIME;
      if (diff < 0) status = StatusDeliveryEnum.LATE;
      if (diff == 0) status = StatusDeliveryEnum.ONTIME;
    }
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
  abreviaNome(name: string): string {
    if (name.length <= 22) {
      return name;
    }
    return name.substring(0, 22);
  }
  public showDialog() {
    this.dialogVisible = true;
  }
  public hideDialog() {
    this.dialogVisible = false;
  }
  cleanList() {
    this.purchaseOrders.set([]);
  }
  cleanformFilter() {
    this.selectClientCompany.set(new ClientCompany());
    this.formFilter.patchValue({
      dateInit: '',
      dateFinal: '',
      status: StatusPurchaseOrderEnum.BOTH,
      clientCompanyId: null,
      clientCompanyName: '',
      responsible: null,
      purchaseOrderId: null,
      nfNum: null
    });
  }

  async searchPurchaseOrder() {
    this.formFilter.get('clientCompanyId')?.enable();
    const { value } = this.formFilter;
    let filter: IFilterPurchaseOrder = {
      companyId: this.storageService.companyId,
      resaleId: this.storageService.resaleId,
      dateInit: value.dateInit != '' ? this.formatDateTime(new Date(value.dateInit!)) : "",
      dateFinal: value.dateFinal != '' ? this.formatDateTime(new Date(value.dateFinal!)) : "",
      status: value.status!,
      clientCompanyId: value?.clientCompanyId ?? 0,
      responsibleId: value.responsible?.id!,
      id: value?.purchaseOrderId ?? 0,
      nfNum: value?.nfNum ?? 0
    };
    this.loadingService.show();
    this.purchaseOrders.set(await this.filter(filter));
    this.loadingService.hide();
    this.hideDialog();
    this.formFilter.get('clientCompanyId')?.disable();
  }

  //Print
  async print(id: number) {
    this.loadingService.show();
    const resultPu = await this.PurchaseOrderFilterId(id);
    if (resultPu.status == 200 && resultPu.body?.status == StatusSuccessError.succes) {
      const purchase: PurchaseOrder = resultPu.body.data;
      let parts: PurchaseOrderItem[] = [];
      let items: PurchaseOrderItemCons[] = [];
      if (purchase.type == TypePurchaseOrderEnum.ESTOQUE) {
        parts = await this.listPurchaseOrderItem(id);
      } else {
        items = await this.listConsItem(id);
      }
      if (parts.length > 0 || items.length > 0) {
        this.loadingService.hide();
        this.printComponent.print(purchase, parts, items);
      } else {
        this.messageService.add({ severity: 'info', summary: 'Pedido de comprar', detail: 'Sem itens', icon: 'pi pi-info-circle' });
      }
    }
    this.loadingService.hide();
  }

  private async PurchaseOrderFilterId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async listPurchaseOrderItem(purchaseId: number): Promise<PurchaseOrderItem[]> {
    try {
      return await lastValueFrom(this.purchaseOrderItemService.filterId(purchaseId));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async listConsItem(id: number): Promise<PurchaseOrderItemCons[]> {
    try {
      return await lastValueFrom(this.purchaseOrderItemConsService.filter(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  //#print
  private async getResposible() {
    const result = await this.filterUserRoleId(3);
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.responsable.set(result.body?.data);
    }
  }

  private async filter(filters: IFilterPurchaseOrder): Promise<PurchaseOrder[]> {
    try {
      return await lastValueFrom(this.reportService.filter(filters));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async filterUserRoleId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.filterRoleId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }




}
