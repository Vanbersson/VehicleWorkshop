import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { ClientCompanyRegion } from '@/app/models/client.company.region';

@Injectable({
    providedIn: 'root'
})
export class ClientCompanyRegionService {
    private storage = inject(StorageService);
    private http = inject(HttpClient);

    save(client: ClientCompanyRegion): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/clientcompany/region/save`, client, { headers: this.myHeaders(), observe: 'response' });
    }
    update(client: ClientCompanyRegion): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/clientcompany/region/update`, client, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<ClientCompanyRegion[]> {
        return this.http.get<ClientCompanyRegion[]>(`${environment.apiuUrl}/clientcompany/region/all`, { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<ClientCompanyRegion[]> {
        return this.http.get<ClientCompanyRegion[]>(`${environment.apiuUrl}/clientcompany/region/all/enabled`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}