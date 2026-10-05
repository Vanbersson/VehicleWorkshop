import { StatusEnabDisabEnum } from "../status-enab-disab-enum";
import { SalespersonTypeEnum } from "./salesperson.type.enum";

export class Salesperson {
    companyId: number | null = null;
    resaleId: number | null = null;
    dateRegister: Date | string = '';
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = '';
    typeSalesPart: SalespersonTypeEnum | null = null;
    typeSalesService: SalespersonTypeEnum | null = null;
    typeSalesVehicle: SalespersonTypeEnum | null = null;
    userId: number | null = null;


}