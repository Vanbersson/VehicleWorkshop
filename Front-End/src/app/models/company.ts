import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
export interface Company {
    id: number;
    status: StatusEnabDisabEnum;
    name: string;
    cnpj: string;
    email: string;
    cellphone: string;
    phone: string;
    zipCode: string;
    state: string;
    city: string;
    neighborhood: string;
    address: string;
    addressNumber: string;
    addressComplement: string;
}
export interface Resale extends Company {
    companyId: number;
}
export type CompanySave = Omit<Company, 'id'> & { id?: number };
export type ResaleSave = CompanySave & { companyId: number };
