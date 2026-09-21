import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { MechanicDepartment } from '@/app/models/workshop/mechanic.department';

@Injectable({
    providedIn: 'root'
})
export class MechanicDepartmentService {
    private storage = inject(StorageService);
    private http = inject(HttpClient);
    private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    save(dep: MechanicDepartment): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/workshop/reg/mec/department/save", dep, { headers: this.myHeaders(), observe: 'response' });
    }
    update(dep: MechanicDepartment): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/workshop/reg/mec/department/update", dep, { headers: this.myHeaders(), observe: 'response' });
    }

    listAll(): Observable<MechanicDepartment[]> {
        return this.http.get<MechanicDepartment[]>(environment.apiuUrl + "/workshop/reg/mec/department/" + this.companyResale + "/all", { headers: this.myHeaders() });
    }
    listAllEnabled(): Observable<MechanicDepartment[]> {
        return this.http.get<MechanicDepartment[]>(environment.apiuUrl + "/workshop/reg/mec/department/" + this.companyResale + "/all/enabled", { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
