export type ApprovalKind = 'proposals' | 'orders';
export interface ApprovalPageData {
    accessRequired: boolean;
    fileName: string | null;
    contentType: string | null;
    size: number | null;
    signedFileName: string | null;
    signedUploadedAt: string | null;
    approvedAt: string | null;
}
