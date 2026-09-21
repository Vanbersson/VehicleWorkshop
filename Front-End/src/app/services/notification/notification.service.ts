import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MessageResponse } from '@/app/models/message-response';
import { NotificationUser } from '@/app/models/notification/notification-user';
import { Notification } from '@/app/models/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  storage = inject(StorageService);
  http = inject(HttpClient);

  private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  filterUser(userId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(environment.apiuUrl + "/notification/user/" + this.companyResale + "/filter/u/" + userId, { headers: this.myHeaders() });
  }

  deleteNotification(no: Notification): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/notification/user/delete", no, { headers: this.myHeaders(), observe: 'response' });
  }
  
  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
