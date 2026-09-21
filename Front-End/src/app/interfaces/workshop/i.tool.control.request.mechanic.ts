import { IToolControlMaterialMec } from "./i.tool.control.material.mec";

export interface IToolControlRequestMechanic {
    companyId: number;
    resaleId: number;
    id: number;
    name: string;
    codePassword: number;
    departmentId: number;
    photoUrl: string;
    materials: IToolControlMaterialMec[];
}