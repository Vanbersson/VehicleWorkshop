import { StatusEnabDisabEnum } from "../status-enab-disab-enum";
import { GroupPartTypeEnum } from "./group.part.type.enum";

export class GroupPart {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    type: GroupPartTypeEnum = GroupPartTypeEnum.OUTROS;
    description: string = "";
    brandId: number | null = null;
}