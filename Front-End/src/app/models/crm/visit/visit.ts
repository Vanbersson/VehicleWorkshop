import { ContactTypeEnum } from "./contact.type.enum";
import { StatusVisitEnum } from "./status.visit.enum";


export class Visit {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusVisitEnum = StatusVisitEnum.OPEN;
    dateRegister: string | Date | null = '';
    userIdRegister: number | null = null;
    userNameRegister: string = '';
    dateVisit: string | Date | null = '';
    
    salespersonId: number | null = null;
    salespersonName: string = '';
    salespersonInfo: string = '';
    
    contactType: ContactTypeEnum = ContactTypeEnum.IN_PERSON;
    contact: string = '';

    clientId: number | null = null;
    clientName: string = '';
    clientCNPJ: string = '';
    clientCPF: string = '';

    latitude: string = '';
    longitude: string = '';

    reasonVisit: string = '';
    reasonVisitInfo: string = '';
    products: string = '';
    productsInfo: string = '';

    
}