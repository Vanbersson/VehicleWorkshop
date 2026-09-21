import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';


import { User } from '@/app/models/user';
import { MessageResponse } from '@/app/models/message-response';
import { StorageService } from '../storage/storage.service';


@Injectable({
    providedIn: 'root'
})
export class UserService {

    private storage = inject(StorageService);
    private http = inject(HttpClient);

    private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    saveUser(user: User): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/user/save", user, { headers: this.myHeaders(), observe: 'response' });
    }
    updateUser(user: User): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/user/update", user, { headers: this.myHeaders(), observe: 'response' });
    }
    updatePassword(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/user/update/password", data, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/user/" + this.companyResale + "/all", { headers: this.myHeaders(), observe: 'response' });
    }
    filterId(id: number): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/user/" + this.companyResale + "/filter/id/" + id, { headers: this.myHeaders(), observe: 'response' });
    }

    filterEmail(email: string): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/user/" + this.companyResale + "/filter/email/" + email, { headers: this.myHeaders(), observe: 'response' });
    }

    filterRoleId(id: number): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(environment.apiuUrl + "/user/" + this.companyResale + "/filter/role/" + id, { headers: this.myHeaders(), observe: 'response' });
    }

    uploadImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/user/upload/image", data, { headers: this.myHeaders(), observe: 'response' });
    }

    public deleteImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/user/delete/image", data, { headers: this.myHeaders(), observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }

}
