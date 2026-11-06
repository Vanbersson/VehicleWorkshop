export enum AttendanceStatus {
    VISIT_COMPLETED = 'VISIT_COMPLETED',
    QUOTATION = 'QUOTATION',
    DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    INVOICING_PENDING = 'INVOICING_PENDING',
    DELIVERY_PENDING = 'DELIVERY_PENDING',
    COMMERCIAL_PROPOSAL = 'COMMERCIAL_PROPOSAL',
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface CustomerAttendance {
    id: number;
    visitId: number | null;
    clientId: number | null;
    clientName: string;
    salespersonId: number;
    salespersonName: string;
    dateCreated: string;
    dateVisit: string | null;
    status: AttendanceStatus;
    notes: string | null;
    version: number;
    quoteTotal?: number | null;
    paymentTotal?: number | null;
    cancellationReason?: string | null;
    cancelledAt?: string | null;
    cancelledByName?: string | null;
    documentsNotes?: string | null;
    proposalNotes?: string | null;
    approvalRequestedAt?: string | null;
    completedAt?: string | null;
    expectedDeliveryDate?: string | null;
}

export interface AttendanceUpdate {
    expectedDeliveryDate?: string | null;
    salespersonId?: number;
    clientId?: number;
    id: number;
    status: AttendanceStatus;
    notes: string;
    version: number;
    documentsNotes?: string;
    proposalNotes?: string;
}

export interface AttendanceCreate {
    clientId: number;
    salespersonId: number;
    notes: string;
}

export interface AttendanceCancel {
    id: number;
    version: number;
    reason: string;
}

export type AttendanceQueryMode = 'ACTIVE' | 'CANCELLED';
export interface AttendanceSearch {
    id: number | null;
    clientName: string;
    salespersonName: string;
}

export const ATTENDANCE_WORKFLOW = [
    { value: AttendanceStatus.VISIT_COMPLETED, label: 'Visita', statusLabel: 'Visita feita', icon: 'pi pi-check-square', severity: 'secondary' as const },
    { value: AttendanceStatus.COMMERCIAL_PROPOSAL, label: 'Proposta', statusLabel: 'Proposta', icon: 'pi pi-file', severity: 'info' as const },
    { value: AttendanceStatus.QUOTATION, label: 'Pedido', statusLabel: 'Pedido', icon: 'pi pi-shopping-cart', severity: 'info' as const },
    { value: AttendanceStatus.PAYMENT_PENDING, label: 'Pagamento', statusLabel: 'Pagamento', icon: 'pi pi-wallet', severity: 'warn' as const },
    { value: AttendanceStatus.INVOICING_PENDING, label: 'Faturamento', statusLabel: 'Faturamento', icon: 'pi pi-receipt', severity: 'warn' as const },
    { value: AttendanceStatus.DELIVERY_PENDING, label: 'Entrega', statusLabel: 'Entrega', icon: 'pi pi-truck', severity: 'info' as const },
    { value: AttendanceStatus.COMPLETED, label: 'Concluído', statusLabel: 'Concluído', icon: 'pi pi-check-circle', severity: 'success' as const }
];

export const ATTENDANCE_STAGES = [
    ...ATTENDANCE_WORKFLOW.map((stage) => ({ ...stage, label: stage.statusLabel })),
    { value: AttendanceStatus.APPROVAL_PENDING, label: 'Proposta (aprovação anterior)', icon: 'pi pi-file', severity: 'info' as const },
    { value: AttendanceStatus.DOCUMENTS_PENDING, label: 'Pedido (documentos anteriores)', icon: 'pi pi-id-card', severity: 'info' as const },
    { value: AttendanceStatus.CANCELLED, label: 'Cancelado', icon: 'pi pi-ban', severity: 'danger' as const }
];
