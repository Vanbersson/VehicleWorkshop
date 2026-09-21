import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { Permission } from '@/app/models/permission';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {

    constructor(private http: HttpClient, private storage: StorageService) { }

    listAll(): Observable<Permission[]> {
        return this.http.get<Permission[]>(`${environment.apiuUrl}/permission/all`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}