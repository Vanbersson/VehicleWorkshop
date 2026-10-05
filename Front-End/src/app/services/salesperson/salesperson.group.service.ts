import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { SalespersonGroup } from '@/app/models/salesperson/salesperson.group';

@Injectable({
    providedIn: 'root'
})
export class SalespersonGroupService {
    private storage = inject(StorageService);
    private http = inject(HttpClient);

    save(client: SalespersonGroup): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/salesperson/group/save`, client, { headers: this.myHeaders(), observe: 'response' });
    }
    update(client: SalespersonGroup): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/salesperson/group/update`, client, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<SalespersonGroup[]> {
        return this.http.get<SalespersonGroup[]>(`${environment.apiuUrl}/salesperson/group/all`, { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<SalespersonGroup[]> {
        return this.http.get<SalespersonGroup[]>(`${environment.apiuUrl}/salesperson/group/all/enabled`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}