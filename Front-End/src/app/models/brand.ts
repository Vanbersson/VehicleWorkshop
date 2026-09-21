import { StatusEnabDisabEnum } from "./status-enab-disab-enum";

export class Brand {
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = '';
}