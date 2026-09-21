export interface IPartFilter {
    companyId:number;
    resaleId:number;
    id: number;
    code: string;
    description: string;
    available: number;
    price: number;
    unit?: string;
    brand?: string;
    group?: string;
    category?: string;

    selectPrice: number;
    selectQuantity: number;
    selectDiscount: number;
}