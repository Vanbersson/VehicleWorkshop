import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ToolControlMaterial } from '@/app/models/workshop/tool.control/tool.control.material';
import { MessageResponse } from '@/app/models/message-response';

@Injectable({
    providedIn: 'root'
})
export class ToolControlMaterialService {
    private storage = inject(StorageService);
    private http = inject(HttpClient);

    private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    save(mat: ToolControlMaterial): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/workshop/tool/control/material/save`, mat, { headers: this.myHeaders(), observe: 'response' });
    }
    update(mat: ToolControlMaterial): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/workshop/tool/control/material/update`, mat, { headers: this.myHeaders(), observe: 'response' });
    }
    filterId(id: number): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(`${environment.apiuUrl}/workshop/tool/control/material/${this.companyResale}/filter/id/${id}`, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<ToolControlMaterial[]> {
        return this.http.get<ToolControlMaterial[]>(environment.apiuUrl + "/workshop/tool/control/material/" + this.companyResale + "/all", { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<ToolControlMaterial[]> {
        return this.http.get<ToolControlMaterial[]>(environment.apiuUrl + "/workshop/tool/control/material/" + this.companyResale + "/all/enabled", { headers: this.myHeaders() });
    }
    saveImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/workshop/tool/control/material/save/image`, data, { headers: this.myHeaders(), observe: 'response' });
    }
    deleteImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/workshop/tool/control/material/delete/image`, data, { headers: this.myHeaders(), observe: 'response' });
    }
    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}