import { StatusDeliveryEnum } from "./status.delivery.enum";
import { StatusPurchaseOrderEnum } from "./status.purchase.order.enum";
import { TypePurchaseOrderEnum } from "./type.purchase.order.enum";


export class PurchaseOrder {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusPurchaseOrderEnum = StatusPurchaseOrderEnum.OPEN;
    statusDelivery: StatusDeliveryEnum = StatusDeliveryEnum.ONTIME;
    type: TypePurchaseOrderEnum = TypePurchaseOrderEnum.ESTOQUE;

    generationUserId: number | null = null;
    generationUserName: string = '';
    generationDate: Date | string = '';

    responsibleUserId: number | null = null;
    responsibleUserName: string = '';

    paymentTypeId: number | null = null;
    paymentTypeDesc: string = '';

    dateDelivery: Date | string  = '';
    dateReceived: Date | string = '';
    information: string = '';


    clientCompanyId: number | null = null;
    clientCompanyName: string = '';

    attendantName: string = '';
    attendantEmail: string = '';
    attendantDddCellphone: string = '';
    attendantCellphone: string = '';
    attendantDddPhone: string = '';
    attendantPhone: string = '';

    nfNum: number | null = null;
    nfSerie: string = '';
    nfDate: Date | string = '';
    nfKey: string = '';

}