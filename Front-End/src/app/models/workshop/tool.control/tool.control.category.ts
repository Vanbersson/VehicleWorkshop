import { StatusEnabDisabEnum } from "../../status-enab-disab-enum";
import { TypeCategoryEnum } from "../type.category.enum";

export class ToolControlCategory {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    type: TypeCategoryEnum = TypeCategoryEnum.OTHER;
    quantityReq: number = 0;
    description: string = '';
}