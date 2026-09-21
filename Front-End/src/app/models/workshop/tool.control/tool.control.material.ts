import { StatusEnabDisabEnum } from "../../status-enab-disab-enum";
import { TypeMaterialEnum } from "../type.material.enum";

export class ToolControlMaterial {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    type: TypeMaterialEnum = TypeMaterialEnum.BOTH;
    numberCA: number | null = null;
    description: string = '';
    categoryId: number | null = null;
    quantityAccountingLoan: number = 0;
    quantityAvailableLoan: number = 0;
    quantityAccountingKit: number = 0;
    quantityAvailableKit: number = 0;
    validityDay: number | null = null;
    photoUrl: string = '';

    quantityLoan: number = 0;
    informationLoan: string = '';
}