import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { MessageResponse } from '@/app/models/message-response';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';

@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderItemConsService {
    storage = inject(StorageService);
    http = inject(HttpClient);

    companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

    public save(item: PurchaseOrderItemCons): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/purchase/order/item/cons/save", item, { headers: this.myHeaders(), observe: 'response' });
    }
    public update(item: PurchaseOrderItemCons): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/purchase/order/item/cons/update", item, { headers: this.myHeaders(), observe: 'response' });
    }
    public delete(item: PurchaseOrderItemCons): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(environment.apiuUrl + "/purchase/order/item/cons/delete", item, { headers: this.myHeaders(), observe: 'response' });
    }
    public filter(purchaseId: number): Observable<PurchaseOrderItemCons[]> {
        return this.http.get<PurchaseOrderItemCons[]>(environment.apiuUrl + "/purchase/order/item/cons/" + this.companyResale + "/filter/purchase/" + purchaseId, { headers: this.myHeaders() });
    }
    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
