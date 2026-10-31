import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company, CompanySave, Resale, ResaleSave } from '@/app/models/company';
import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';
@Injectable({ providedIn: 'root' })
export class CompanyService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);
    list(): Observable<Company[]> {
        return this.http.get<Company[]>(`${environment.apiuUrl}/company/all`, { headers: this.headers() });
    }
    resales(companyId: number): Observable<Resale[]> {
        return this.http.get<Resale[]>(`${environment.apiuUrl}/resale/filter/company/${companyId}`, { headers: this.headers() });
    }
    saveCompany(data: CompanySave): Observable<void> {
        return this.http.post<void>(`${environment.apiuUrl}/company/${data.id ? 'update' : 'save'}`, data, { headers: this.headers() });
    }
    saveResale(data: ResaleSave): Observable<Resale> {
        return this.http.post<Resale>(`${environment.apiuUrl}/resale/${data.id ? 'update' : 'save'}`, data, { headers: this.headers() });
    }
    private headers(): HttpHeaders {
        return new HttpHeaders({ Authorization: `Bearer ${this.storage.token}` });
    }
}
