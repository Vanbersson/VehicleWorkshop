import { StatusEnabDisabEnum } from "./status-enab-disab-enum";
import { StatusRoleFuncEnum } from "./status-role-func-enum";

export class User {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = '';
    password: string = '';
    email: string = '';
    cellphone: string = '';
    limitDiscount: number = 0;
    photoUrl: string = '';
    roleId: number | null = null;
    roleDesc: string = '';
    roleFunc: StatusRoleFuncEnum = StatusRoleFuncEnum.USER;
    token: string = '';
}