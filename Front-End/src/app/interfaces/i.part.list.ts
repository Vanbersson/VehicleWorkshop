import { StatusEnabDisabEnum } from "../models/status-enab-disab-enum";

export interface IPartList {
    id: number;
    status: StatusEnabDisabEnum;
    code: string;
    description: string;
    brand: string;
    group: string;
    category: string;
}