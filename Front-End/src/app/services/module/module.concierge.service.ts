import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { ModuleConciergeVehicleChecklist } from '@/app/models/module.concierge.vehicle.checklist';


@Injectable({
  providedIn: 'root'
})
export class ModuleConciergeService {
private storage = inject(StorageService);
    private http = inject(HttpClient);

  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  updateUser(mod: ModuleConciergeVehicleChecklist): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/module/concierge/vehicle/entry/checklist/update", mod, { headers: this.myHeaders(), observe: 'response' });
  }
  filterCompanyResale(): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/module/concierge/vehicle/entry/checklist/" + this.companyResale + "/checklist" , { headers: this.myHeaders(), observe: 'response' });
  }


  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
