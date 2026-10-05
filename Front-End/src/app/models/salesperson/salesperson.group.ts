import { StatusEnabDisabEnum } from "../status-enab-disab-enum";

export class SalespersonGroup {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.ENABLED;
    description: string = "";
    ufs: string = "";
    brands: string = "";
    regions: string = "";
}