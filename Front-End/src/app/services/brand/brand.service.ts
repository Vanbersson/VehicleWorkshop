import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Brand } from '@/app/models/brand';
import { MessageResponse } from '@/app/models/message-response';


@Injectable({
    providedIn: 'root'
})
export class BrandService {

    constructor(private http: HttpClient, private storage: StorageService) { }

    save(brand: Brand): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/brand/save", brand, { headers: this.myHeaders(), observe: 'response' });
    }
    update(brand: Brand): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/brand/update", brand, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<Brand[]> {
        return this.http.get<Brand[]>(environment.apiuUrl + "/brand/list/all", { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<Brand[]> {
        return this.http.get<Brand[]>(environment.apiuUrl + "/brand/list/all/enabled", { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
