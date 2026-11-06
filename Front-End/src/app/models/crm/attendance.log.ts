export interface AttendanceLog {
    id: number;
    stage: string;
    action: string;
    userId: number | null;
    userName: string | null;
    clientId?: number | null;
    clientName?: string | null;
    occurredAt: string;
    documentId: number | null;
    fileName: string | null;
    previousAmount?: number | null;
    newAmount?: number | null;
}
