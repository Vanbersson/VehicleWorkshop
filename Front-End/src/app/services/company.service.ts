import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { StorageService } from '@/app/services/storage/storage.service';
import { environment } from '@/environments/environment';
import { IResale, ResaleSave } from '@/app/interfaces/conf-company/i.resale';
import { ICompany, CompanySave } from '@/app/interfaces/conf-company/i.company';
@Injectable({ providedIn: 'root' })
export class CompanyService {
    private readonly http = inject(HttpClient);
    private readonly storage = inject(StorageService);
    list(): Observable<ICompany[]> {
        return this.http.get<ICompany[]>(`${environment.apiuUrl}/company/all`, { headers: this.headers() });
    }
    resales(companyId: number): Observable<IResale[]> {
        return this.http.get<IResale[]>(`${environment.apiuUrl}/resale/filter/company/${companyId}`, { headers: this.headers() });
    }
    saveCompany(data: CompanySave): Observable<void> {
        return this.http.post<void>(`${environment.apiuUrl}/company/${data.id ? 'update' : 'save'}`, data, { headers: this.headers() });
    }
    saveResale(data: ResaleSave): Observable<IResale> {
        return this.http.post<IResale>(`${environment.apiuUrl}/resale/${data.id ? 'update' : 'save'}`, data, { headers: this.headers() });
    }
    private headers(): HttpHeaders {
        return new HttpHeaders({ Authorization: `Bearer ${this.storage.token}` });
    }
}
