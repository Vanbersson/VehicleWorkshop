export type AttendanceDocumentStage = 'PROPOSAL' | 'DOCUMENTS' | 'PAYMENT' | 'INVOICING' | 'DELIVERY';

export interface AttendanceDocument {
    stage?: AttendanceDocumentStage;
    proposalApprovedAt?: string | null;
    orderApprovedAt?: string | null;
    signedFileName?: string | null;
    signedUploadedAt?: string | null;
    receiptAmount?: number | null;
    uploadedByUserId?: number | null;
    uploadedByUserName?: string | null;
    updatedByUserId?: number | null;
    updatedByUserName?: string | null;
    updatedAt?: string | null;
    id: number;
    fileName: string;
    contentType: string;
    size: number;
    createdAt: string;
}

export interface AttendanceDocumentShare {
    path: string;
    expiresAt: string;
}
