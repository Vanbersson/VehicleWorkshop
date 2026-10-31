import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerAttendance, AttendanceUpdate, AttendanceCancel, AttendanceQueryMode, AttendanceSearch } from '@/app/models/crm/customer.attendance';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';
import { AttendanceQuoteResponse, AttendanceQuoteSave } from '@/app/models/crm/attendance.quote';
import { AttendanceDetail } from '@/app/models/crm/attendance.detail';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';

@Injectable({ providedIn: 'root' })
export class CustomerAttendanceService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);

    list(): Observable<CustomerAttendance[]> {
        return this.http.get<CustomerAttendance[]>(`${environment.apiuUrl}/crm/customer-attendance`, { headers: this.headers() });
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

    documents(attendanceId: number): Observable<AttendanceDocument[]> {
        return this.http.get<AttendanceDocument[]>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents`, { headers: this.headers() });
    }

    uploadDocument(attendanceId: number, file: File): Observable<AttendanceDocument> {
        const data = new FormData();
        data.append('file', file);
        return this.http.post<AttendanceDocument>(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents`, data, { headers: this.headers() });
    }

    downloadDocument(attendanceId: number, documentId: number): Observable<Blob> {
        return this.http.get(`${environment.apiuUrl}/crm/customer-attendance/${attendanceId}/documents/${documentId}`, { headers: this.headers(), responseType: 'blob' });
    }
}
