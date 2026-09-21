import { StatusEnabDisabEnum } from "./status-enab-disab-enum";

export class VehicleModel {
    companyId: number = 0;
    resaleId: number = 0;
    id: number = 0;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    description: string = '';
}