import { StatusEnabDisabEnum } from "../status-enab-disab-enum";

export class UnitMeasure {
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    unitMeasure: string = '';
    description: string = '';
}