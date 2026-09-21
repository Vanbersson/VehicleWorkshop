import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

import { StorageService } from '../storage/storage.service';
import { UserRole } from '@/app/models/user.role';



@Injectable({
    providedIn: 'root'
})
export class UserRoleService {

    storage = inject(StorageService);
    http = inject(HttpClient);

    companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    listAll(): Observable<UserRole[]> {
        return this.http.get<UserRole[]>(environment.apiuUrl + "/user/role/" + this.companyResale + "/all", { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<UserRole[]> {
        return this.http.get<UserRole[]>(environment.apiuUrl + "/user/role/" + this.companyResale + "/all/enabled", { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
