export enum AttendanceStatus {
    VISIT_COMPLETED = 'VISIT_COMPLETED',
    QUOTATION = 'QUOTATION',
    DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
    PAYMENT_PENDING = 'PAYMENT_PENDING',
    COMMERCIAL_PROPOSAL = 'COMMERCIAL_PROPOSAL',
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface CustomerAttendance {
    id: number;
    visitId: number;
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
    cancellationReason?: string | null;
    cancelledAt?: string | null;
    cancelledByName?: string | null;
    documentsNotes?: string | null;
    proposalNotes?: string | null;
    approvalRequestedAt?: string | null;
    completedAt?: string | null;
}

export interface AttendanceUpdate {
    clientId?: number;
    id: number;
    status: AttendanceStatus;
    notes: string;
    version: number;
    documentsNotes?: string;
    proposalNotes?: string;
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
    { value: AttendanceStatus.DOCUMENTS_PENDING, label: 'Documentos', statusLabel: 'Documentos', icon: 'pi pi-id-card', severity: 'warn' as const },
    { value: AttendanceStatus.COMMERCIAL_PROPOSAL, label: 'Proposta comercial', statusLabel: 'Proposta comercial', icon: 'pi pi-file', severity: 'info' as const },
    { value: AttendanceStatus.QUOTATION, label: 'Orçamento', statusLabel: 'Orçamento', icon: 'pi pi-file-edit', severity: 'info' as const },
    { value: AttendanceStatus.APPROVAL_PENDING, label: 'Enviar para aprovação', statusLabel: 'Aguardando aprovação', icon: 'pi pi-send', severity: 'warn' as const },
    { value: AttendanceStatus.COMPLETED, label: 'Concluído', statusLabel: 'Concluído', icon: 'pi pi-check-circle', severity: 'success' as const }
];

export const ATTENDANCE_STAGES = [
    ...ATTENDANCE_WORKFLOW.map((stage) => ({ ...stage, label: stage.statusLabel })),
    { value: AttendanceStatus.PAYMENT_PENDING, label: 'Pagamento pendente', icon: 'pi pi-wallet', severity: 'danger' as const },
    { value: AttendanceStatus.CANCELLED, label: 'Cancelado', icon: 'pi pi-ban', severity: 'danger' as const }
];
