import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
import { Salesperson } from '@/app/models/crm/salesperson';
import { MessageResponse } from '@/app/models/message-response';

@Injectable({
    providedIn: 'root'
})
export class SalespersonService {
    private http = inject(HttpClient);
    private storage = inject(StorageService);

    save(person: Salesperson): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/salesperson/save`, person, { headers: this.myHeaders(), observe: 'response' });
    }
    update(person: Salesperson): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/salesperson/update`, person, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<Salesperson[]> {
        return this.http.get<Salesperson[]>(`${environment.apiuUrl}/salesperson/all`, { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<Salesperson[]> {
        return this.http.get<Salesperson[]>(`${environment.apiuUrl}/salesperson/all/enabled`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }

}