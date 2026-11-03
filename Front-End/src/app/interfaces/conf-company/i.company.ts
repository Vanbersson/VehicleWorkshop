import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
export interface ICompany {
    id: number;
    status: StatusEnabDisabEnum;
    name: string;
    fantasia?: string;
    logoUrl?: string;
    cnpj: string;
    ie?: string;
    im?: string;
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

export type CompanySave = Omit<ICompany, 'id'> & { id?: number };
