import { StatusEnabDisabEnum } from "../status-enab-disab-enum";

export class Mechanic {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = '';
    codePassword: number | null = null;
    departmentId: number| null = null;
    photoUrl: string = '';
}