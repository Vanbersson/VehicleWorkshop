import { TypeCategoryEnum } from "@/app/models/workshop/type.category.enum";

export interface IToolControlMaterialMec {
    matmecId: string;
    requestId: number;
    
    materialId: number;
    materialDesc: string;
    materialPhoto?: string;

    categoryId?: number;
    categoryDesc?: string;
    categoryType?: TypeCategoryEnum;

    deliveryDate: string;
    deliveryQuantity: number;
    deliveryInformation: string;

    returnInformation?: string;

    mechanicId?: number;
    mechanicName?: string;
    mechanicPhoto?: string;
    mechanicCodePassword?: number;
}