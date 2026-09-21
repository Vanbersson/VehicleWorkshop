import { StatusEnabDisabEnum } from "./status-enab-disab-enum";

export class TypePayment {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    description: string = '';
}