import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { MessageResponse } from '@/app/models/message-response';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';


@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderItemService {
  storage = inject(StorageService);
  http = inject(HttpClient);

  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  public save(item: PurchaseOrderItem): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/purchase/order/item/save", item, { headers: this.myHeaders(), observe: 'response' });
  }
  public update(item: PurchaseOrderItem): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/purchase/order/item/update", item, { headers: this.myHeaders(), observe: 'response' });
  }
  public delete(item: PurchaseOrderItem): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/purchase/order/item/delete", item, { headers: this.myHeaders(), observe: 'response' });
  }
  public filterId(purchaseId: number): Observable<PurchaseOrderItem[]> {
    return this.http.get<PurchaseOrderItem[]>(environment.apiuUrl + "/purchase/order/item/" + this.companyResale + "/filter/purchase/" + purchaseId, { headers: this.myHeaders() });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
