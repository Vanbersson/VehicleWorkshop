export interface ConciergeBudgetApprovalData {
    accessRequired: boolean;
    budgetId: number | null;
    clientName: string | null;
    vehiclePlate: string | null;
    fileName: string | null;
    size: number | null;
    dateValidation: string | null;
    approvedAt: string | null;
    total: number | null;
    items: { type: number; description: string; quantity: number; hourService: number | null; price: number; discount: number; total: number }[];
}
