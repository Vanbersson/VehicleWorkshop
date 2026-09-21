import { Component, DoCheck, Input, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
//PrimeNG
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputMaskModule } from 'primeng/inputmask';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';

import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { User } from '@/app/models/user';
import { TypePayment } from '@/app/models/type.payment';
import { ClientCompany } from '@/app/models/client.company';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';
import { UserService } from '@/app/services/user/user.service';
import { TypePaymentService } from '@/app/services/client/type.payment.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { PurchaseOrderService } from '@/app/services/parts/purchase.order.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { IPartFilter } from '@/app/interfaces/i.part.filter';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { StatusPurchaseOrderEnum } from '@/app/models/parts/status.purchase.order.enum';
import { PurchaseOrderItemService } from '@/app/services/parts/purchase.order.item.service';
import { FilterPartsComponent } from '@/app/components/filter.parts/filter.parts.component';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { PrintPurchaseComponent } from '@/app/components/print.purchase.order/print.purchase.component';
import { PurchaseOrderItemConsService } from '@/app/services/parts/purchase.order.item.cons.service';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';


@Component({
  selector: 'app-purchase-order-maintenance',
  standalone: true,
  imports: [CommonModule, TextareaModule, FilterPartsComponent, FilterClientComponent,
    ToastModule, ButtonModule, TableModule, InputTextModule, IconFieldModule, RadioButtonModule,
    InputIconModule, DialogModule, DividerModule, SelectModule,
    ReactiveFormsModule, FormsModule, InputGroupModule, InputNumberModule,
    MultiSelectModule, InputMaskModule, TagModule, ConfirmDialogModule, PrintPurchaseComponent,
    DatePickerModule],
  templateUrl: './purchase.order.maintenance.component.html',
  styleUrl: './purchase.order.maintenance.component.scss',
  providers: [ConfirmationService, MessageService]
})
export default class PurchaseOrderMaintenanceComponent implements OnInit, DoCheck {
  private purchaseOrder!: PurchaseOrder;
  private isNewPurchaseOrder: boolean = false;

  numPurchaseOrder = signal<number | null>(null);
  generationDate = signal<Date | null>(null);
  generationUserName = signal<string>('');

  listResponsibles = signal<User[]>([]);
  listPayments = signal<TypePayment[]>([]);
  //Prin
  printPurchaseOrder = signal<PurchaseOrder>(new PurchaseOrder());

  purcharOrderVisible: boolean = false;
  nfVisible: boolean = false;

  selectClientCompany = signal<ClientCompany>(new ClientCompany());
  clientCompany!: ClientCompany;

  selectPart = signal<IPartFilter[]>([]);
  inputiListPartsSelected: IPartFilter[] = [];

  formPurchase = new FormGroup({
    type: new FormControl<TypePurchaseOrderEnum>(TypePurchaseOrderEnum.ESTOQUE),
    responsible: new FormControl<User | null>(null, Validators.required),
    typePayment: new FormControl<TypePayment | null>(null, Validators.required),
    dateDelivery: new FormControl<Date | string>('', Validators.required),
    dateReceived: new FormControl<Date | string>(''),
    clientCompanyId: new FormControl<number | null>({ value: null, disabled: true }),
    clientCompanyName: new FormControl<string>({ value: '', disabled: true }),
    attendantName: new FormControl<string>(''),
    attendantEmail: new FormControl<string>(''),
    attendantDddCellphone: new FormControl<number | null>(null),
    attendantCellphone: new FormControl<number | null>(null),
    attendantDddPhone: new FormControl<number | null>(null),
    attendantPhone: new FormControl<number | null>(null),
    nfNum: new FormControl<number | null>(null),
    nfNumSerie: new FormControl<string>(""),
    nfDate: new FormControl<Date | string>(""),
    nfKey: new FormControl<string>(""),
    information: new FormControl<string>("")
  });
  isCloseValid: boolean = false;

  //Estoque
  purchaseOrderItems = signal<PurchaseOrderItem[]>([]);
  printPurchaseOrderItems: PurchaseOrderItem[] = Array(25).fill(new PurchaseOrderItem());
  clonedPurchaseOrderItem: { [s: number]: PurchaseOrderItem } = {};

  //Items Purchase Order
  totalItemsDiscount = signal<number>(0);
  totalItemsPrice = signal<number>(0);
  estoque = TypePurchaseOrderEnum.ESTOQUE;
  consumo = TypePurchaseOrderEnum.CONSUMO;

  isSaveItem: boolean = false;
  isUpdateItem: boolean = false;
  isDeleteItem: boolean = false;
  //Print
  @ViewChild('printComponent') printComponent!: PrintPurchaseComponent;

  //Consumo
  visibleConsumo: boolean = false;
  listConsumo = signal<PurchaseOrderItemCons[]>([]);
  clonedPurchaseOrderItemCons: { [s: number]: PurchaseOrderItemCons } = {};
  formCons = new FormGroup({
    description: new FormControl<string>('', Validators.required),
    price: new FormControl<number>(0, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    quantity: new FormControl<number>(0, Validators.required),
  });

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private paymentService: TypePaymentService,
    private loadingService: LoadingService,
    private storageService: StorageService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private purchaseOrderService: PurchaseOrderService,
    private purchaseOrderItemService: PurchaseOrderItemService,
    private purchaseOrderItemConsService: PurchaseOrderItemConsService) { }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id']) {
      this.activatedRoute.params.subscribe(params => {
        try {
          if (params['id'] != 0) {
            this.isNewPurchaseOrder = false;
            this.edit(params['id']);
          } else {
            this.isNewPurchaseOrder = true;
            this.purchaseOrder = new PurchaseOrder();
            this.formPurchase.get('type')?.enable();
            this.init();
          }
        } catch (error) {
          console.log("erro");
        }
      });
    }

  }

  ngDoCheck(): void {
    if (this.selectClientCompany().id != null) {
      this.clientCompany = this.selectClientCompany();
      this.formPurchase.patchValue({
        clientCompanyId: this.selectClientCompany().id,
        clientCompanyName: this.selectClientCompany().name
      });
      this.selectClientCompany.set(new ClientCompany());
    }
    if (this.selectPart().length > 0) {
      this.seleItem(this.selectPart());
      //limpar selecção
      this.selectPart.set([]);
    }
  }

  private async seleItem(items: IPartFilter[]): Promise<void> {
    this.loadingService.show();
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      //VERIFICA SE O ITEM JÁ EXISTE NA LISTA
      let itemExist = this.purchaseOrderItems().find(i => i.itemCode == element.code);
      //SE O ITEM NÃO EXISTE NA LISTA SALVA NA BASE
      if (itemExist == null) {
        await this.saveNewItem(index, element);
      } else if (itemExist.quantity != element.selectQuantity || itemExist.price != element.selectPrice || itemExist.discount != element.selectDiscount) {
        //SE O ITEM JÁ EXISTE NA LISTA ATUALIZA NA BASE
        itemExist.price = element.selectPrice;
        itemExist.quantity = element.selectQuantity;
        itemExist.discount = element.selectDiscount;
        await this.saveUpdateItem(itemExist);
        //ALUALIZA A LISTA
        this.purchaseOrderItems().map(i => {
          if (i.itemCode == itemExist.itemCode) {
            i = itemExist;
          }
        });
      }
    }
    //SE O ITEM FOI REMOVIDO DURANTE A PESQUISA TEM QUE SER REMOVIDO DA BASE
    for (const element of this.purchaseOrderItems()) {
      const itemExist = items.find(s => s.code === element.itemCode);
      if (!itemExist) {
        await this.deleteItem(element);
      }
    }
    if (this.isSaveItem || this.isUpdateItem || this.isDeleteItem) {
      await this.listItems(this.purchaseOrder.id!);
    }
    //PROCESSA ITENS
    await this.processItem();

    if (this.isSaveItem || this.isUpdateItem || this.isDeleteItem) {
      setTimeout(() => {
        this.listItems(this.purchaseOrder.id!);
      }, 700);
    }
    //Atualizar o total dos itens
    this.updateTotalItem();

    this.isDeleteItem = false;
    this.isUpdateItem = false;
    this.isSaveItem = false;
    this.loadingService.hide();
  }

  private async saveNewItem(index: number, item: IPartFilter): Promise<boolean> {
    let itemNew = this.convertIPartFilterToPurchaseOrderItem(item);
    itemNew.itemOrder = index + 1;
    const resultItem = await this.savePurchaseOrderItem(itemNew);
    if (resultItem.status == 201 && resultItem.body?.status == StatusSuccessError.succes) {
      this.purchaseOrderItems.set([...this.purchaseOrderItems(), itemNew]);
      this.isSaveItem = true;
    }
    return true;
  }
  private async saveUpdateItem(item: PurchaseOrderItem): Promise<boolean> {
    const resultItem = await this.updatePurchaseOrderItem(item);
    if (resultItem.status == 200 && resultItem.body?.status == StatusSuccessError.succes) {
      this.isUpdateItem = true;
    }
    return true;
  }
  private async deleteItem(item: PurchaseOrderItem): Promise<boolean> {
    const resultItem = await this.deletePurchaseOrderItem(item);
    if (resultItem.status == 200 && resultItem.body?.status == StatusSuccessError.succes) {
      this.isDeleteItem = true;
    }
    return true;
  }
  private async processItem(): Promise<boolean> {
    //SE REMOVEL ITEM ATUALIZAR A ORDEM DOS ITENS
    if (this.isDeleteItem) {
      this.purchaseOrderItems().map(async (element, index) => {
        element.itemOrder = index + 1;
        const result = await this.saveUpdateItem(element);
        if (result) {
          this.isUpdateItem = true;
        }
      });
    }
    return true;
  }

  private async listItems(purchaseId: number): Promise<boolean> {
    this.purchaseOrderItems.set([]);
    this.inputiListPartsSelected = [];
    this.purchaseOrderItems.set(await this.listPurchaseOrderItem(purchaseId));
    for (let index = 0; index < this.purchaseOrderItems().length; index++) {
      const element = this.purchaseOrderItems()[index];
      this.inputiListPartsSelected.push(this.convertPurchaseOrderItemToIPartFilter(element));
    }
    return true;
  }

  private async init(): Promise<boolean> {
    this.loadingService.show();
    const resultUserRole = await this.filterUserRoleId(3);
    if (resultUserRole.status == 200 && resultUserRole.body?.status == StatusSuccessError.succes) {
      this.listResponsibles.set(resultUserRole.body.data);
    }
    this.listPayments.set(await this.listAllEnabledTypePayment());
    this.loadingService.hide();
    return true;
  }

  btnBack() {
    this.router.navigateByUrl("part/purchase/order");
  }

  private updateTotalItem() {
    var tempDiscount: number = 0;
    var tempPrice: number = 0;
    if (this.purchaseOrder.type == TypePurchaseOrderEnum.ESTOQUE) {
      for (let item of this.purchaseOrderItems()) {
        tempDiscount += item.discount!;
        tempPrice += item.price! * item.quantity!;
      }
    } else {
      for (let item of this.listConsumo()) {
        tempDiscount += item.discount!;
        tempPrice += item.price! * item.quantity!;
      }
    }
    this.totalItemsDiscount.set(tempDiscount);
    this.totalItemsPrice.set(tempPrice);
    this.validClose();
  }

  applyDateMask(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d)/, '$1/$2');
    }
    if (value.length > 5) {
      value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
    }

    event.target.value = value;
  }

  private cleanForm() {
    this.formPurchase.patchValue({
      type: TypePurchaseOrderEnum.ESTOQUE,
      responsible: null,
      typePayment: null,
      dateDelivery: null,
      dateReceived: null,
      clientCompanyId: null,
      clientCompanyName: "",
      attendantName: "",
      attendantEmail: "",
      attendantDddCellphone: null,
      attendantCellphone: null,
      attendantDddPhone: null,
      attendantPhone: null,
      nfNum: null,
      nfNumSerie: "",
      nfDate: null,
      nfKey: "",
      information: ""
    });
    this.numPurchaseOrder.set(null);
    this.selectClientCompany.set(new ClientCompany());
  }

  formatDateTime(date: Date): string {
    const datePipe = new DatePipe('en-US');
    // Formata a data e adiciona o fuso horário
    return datePipe.transform(date, "yyyy-MM-dd") + "T00:00:00.000-03:00";
  }

  showDialogNF() {
    this.nfVisible = true;
  }

  hideDialogNF() {
    this.nfVisible = false;
  }

  showDialogConsumo() {
    this.visibleConsumo = true;
  }

  hideDialogConsumo() {
    this.formCons.patchValue({
      description: '',
      quantity: 0,
      price: 0,
      discount: 0
    });
    this.visibleConsumo = false;
  }

  private validClose() {
    this.isCloseValid = false;
    if (this.purchaseOrder.nfNum != null &&
      this.purchaseOrder.nfSerie != "" &&
      this.purchaseOrder.nfDate != null &&
      this.purchaseOrder.nfKey.length == 44) {
      if (this.formPurchase.get('type')?.value == TypePurchaseOrderEnum.ESTOQUE && this.purchaseOrderItems().length > 0) {
        this.isCloseValid = true;
      }else
      if (this.formPurchase.get('type')?.value == TypePurchaseOrderEnum.CONSUMO && this.listConsumo().length > 0) {
        this.isCloseValid = true;
      }
    }
  }

  save() {
    if (this.isNewPurchaseOrder) {
      this.saveNewPurchaseOrder();
    } else {
      this.saveUpdatePurchaseOrder();
    }
  }
  private async saveNewPurchaseOrder() {
    const { value, valid } = this.formPurchase;
    if (!valid || this.clientCompany == null) {
      return;
    }
    this.purchaseOrder.companyId = this.storageService.companyId;
    this.purchaseOrder.resaleId = this.storageService.resaleId;
    this.purchaseOrder.status = StatusPurchaseOrderEnum.OPEN;
    this.purchaseOrder.type = value.type!;
    this.purchaseOrder.dateDelivery = value.dateDelivery!;
    this.purchaseOrder.dateReceived = value.dateReceived != '' ? '' : value.dateReceived!;
    this.purchaseOrder.responsibleUserId = value.responsible!.id
    this.purchaseOrder.responsibleUserName = value.responsible!.name;
    this.purchaseOrder.generationUserId = this.storageService.id;
    this.purchaseOrder.generationUserName = this.storageService.name;
    this.purchaseOrder.paymentTypeId = value.typePayment!.id;
    this.purchaseOrder.paymentTypeDesc = value.typePayment!.description;
    this.purchaseOrder.clientCompanyId = this.clientCompany.id;
    this.purchaseOrder.clientCompanyName = this.clientCompany.name;
    this.purchaseOrder.attendantName = value?.attendantName ?? "";
    this.purchaseOrder.attendantEmail = value?.attendantEmail ?? "";
    this.purchaseOrder.attendantDddCellphone = value.attendantDddCellphone == null ? "" : value.attendantDddCellphone.toString();
    this.purchaseOrder.attendantCellphone = value.attendantCellphone == null ? "" : value.attendantCellphone.toString();
    this.purchaseOrder.attendantDddPhone = value.attendantDddPhone == null ? "" : value.attendantDddPhone.toString();
    this.purchaseOrder.attendantPhone = value.attendantPhone == null ? "" : value.attendantPhone.toString();
    this.purchaseOrder.information = value.information!;
    this.loadingService.show();
    const resultPu = await this.saveNewPu(this.purchaseOrder);
    this.loadingService.hide();
    if (resultPu.status == 201 && resultPu.body?.status == StatusSuccessError.succes) {
      this.purchaseOrder = resultPu.body.data;
      this.messageService.add({ severity: 'success', summary: resultPu.body.header, detail: resultPu.body.message, icon: 'pi pi-check' });
      //Habilita o atualizar
      this.isNewPurchaseOrder = false;
      //Número do pedido
      this.numPurchaseOrder.set(this.purchaseOrder.id);
      //Data geração
      this.generationDate.set(new Date(this.purchaseOrder.generationDate));
      //Nome de quem gerou o pedido
      this.generationUserName.set(this.purchaseOrder.generationUserName);
      //Desabilita
      this.formPurchase.get('type')?.disable();
      //List
      // this.listOpenPurchaseorder();
    }
    if (resultPu.status == 201 && resultPu.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultPu.body.header, detail: resultPu.body.message, icon: 'pi pi-info-circle' });
    }
  }

  private async saveUpdatePurchaseOrder() {
    const { value, valid } = this.formPurchase;
    if (!valid || this.clientCompany == null) {
      return;
    }
    this.purchaseOrder.dateDelivery = value.dateDelivery!;
    this.purchaseOrder.dateReceived = value?.dateReceived ?? null!;
    this.purchaseOrder.responsibleUserId = value.responsible!.id;
    this.purchaseOrder.responsibleUserName = value.responsible!.name;
    this.purchaseOrder.paymentTypeId = value.typePayment!.id;
    this.purchaseOrder.paymentTypeDesc = value.typePayment!.description;
    this.purchaseOrder.clientCompanyId = this.clientCompany.id;
    this.purchaseOrder.clientCompanyName = this.clientCompany.name;
    this.purchaseOrder.attendantName = value?.attendantName ?? "";
    this.purchaseOrder.attendantEmail = value?.attendantEmail ?? "";
    this.purchaseOrder.attendantDddCellphone = value.attendantDddCellphone == null ? "" : value.attendantDddCellphone.toString();
    this.purchaseOrder.attendantCellphone = value.attendantCellphone == null ? "" : value.attendantCellphone.toString();
    this.purchaseOrder.attendantDddPhone = value.attendantDddPhone == null ? "" : value.attendantDddPhone.toString();
    this.purchaseOrder.attendantPhone = value.attendantPhone == null ? "" : value.attendantPhone.toString();
    this.purchaseOrder.information = value.information!;
    this.purchaseOrder.nfNum = value.nfNum!;
    this.purchaseOrder.nfSerie = value.nfNumSerie!;
    this.purchaseOrder.nfDate = value.nfDate!;
    this.purchaseOrder.nfKey = value.nfKey!;

    this.loadingService.show();
    const resultPu = await this.saveUpdatePu(this.purchaseOrder);
    this.loadingService.hide();
    if (resultPu.status == 200 && resultPu.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultPu.body.header, detail: resultPu.body.message, icon: 'pi pi-check' });
      //Valid NF
      this.validClose();
    }
    if (resultPu.status == 200 && resultPu.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultPu.body.header, detail: resultPu.body.message, icon: 'pi pi-info-circle' });
    }
  }

  private async edit(id: number): Promise<void> {
    this.loadingService.show();
    const resultPu = await this.PurchaseOrderFilterId(id);
    this.loadingService.hide();
    if (resultPu.status == 200 && resultPu.body?.status == StatusSuccessError.succes) {
      this.isNewPurchaseOrder = false;
      this.cleanForm();
      this.purchaseOrder = resultPu.body.data;
      if (this.purchaseOrder.status === StatusPurchaseOrderEnum.CLOSE) {
        this.router.navigateByUrl("part/purchase/order");
        return;
      }

      await this.init();
      //Client
      this.clientCompany = new ClientCompany();
      this.clientCompany.id = this.purchaseOrder.clientCompanyId;
      this.clientCompany.name = this.purchaseOrder.clientCompanyName;
      //Número do pedido
      this.numPurchaseOrder.set(this.purchaseOrder.id);
      //Data geração
      this.generationDate.set(new Date(this.purchaseOrder.generationDate));
      //Nome de quem gerou o pedido
      this.generationUserName.set(this.purchaseOrder.generationUserName);
      
      this.formPurchase.patchValue({
        type: this.purchaseOrder.type,
        responsible: this.listResponsibles().find(r => r.id == this.purchaseOrder.responsibleUserId),
        typePayment: this.listPayments().find(p => p.id == this.purchaseOrder.paymentTypeId),
        dateDelivery: new Date(this.purchaseOrder.dateDelivery!),
        dateReceived: this.purchaseOrder.dateReceived != null ? new Date(this.purchaseOrder.dateReceived) : null,
        clientCompanyId: this.purchaseOrder.clientCompanyId,
        clientCompanyName: this.purchaseOrder.clientCompanyName,
        attendantName: this.purchaseOrder.attendantName,
        attendantEmail: this.purchaseOrder.attendantEmail,
        attendantDddCellphone: this.purchaseOrder.attendantDddCellphone != "" ? Number.parseInt(this.purchaseOrder.attendantDddCellphone) : null,
        attendantCellphone: this.purchaseOrder.attendantCellphone != "" ? Number.parseInt(this.purchaseOrder.attendantCellphone) : null,
        attendantDddPhone: this.purchaseOrder.attendantDddPhone != "" ? Number.parseInt(this.purchaseOrder.attendantDddPhone) : null,
        attendantPhone: this.purchaseOrder.attendantPhone != "" ? Number.parseInt(this.purchaseOrder.attendantPhone) : null,
        nfNum: this.purchaseOrder.nfNum != null ? this.purchaseOrder.nfNum : null,
        nfNumSerie: this.purchaseOrder.nfSerie,
        nfDate: this.purchaseOrder.nfDate != null ? new Date(this.purchaseOrder.nfDate) : null,
        nfKey: this.purchaseOrder.nfKey,
        information: this.purchaseOrder.information
      });
      this.formPurchase.get('type')?.disable();

      if (this.purchaseOrder.type == TypePurchaseOrderEnum.ESTOQUE) {
        //LISTA TODOS OS ITENS
        await this.listItems(this.purchaseOrder.id!);
      } else {
        this.listConsumo.set(await this.listConsItem(this.purchaseOrder.id!));
      }
      this.updateTotalItem();
    }
  }

  //Close
  confirmClose() {
    this.confirmationService.confirm({
      header: 'Fechar pedido?',
      message: 'Por favor confirme para fechar.',
      accept: async () => {

        const dateReceived = this.formPurchase.get('dateReceived')?.value;
        if (dateReceived) {
          this.purchaseOrder.status = StatusPurchaseOrderEnum.CLOSE;
          this.purchaseOrder.dateReceived = dateReceived;
          const resultPu = await this.saveClosePu(this.purchaseOrder);
          if (resultPu.status == 200 && resultPu.body?.status == StatusSuccessError.succes) {
            this.messageService.add({ severity: 'success', summary: resultPu.body.header, detail: resultPu.body.message, icon: 'pi pi-check' });
            setTimeout(() => {
              this.router.navigateByUrl("part/purchase/order");
            }, 3000);

          }
          if (resultPu.status == 200 && resultPu.body?.status == StatusSuccessError.error) {
            this.messageService.add({ severity: 'info', summary: resultPu.body.header, detail: resultPu.body.message, icon: 'pi pi-info-circle' });
          }
        }else{
          this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Data recebimento não informado.', icon: 'pi pi-times' });
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Cancelado', detail: 'Você não fechou o pedido', icon: 'pi pi-times' });
      }
    });
  }

  private convertPurchaseOrderItemToIPartFilter(item: PurchaseOrderItem): IPartFilter {
    let p: IPartFilter = {
      companyId: item.id.companyId!,
      resaleId: item.id.resaleId!,
      id: item.id.itemId!,
      code: item.itemCode,
      description: item.itemDescription,
      available: 0,
      price: item.price!,
      selectPrice: item.price!,
      selectQuantity: item.quantity!,
      selectDiscount: item.discount!,
    };
    return p;
  }
  private convertIPartFilterToPurchaseOrderItem(item: IPartFilter): PurchaseOrderItem {
    let p: PurchaseOrderItem = new PurchaseOrderItem();
    p.id.companyId = item.companyId;
    p.id.resaleId = item.resaleId;
    p.id.itemId = item.id;
    p.id.purchaseId = this.purchaseOrder.id;
    p.itemCode = item.code;
    p.itemDescription = item.description;
    p.discount = item.selectDiscount;
    p.price = item.selectPrice;
    p.quantity = item.selectQuantity;
    return p;
  }
  //Print
  print() {
    this.printComponent.print(this.purchaseOrder, this.purchaseOrderItems(), this.listConsumo());
  }

  async deletePart(item: PurchaseOrderItem) {
    this.loadingService.show();
    const result = await this.deleteItem(item);
    if (result) {
      await this.listItems(this.purchaseOrder.id!);
      //PROCESSA ITENS
      await this.processItem();

      setTimeout(async () => {
        await this.listItems(this.purchaseOrder.id!);
      }, 700);

      //Atualizar o total dos itens
      this.updateTotalItem();

      this.isDeleteItem = false;
      this.isUpdateItem = false;
    }
    this.loadingService.hide();
  }
  onRowEditInit(item: PurchaseOrderItem) {
    this.clonedPurchaseOrderItem[item.itemOrder as number] = { ...item };
  }
  async onRowEditSave(item: PurchaseOrderItem, index: number) {
    //desconto maior que o total do item
    if (item.discount! > item.price! * item.quantity!) {
      this.messageService.add({ severity: 'error', summary: 'Desconto', detail: 'Maior que o total do item', icon: 'pi pi-times' });
      this.onRowEditCancel(item, index);
    } else {
      const result = await this.saveUpdateItem(item);
      if (result) {
        delete this.clonedPurchaseOrderItem[item.itemOrder as number];
        //LISTA ITENS
        await this.listItems(this.purchaseOrder.id!);
        //Atualizar o total dos itens
        this.updateTotalItem();
        this.isUpdateItem = false;
      } else {
        this.onRowEditCancel(item, index);
      }
    }
  }
  onRowEditCancel(item: PurchaseOrderItem, index: number) {
    this.purchaseOrderItems()[index] = this.clonedPurchaseOrderItem[item.itemOrder as number];
    delete this.clonedPurchaseOrderItem[item.itemOrder as number];
  }

  private async saveNewPu(pu: PurchaseOrder): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderService.save(pu));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async saveUpdatePu(pu: PurchaseOrder): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderService.update(pu));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveClosePu(pu: PurchaseOrder): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderService.close(pu));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
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
  private async PurchaseOrderFilterId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderService.filterId(id));
    } catch (error: any) {
      return error;
    }
  }

  private async savePurchaseOrderItem(item: PurchaseOrderItem): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderItemService.save(item));
    } catch (error: any) {
      return error;
    }
  }
  private async updatePurchaseOrderItem(item: PurchaseOrderItem): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderItemService.update(item));
    } catch (error: any) {
      return error;
    }
  }
  private async deletePurchaseOrderItem(item: PurchaseOrderItem): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderItemService.delete(item));
    } catch (error: any) {
      return error;
    }
  }
  private async listPurchaseOrderItem(purchaseId: number): Promise<PurchaseOrderItem[]> {
    try {
      return await lastValueFrom(this.purchaseOrderItemService.filterId(purchaseId));
    } catch (error: any) {
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
  //Consumo
  private async ordernarItemCons(): Promise<boolean> {
    this.listConsumo().map(async (element, index) => {
      element.itemOrder = index + 1;
      await this.updateConsItem(element);
    });
    return true;
  }

  async saveNewConsItem() {
    const { value, valid } = this.formCons;
    if (!valid) {
      return;
    }
    if (value.discount! > value.price! * value.quantity!) {
      return;
    }
    if (value.discount! < 0 || value.price! <= 0 || value.quantity! <= 0) {
      return;
    }
    let item: PurchaseOrderItemCons = new PurchaseOrderItemCons();
    item.companyId = this.storageService.companyId;
    item.resaleId = this.storageService.resaleId;
    item.purchaseId = this.purchaseOrder.id;
    item.itemOrder = this.listConsumo().length + 1;
    item.description = value.description!;
    item.price = value.price!;
    item.quantity = value.quantity!;
    item.discount = value.discount!;
    this.loadingService.show();
    const resultItem = await this.saveConsItem(item);
    this.loadingService.hide();
    if (resultItem.status == 201 && resultItem.body?.status == StatusSuccessError.succes) {
      this.hideDialogConsumo();
      this.listConsumo.set(await this.listConsItem(this.purchaseOrder.id!));
      this.updateTotalItem();
      this.messageService.add({ severity: 'success', summary: resultItem.body.header, detail: resultItem.body.message, icon: 'pi pi-check' });
    }
  }

  async deleteItemCons(item: PurchaseOrderItemCons) {
    this.loadingService.show();
    const resultItem = await this.deleteConsItem(item);
    if (resultItem.status == 200 && resultItem.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultItem.body.header, detail: resultItem.body.message, icon: 'pi pi-check' });
      this.listConsumo.set(await this.listConsItem(this.purchaseOrder.id!));
      await this.ordernarItemCons();
      this.updateTotalItem();
    }
    this.loadingService.hide();
  }
  onRowEditInitItemCons(item: PurchaseOrderItemCons) {
    this.clonedPurchaseOrderItemCons[item.itemOrder as number] = { ...item };
  }
  async onRowEditSaveItemCons(item: PurchaseOrderItemCons, index: number) {
    //desconto maior que o total do item
    if (item.discount! > item.price! * item.quantity!) {
      this.messageService.add({ severity: 'error', summary: 'Desconto', detail: 'Maior que o total do item', icon: 'pi pi-times' });
      this.onRowEditCancelItemCons(item, index);
    } else {
      const resultItem = await this.updateConsItem(item);
      if (resultItem.status == 200 && resultItem.body?.status == StatusSuccessError.succes) {
        delete this.clonedPurchaseOrderItemCons[item.itemOrder as number];
        //LISTA ITENS
        this.listConsumo.set(await this.listConsItem(this.purchaseOrder.id!));
        //Atualizar o total dos itens
        this.updateTotalItem();
      } else {
        this.onRowEditCancelItemCons(item, index);
      }
    }
  }
  onRowEditCancelItemCons(item: PurchaseOrderItemCons, index: number) {
    this.listConsumo()[index] = this.clonedPurchaseOrderItemCons[item.itemOrder as number];
    delete this.clonedPurchaseOrderItemCons[item.itemOrder as number];
  }

  private async saveConsItem(item: PurchaseOrderItemCons): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderItemConsService.save(item));
    } catch (error: any) {
      return error;
    }
  }
  private async updateConsItem(item: PurchaseOrderItemCons): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderItemConsService.update(item));
    } catch (error: any) {
      return error;
    }
  }
  private async deleteConsItem(item: PurchaseOrderItemCons): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.purchaseOrderItemConsService.delete(item));
    } catch (error: any) {
      return error;
    }
  }
  private async listConsItem(id: number): Promise<PurchaseOrderItemCons[]> {
    try {
      return await lastValueFrom(this.purchaseOrderItemConsService.filter(id));
    } catch (error: any) {
      return [];
    }
  }
}
