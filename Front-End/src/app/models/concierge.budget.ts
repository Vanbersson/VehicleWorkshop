export interface ConciergeBudget {
    canEdit?: boolean;
    cancellationReason?: string | null;
    items: ConciergeBudgetItemCreate[];
    id: number;
    companyId: number;
    resaleId: number;
    status: string;
    vehicleId: number;
    vehiclePlate?: string | null;
    dateValidation: string | null;
    dateAuthorization: string | null;
    generationUserId: number;
    generationUserName: string;
    generationDate: string;
    paymentTypeId: number | null;
    paymentTypeDesc: string | null;
    salespersonUserId: number | null;
    salespersonUserName: string | null;
    clientCompanyId: number;
    clientCompanyName: string;
    information: string | null;
}
export interface ConciergeBudgetItemCreate {
    id?: number;
    type: 0 | 1;
    description: string;
    quantity: number;
    hourService: number | null;
    price: number;
    discount: number;
}

export function hasConciergeBudgetApproval(budget: Pick<ConciergeBudget, 'status' | 'dateAuthorization'> | null | undefined): boolean {
    return !!budget && (budget.status === 'Approved' || !!budget.dateAuthorization);
}
export interface ConciergeBudgetCreate {
    clientCompanyId?: number | null;
    salespersonUserId?: number | null;
    items: ConciergeBudgetItemCreate[];
    vehicleId: number;
    dateValidation: string | null;
    paymentTypeId: number | null;
    information: string;
}
export const CONCIERGE_BUDGET_STATUSES: Record<string, string> = {
    CancelledBudget: 'Cancelado',
    NotBudget: 'Sem orçamento',
    OpenBudget: 'Aberto',
    CompleteBudget: 'Concluído',
    NotSended: 'Não enviado',
    PendingApproval: 'Aguardando aprovação',
    Approved: 'Aprovado',
    NotApproved: 'Não aprovado'
};
