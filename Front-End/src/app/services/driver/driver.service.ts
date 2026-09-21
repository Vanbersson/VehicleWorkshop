import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '@/app/models/driver';
import { MessageResponse } from '@/app/models/message-response';
import { StorageService } from '../storage/storage.service';


@Injectable({
    providedIn: 'root'
})
export class DriverService {
    storage = inject(StorageService);
    http = inject(HttpClient);

    companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    save(driver: Driver): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/driver/save", driver, { headers: this.myHeaders(), observe: 'response' });
    }
    update(driver: Driver): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/driver/update", driver, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/driver/" + this.companyResale + "/filter/all", { headers: this.myHeaders(), observe: 'response' });
    }
    filterId(id: number): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/driver/" + this.companyResale + "/filter/id/" + id, { headers: this.myHeaders(), observe: 'response' });
    }
    filterCPF(cpf: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/driver/" + this.companyResale + "/filter/cpf/" + cpf, { headers: this.myHeaders(), observe: 'response' });
    }
    filterRG(rg: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/driver/" + this.companyResale + "/filter/rg/" + rg, { headers: this.myHeaders(), observe: 'response' });
    }
    filterName(name: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/driver/" + this.companyResale + "/filter/name/" + name, { headers: this.myHeaders(), observe: 'response' });
    }
    filterCNHRegister(cnh: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/driver/" + this.companyResale + "/filter/cnh/register/" + cnh, { headers: this.myHeaders(), observe: 'response' });
    }

    savePhotoDriver(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/driver/save/photo", data, { headers: this.myHeaders(), observe: 'response' });
    }
    savePhotoDoc1(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/driver/save/doc1", data, { headers: this.myHeaders(), observe: 'response' });
    }
    savePhotoDoc2(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/driver/save/doc2", data, { headers: this.myHeaders(), observe: 'response' });
    }
    deletePhoto(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/driver/delete/photo", data, { headers: this.myHeaders(), observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}