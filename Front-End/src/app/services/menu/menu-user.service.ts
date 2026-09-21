import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TreeNode } from 'primeng/api';
import { MessageResponse } from '@/app/models/message-response';
import { MenuUser } from '@/app/models/menu-user';

@Injectable({
  providedIn: 'root'
})
export class MenuUserService {

  constructor(private http: HttpClient, private storage: StorageService) { }

  save(menu: MenuUser): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(`${environment.apiuUrl}/menu/user/save`, menu, { headers: this.myHeaders(), observe: 'response' });
  }
  
   update(menu: MenuUser): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(`${environment.apiuUrl}/menu/user/update`, menu, { headers: this.myHeaders(), observe: 'response' });
  }

  delete(menu: MenuUser): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/menu/user/delete", menu, { headers: this.myHeaders(), observe: 'response' });
  }

  listMenusUser(compamyId: number, resaleId: number, userId: number,): Observable<TreeNode[]> {
    return this.http.get<TreeNode[]>(environment.apiuUrl + "/menu/user/" + compamyId + "/" + resaleId + "/filter/user/" + userId, { headers: this.myHeaders() });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
