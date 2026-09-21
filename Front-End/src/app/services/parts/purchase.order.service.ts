import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { MessageResponse } from '@/app/models/message-response';


@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  storage = inject(StorageService);
  http = inject(HttpClient);
  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  public save(purchase: PurchaseOrder): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(`${environment.apiuUrl}/purchase/order/save`, purchase, { headers: this.myHeaders(), observe: 'response' });
  }

  public update(purchase: PurchaseOrder): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(`${environment.apiuUrl}/purchase/order/update`, purchase, { headers: this.myHeaders(), observe: 'response' });
  }
  
  public close(purchase: PurchaseOrder): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(`${environment.apiuUrl}/purchase/order/close`, purchase, { headers: this.myHeaders(), observe: 'response' });
  }

  public filterOpen(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(environment.apiuUrl + "/purchase/order/" + this.companyResale + "/filter/open", { headers: this.myHeaders() });
  }

  public filterId(id: number): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/purchase/order/" + this.companyResale + "/filter/id/" + id, { headers: this.myHeaders(), observe: 'response' });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
