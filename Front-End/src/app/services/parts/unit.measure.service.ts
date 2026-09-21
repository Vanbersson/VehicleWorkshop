import { UnitMeasure } from '@/app/models/parts/unit.measure';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UnitMeasureService {

    constructor(private http: HttpClient, private storage: StorageService) { }

    save(unit: UnitMeasure): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/unit/measure/save", unit, { headers: this.myHeaders(), observe: 'response' });
    }
    update(unit: UnitMeasure): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/unit/measure/update", unit, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<UnitMeasure[]> {
        return this.http.get<UnitMeasure[]>(environment.apiuUrl + "/unit/measure/list/all", { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<UnitMeasure[]> {
        return this.http.get<UnitMeasure[]>(environment.apiuUrl + "/unit/measure/list/all/enabled", { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
