import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ToolControlMatMec } from '@/app/models/workshop/tool.control/tool.control.mat.mec';
import { StorageService } from '../../storage/storage.service';


@Injectable({
    providedIn: 'root'
})
export class ToolControlMatMecService {
    private storage = inject(StorageService);
    private http = inject(HttpClient);
    private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    saveMaterial(matMec: ToolControlMatMec): Observable<HttpResponse<ToolControlMatMec>> {
        return this.http.post<ToolControlMatMec>(`${environment.apiuUrl}/workshop/tool/control/matmec/save`, matMec, { headers: this.myHeaders(), observe: 'response' });
    }
    returnMaterial(matMec: ToolControlMatMec): Observable<HttpResponse<ToolControlMatMec>> {
        return this.http.post<ToolControlMatMec>(`${environment.apiuUrl}/workshop/tool/control/matmec/return`, matMec, { headers: this.myHeaders(), observe: 'response' });
    }
    filterId(id: string): Observable<HttpResponse<ToolControlMatMec>> {
        return this.http.get<ToolControlMatMec>(`${environment.apiuUrl}/workshop/tool/control/matmec/${this.companyResale}/filter/id/${id}`, { headers: this.myHeaders(), observe: 'response' });
    }
    filterRequesId(id: number): Observable<ToolControlMatMec[]> {
        return this.http.get<ToolControlMatMec[]>(`${environment.apiuUrl}/workshop/tool/control/matmec/${this.companyResale}/filter/request/${id}`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }

}