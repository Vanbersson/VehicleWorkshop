import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { StorageService } from '@/app/services/storage/storage.service';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';


@Injectable({
    providedIn: 'root'
})
export class PurchaseOrderReportService {

    constructor(private http: HttpClient, private storage: StorageService) { }

    public filter(filters: any): Observable<PurchaseOrder[]> {
        return this.http.post<PurchaseOrder[]>(`${environment.apiuUrl}/reports/parts/purchase/order/filter`, filters, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + this.storage.token,
        });
        return httpOptions;
    }
}
