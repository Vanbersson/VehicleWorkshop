import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { Mechanic } from '@/app/models/workshop/mechanic';
import { MessageResponse } from '@/app/models/message-response';

@Injectable({
  providedIn: 'root'
})
export class MechanicService {
  private storage = inject(StorageService);
  private http = inject(HttpClient);
  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  saveMec(mec: Mechanic): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/workshop/reg/mechanic/save", mec, { headers: this.myHeaders(), observe: 'response' });
  }
  updateMec(mec: Mechanic): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/workshop/reg/mechanic/update", mec, { headers: this.myHeaders(), observe: 'response' });
  }

  listAll(): Observable<Mechanic[]> {
    return this.http.get<Mechanic[]>(environment.apiuUrl + "/workshop/reg/mechanic/" + this.companyResale + "/all", { headers: this.myHeaders() });
  }
  listAllEnabled(): Observable<Mechanic[]> {
    return this.http.get<Mechanic[]>(environment.apiuUrl + "/workshop/reg/mechanic/" + this.companyResale + "/all/enabled", { headers: this.myHeaders() });
  }
  filterId(id: number): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/workshop/reg/mechanic/" + this.companyResale + "/filter/" + id, { headers: this.myHeaders(), observe: 'response' });
  }

  savePhoto(data: FormData): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/workshop/reg/mechanic/save/photo", data, { headers: this.myHeaders(), observe: 'response' });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
