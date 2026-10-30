import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core'
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { Visit } from '@/app/models/crm/visit/visit';
import { environment } from '@/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class VisitService {

    storage = inject(StorageService);
    http = inject(HttpClient);

    registerNew(p: Visit): Observable<HttpResponse<Visit>> {
        return this.http.post<Visit>(`${environment.apiuUrl}/salesperson/visit/register/new`, p, { headers: this.myHeaders(), observe: 'response' });
    }
    registerUpdate(p: Visit): Observable<HttpResponse<Visit>> {
        return this.http.post<Visit>(`${environment.apiuUrl}/salesperson/visit/register/update`, p, { headers: this.myHeaders(), observe: 'response' });
    }

    visitFilterId(id: number): Observable<HttpResponse<Visit>> {
        return this.http.get<Visit>(`${environment.apiuUrl}/salesperson/visit/id/${id}`, { headers: this.myHeaders(), observe: 'response' });
    }

    listAll(): Observable<Visit[]> {
        return this.http.get<Visit[]>(`${environment.apiuUrl}/salesperson/visit/all`, { headers: this.myHeaders() });
    }

    listAllAgenda(): Observable<Visit[]> {
        return this.http.get<Visit[]>(`${environment.apiuUrl}/salesperson/visit/all/agenda`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }

}