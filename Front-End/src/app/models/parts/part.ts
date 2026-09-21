import { StatusEnabDisabEnum } from "../status-enab-disab-enum";
import { AdditionDiscountEnum } from "./addition.discount.enum";

export class Part {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.ENABLED;
    dateRegister: Date | string = "";
    code: string = "";
    description: string = "";
    unitMeasureId: number | null = null;
    priceNow: number = 0;
    priceOld: number = 0;
    priceWarranty: number = 0.0;
    additionDiscount: AdditionDiscountEnum = AdditionDiscountEnum.NENHUM;
    brandId: number | null = null;
    groupId: number | null = null;
    categoryId: number | null = null;
    locationPriArea: string = "";
    locationPriStreet: string = "";
    locationPriBookcase: string = "";
    locationPriShelf: string = "";
    locationPriPosition: string = "";
    locationSecArea: string = "";
    locationSecStreet: string = "";
    locationSecBookcase: string = "";
    locationSecShelf: string = "";
    locationSecPosition: string = "";
    photoUrlFront: string = "";
    photoUrlVerse: string = "";
}