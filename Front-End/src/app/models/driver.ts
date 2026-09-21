import { StatusEnabDisabEnum } from "./status-enab-disab-enum";

export class Driver {
    companyId: number | null = null;
    resaleId: number | null = null;
    dateRegister: Date | string = "";
    id: number | null = null;
    status: StatusEnabDisabEnum = StatusEnabDisabEnum.DISABLED;
    name: string = "";
    cpf: string = "";
    rg: string = "";
    dateBirth: Date | string = "";
    maleFemale: string = "";
    cnhRegister: string = "";
    cnhCategory: string = "";
    cnhValidation: Date | string = "";
    email: string = "";
    dddCellphone: string = '';
    cellphone: string = '';
    dddPhone: string = '';
    phone: string = '';
    zipCode: string = '';
    state: string = '';
    city: string = '';
    neighborhood: string = '';
    address: string = '';
    addressNumber: string = '';
    addressComplement: string = '';
    photoDriverUrl: string = '';
    photoDoc1Url: string = '';
    photoDoc2Url: string = '';
}