import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { CategoryPart } from '@/app/models/parts/category.part';
import { MessageResponse } from '@/app/models/message-response';


@Injectable({
    providedIn: 'root'
})
export class CategoryPartService {
    storage = inject(StorageService);
    http = inject(HttpClient);
    companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    save(cat: CategoryPart): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/part/category/save", cat, { headers: this.myHeaders(), observe: 'response' });
    }
    update(cat: CategoryPart): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/part/category/update", cat, { headers: this.myHeaders(), observe: 'response' });
    }
    listAll(): Observable<CategoryPart[]> {
        return this.http.get<CategoryPart[]>(environment.apiuUrl + "/part/category/" + this.companyResale + "/list/all", { headers: this.myHeaders() });
    }

    listAllEnabled(): Observable<CategoryPart[]> {
        return this.http.get<CategoryPart[]>(environment.apiuUrl + "/part/category/" + this.companyResale + "/list/all/enabled", { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
