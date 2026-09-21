import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';
import { StorageService } from '../../storage/storage.service';
import { IToolControlRequestMechanic } from '@/app/interfaces/workshop/i.tool.control.request.mechanic';


@Injectable({
    providedIn: 'root'
})
export class ToolcontrolReportService {
    private storage = inject(StorageService);
    private http = inject(HttpClient);
    private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    filterMechanicId(id: number): Observable<HttpResponse<IToolControlRequestMechanic>> {
        return this.http.get<IToolControlRequestMechanic>(`${environment.apiuUrl}/workshop/tool/control/report/${this.companyResale}/filter/mec/${id}`, { headers: this.myHeaders(), observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}