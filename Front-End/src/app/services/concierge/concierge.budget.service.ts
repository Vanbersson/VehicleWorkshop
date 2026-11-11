import { ConciergeBudgetDocument } from '@/app/models/concierge.budget.document';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';
import { ConciergeBudget, ConciergeBudgetCreate } from '@/app/models/concierge.budget';
@Injectable({ providedIn: 'root' })
export class ConciergeBudgetService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);
    private get url(): string {
        return environment.apiuUrl + '/concierge/budgets/' + this.storage.companyId + '/' + this.storage.resaleId;
    }
    private headers(): HttpHeaders {
        return new HttpHeaders({ Authorization: 'Bearer ' + this.storage.token });
    }
    attendants(): Observable<{ id: number; name: string }[]> {
        return this.http.get<{ id: number; name: string }[]>(this.url + '/attendants', { headers: this.headers() });
    }
    list(status = 'OpenBudget'): Observable<ConciergeBudget[]> {
        return this.http.get<ConciergeBudget[]>(this.url, { headers: this.headers(), params: { status } });
    }
    share(id: number): Observable<{ path: string; expiresAt: string }> {
        return this.http.post<{ path: string; expiresAt: string }>(this.url + '/' + id + '/share', {}, { headers: this.headers() });
    }
    documents(id: number): Observable<ConciergeBudgetDocument[]> {
        return this.http.get<ConciergeBudgetDocument[]>(this.url + '/' + id + '/documents', { headers: this.headers() });
    }
    uploadDocument(id: number, file: File): Observable<ConciergeBudgetDocument> {
        const data = new FormData();
        data.append('file', file);
        return this.http.post<ConciergeBudgetDocument>(this.url + '/' + id + '/documents', data, { headers: this.headers() });
    }
    downloadDocument(id: number, documentId: number): Observable<Blob> {
        return this.http.get(this.url + '/' + id + '/documents/' + documentId, { headers: this.headers(), responseType: 'blob' });
    }
    removeDocument(id: number, documentId: number): Observable<void> {
        return this.http.post<void>(this.url + '/' + id + '/documents/' + documentId + '/remove', {}, { headers: this.headers() });
    }
    detail(id: number): Observable<ConciergeBudget> {
        return this.http.get<ConciergeBudget>(this.url + '/' + id, { headers: this.headers() });
    }
    update(id: number, data: ConciergeBudgetCreate): Observable<ConciergeBudget> {
        return this.http.put<ConciergeBudget>(this.url + '/' + id, data, { headers: this.headers() });
    }
    cancel(id: number, reason: string): Observable<ConciergeBudget> {
        return this.http.post<ConciergeBudget>(this.url + '/' + id + '/cancel', { reason }, { headers: this.headers() });
    }
    complete(id: number): Observable<ConciergeBudget> {
        return this.http.post<ConciergeBudget>(this.url + '/' + id + '/complete', {}, { headers: this.headers() });
    }
    create(data: ConciergeBudgetCreate): Observable<ConciergeBudget> {
        return this.http.post<ConciergeBudget>(this.url, data, { headers: this.headers() });
    }
}
