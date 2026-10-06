import { StatusEnabDisabEnum } from "../status-enab-disab-enum";
import { SalesTypeEnum } from "./sales.type.enum";
import { SalespersonTypeEnum } from "./salesperson.type.enum";


export class Salesperson {
    companyId: number | null = null;
    resaleId: number | null = null;
    dateRegister: Date | string = '';
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = '';
    type: SalespersonTypeEnum = SalespersonTypeEnum.INTERNAL;
    typeSalesPart: SalesTypeEnum | null = null;
    typeSalesService: SalesTypeEnum | null = null;
    typeSalesVehicle: SalesTypeEnum | null = null;
    userId: number | null = null;


}