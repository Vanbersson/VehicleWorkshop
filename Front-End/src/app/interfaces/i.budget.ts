export interface IBudget {
    companyId: number | null;
    resaleId: number | null;
    id: number | null;
    vehicleEntryId: number | null;
    status: string;
    dateGeneration: Date | string;
    dateValidation: Date | string;
    dateAuthorization: Date | string;
    nameResponsible: string;
    typePayment: string;
    idUserAttendant: number | null;
    clientCompanyId: number | null;
    information: string;
    clientSendDate: Date | string;
    clientApprovedDate: Date | string;
}