import { AttendanceLog } from '@/app/models/crm/attendance.log';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerAttendance, AttendanceCreate, AttendanceUpdate, AttendanceCancel, AttendanceQueryMode, AttendanceSearch } from '@/app/models/crm/customer.attendance';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';
import { AttendanceQuoteResponse, AttendanceQuoteSave } from '@/app/models/crm/attendance.quote';
import { AttendanceDetail } from '@/app/models/crm/attendance.detail';
import { AttendanceDocument, AttendanceDocumentStage, AttendanceDocumentShare } from '@/app/models/crm/attendance.document';
import { Salesperson } from '@/app/models/crm/salesperson';

@Injectable({ providedIn: 'root' })
export class CustomerAttendanceService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);

    logs(id: number): Observable<AttendanceLog[]> {
        return this.http.get<AttendanceLog[]>(`${environment.apiuUrl}/crm/customer-attendance/${id}/logs`, { headers: this.headers() });
    }

    list(): Observable<CustomerAttendance[]> {
        return this.http.get<CustomerAttendance[]>(`${environment.apiuUrl}/crm/customer-attendance`, { headers: this.headers() });
    }

    create(data: AttendanceCreate): Observable<CustomerAttendance> {
        return this.http.post<CustomerAttendance>(`${environment.apiuUrl}/crm/customer-attendance`, data, { headers: this.headers() });
    }

    creationSalespersons(): Observable<Salesperson[]> {
        return this.http.get<Salesperson[]>(`${environment.apiuUrl}/crm/customer-attendance/creation-salespersons`, { headers: this.headers() });
    }

    detail(id: number): Observable<AttendanceDetail> {
        return this.http.get<AttendanceDetail>(`${environment.apiuUrl}/crm/customer-attendance/${id}`, { headers: this.headers() });
    }

    search(mode: AttendanceQueryMode, filters: AttendanceSearch): Observable<CustomerAttendance[]> {
        const query = mode === 'CANCELLED' ? 'cancelled' : 'active';
        return this.http.post<CustomerAttendance[]>(`${environment.apiuUrl}/crm/customer-attendance/${query}/search`, filters, { headers: this.headers() });
    }

    update(data: AttendanceUpdate): Observable<CustomerAttendance> {
        return this.http.post<CustomerAttendance>(`${environment.apiuUrl}/crm/customer-attendance/update`, data, { headers: this.headers() });
    }

    cancel(data: AttendanceCancel): Observable<CustomerAttendance> {
        return this.http.post<CustomerAttendance>(`${environment.apiuUrl}/crm/customer-attendance/cancel`, data, { headers: this.headers() });
    }

    private headers(): HttpHeaders {
        return new HttpHeaders({ Authorization: `Bearer ${this.storage.token}` });
    }

    getQuote(attendanceId: number): Observable<AttendanceQuoteResponse> {
        return this.http.get<AttendanceQuoteResponse>(`${environment.apiuUrl}/crm/customer-attendance/quote/${attendanceId}`, { headers: this.headers() });
    }

    saveQuote(data: AttendanceQuoteSave): Observable<AttendanceQuoteResponse> {
        return this.http.post<AttendanceQuoteResponse>(`${environment.apiuUrl}/crm/customer-attendance/quote`, data, { headers: this.headers() });
    }

    documents(attendanceId: number, stage: AttendanceDocumentStage = 'DOCUMENTS'): Observable<AttendanceDocument[]> {
        return this.http.get<AttendanceDocument[]>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents`, { headers: this.headers(), params: { stage } });
    }

    uploadDocument(attendanceId: number, file: File, stage: AttendanceDocumentStage = 'DOCUMENTS'): Observable<AttendanceDocument> {
        const data = new FormData();
        data.append('file', file);
        data.append('stage', stage);
        return this.http.post<AttendanceDocument>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents`, data, { headers: this.headers() });
    }

    uploadPaymentReceipt(attendanceId: number, file: File, receiptAmount: number): Observable<AttendanceDocument> {
        const data = new FormData();
        data.append('file', file);
        data.append('stage', 'PAYMENT');
        data.append('receiptAmount', receiptAmount.toFixed(2));
        return this.http.post<AttendanceDocument>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents`, data, { headers: this.headers() });
    }
    
    updatePaymentReceiptValue(attendanceId: number, documentId: number, receiptAmount: number): Observable<AttendanceDocument> {
        return this.http.post<AttendanceDocument>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/payment-value`, { receiptAmount }, { headers: this.headers() });
    }

    shareOrderDocument(attendanceId: number, documentId: number): Observable<AttendanceDocumentShare> {
        return this.http.post<AttendanceDocumentShare>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/order-share`, {}, { headers: this.headers() });
    }

    shareProposalDocument(attendanceId: number, documentId: number): Observable<AttendanceDocumentShare> {
        return this.http.post<AttendanceDocumentShare>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/share`, {}, { headers: this.headers() });
    }

    removePaymentReceipt(attendanceId: number, documentId: number): Observable<void> {
        return this.http.post<void>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/payment-remove`, {}, { headers: this.headers() });
    }
    removeOrderDocument(attendanceId: number, documentId: number): Observable<void> {
        return this.http.post<void>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/order-remove`, null, { headers: this.headers() });
    }

    removeProposalDocument(attendanceId: number, documentId: number): Observable<void> {
        return this.http.post<void>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/remove`, null, { headers: this.headers() });
    }

    downloadSignedOrder(attendanceId: number, documentId: number): Observable<Blob> {
        return this.http.get(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/order-signed`, { headers: this.headers(), responseType: 'blob' });
    }

    downloadSignedProposal(attendanceId: number, documentId: number): Observable<Blob> {
        return this.http.get(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}/signed`, { headers: this.headers(), responseType: 'blob' });
    }

    downloadDocument(attendanceId: number, documentId: number): Observable<Blob> {
        return this.http.get(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}`, { headers: this.headers(), responseType: 'blob' });
    }
}
