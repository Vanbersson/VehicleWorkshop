import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { Part } from '@/app/models/parts/part';
import { IPartList } from '@/app/interfaces/i.part.list';


@Injectable({
    providedIn: 'root'
})
export class PartService {
    storage = inject(StorageService);
    http = inject(HttpClient);

    companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    save(parts: Part): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/part/save`, parts, { headers: this.myHeaders(), observe: 'response' });
    }
    update(parts: Part): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/part/update`, parts, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<IPartList[]> {
        return this.http.get<IPartList[]>(`${environment.apiuUrl}/part/${this.companyResale}/list/all`, { headers: this.myHeaders() });
    }
    filterId(id: number): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/part/" + this.companyResale + "/filter/id/" + id, { headers: this.myHeaders(), observe: 'response' });
    }
    filterCode(code: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/part/" + this.companyResale + "/filter/code/" + code, { headers: this.myHeaders(), observe: 'response' });
    }
    filterDesc(desc: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/part/" + this.companyResale + "/filter/desc/" + desc, { headers: this.myHeaders(), observe: 'response' });
    }

    saveImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/part/save/image", data, { headers: this.myHeaders(), observe: 'response' });
    }

    deleteImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/part/delete/image", data, { headers: this.myHeaders(), observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
