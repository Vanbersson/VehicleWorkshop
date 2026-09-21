import { StatusTollControlRequestEnum } from "../status.tool.control.request.enum";
import { TypeCategoryEnum } from "../type.category.enum";
import { TypeMaterialEnum } from "../type.material.enum";

export class ToolControlRequest {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusTollControlRequestEnum = StatusTollControlRequestEnum.OPEN;
    requestType: TypeMaterialEnum = TypeMaterialEnum.BOTH;
    requestDate: string = "";
    requestInformation: string = "";
    requestUserId: number | null = null;
    requestUserName: string = "";
    categoryType: TypeCategoryEnum = TypeCategoryEnum.OTHER;
    mechanicId: number | null = null;
}