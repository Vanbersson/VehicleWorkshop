import { StatusEnabDisabEnum } from "../status-enab-disab-enum";
import { YesNotEnum } from "../yes.not.enum";
import { SalespersonTypeEnum } from "./salesperson.type.enum";


export class Salesperson {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = '';
    cpf: string = '';
    dddCellphone: string = '';
    cellphone: string = '';
    limitDiscount: number = 0;
    typeSales: SalespersonTypeEnum = SalespersonTypeEnum.INTERNAL;
    typeSalesPart: YesNotEnum = YesNotEnum.NOT;
    typeSalesService: YesNotEnum = YesNotEnum.NOT;
    typeSalesVehicle: YesNotEnum = YesNotEnum.NOT;
    userId: number | null = null;
    groupId: number | null = null;
    photoUrl: string = '';
}