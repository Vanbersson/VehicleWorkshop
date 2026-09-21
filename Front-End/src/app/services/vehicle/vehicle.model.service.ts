import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { VehicleModel } from '@/app/models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleModelService {
  http = inject(HttpClient);
  storage = inject(StorageService);

  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  save(model: VehicleModel): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/model/save", model, { headers: this.myHeaders(), observe: 'response' });
  }
  update(model: VehicleModel): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/model/update", model, { headers: this.myHeaders(), observe: 'response' });
  }
  listAll(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(environment.apiuUrl + "/vehicle/model/"+this.companyResale+"/all", { headers: this.myHeaders() });
  }
  getAllEnabled(): Observable<VehicleModel[]> {
    return this.http.get<VehicleModel[]>(environment.apiuUrl + "/vehicle/model/"+this.companyResale+"/all/enabled", { headers: this.myHeaders() });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }

}
