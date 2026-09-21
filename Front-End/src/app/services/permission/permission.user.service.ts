import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';

import { Observable } from 'rxjs';

import { PermissionUser } from '@/app/models/permission.user';
import { MessageResponse } from '@/app/models/message-response';
import { Permission } from '@/app/models/permission';


@Injectable({
    providedIn: 'root'
})
export class PermissionUserService {

    constructor(private http: HttpClient, private storage: StorageService) { }

    save(user: PermissionUser): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/permission/user/save`, user, { headers: this.myHeaders(), observe: 'response' });
    }

    update(user: PermissionUser): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/permission/user/update`, user, { headers: this.myHeaders(), observe: 'response' });
    }

    filterUser(compamyId: number, resaleId: number, userId: number): Observable<PermissionUser[]> {
        return this.http.get<PermissionUser[]>(`${environment.apiuUrl}/permission/user/${compamyId}/${resaleId}/filter/u/${userId}`, { headers: this.myHeaders() });
    }

    filterPermission(compamyId: number, resaleId: number, userId: number, permission: number): Observable<HttpResponse<MessageResponse>> {
        return this.http.get<MessageResponse>(`${environment.apiuUrl}/permission/user/${compamyId}/${resaleId}/filter/u/${userId}/p/${permission}`, { headers: this.myHeaders(), observe: 'response' });
    }

    deleteAllUser(user: PermissionUser): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/permission/user/all/delete`, user, { headers: this.myHeaders(), observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}