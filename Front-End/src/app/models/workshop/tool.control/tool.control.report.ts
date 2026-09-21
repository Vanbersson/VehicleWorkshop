import { Mechanic } from "../mechanic";


export class ToolControlReport {

    companyId: number | null = null;
    resaleId: number | null = null;
    mecId: number | null = null;
    mechanic: Mechanic = new Mechanic();
    materials!: [
        {
            requestStatus: string;
            requestTypeMaterial: string;
            requestUserId: number;
            requestId: number;
            requestInformation: string;
            requestDate: string;
            categoryId: number;
            categoryDesc: string;
            matMecId: string;
            matMecDelivUserId: number;
            matMecDelivUserName: string;
            matMecDelivQuantity: number;
            matMecDelivDate: string;
            matMecDelivInfor: string;
            matMecReturUserId: number;
            matMecReturUserName: string;
            matMecReturQuantity: number;
            matMecReturDate: string;
            matMecReturInfor: string;
            matMecMaterialId: number;
            matMecMaterialDesc: string;
        }
    ];
}