import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  storage = inject(StorageService);
  http = inject(HttpClient);
  
  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  countVehiclePenAuth(): Observable<HttpResponse<any>> {
    return this.http.get<any>(environment.apiuUrl + "/dashboard/" + this.companyResale + "/count/vehicle", { headers: this.myHeaders(), observe: 'response' });
  }

  countYesServiceFilterYear(year: number): Observable<HttpResponse<any>> {
    return this.http.get<any>(environment.apiuUrl + "/dashboard/" + this.companyResale + "/filter/yes/service/year/" + year, { headers: this.myHeaders(), observe: 'response' });
  }

  countNotServiceFilterYear(year: number): Observable<HttpResponse<any>> {
    return this.http.get<any>(environment.apiuUrl + "/dashboard/" + this.companyResale + "/filter/not/service/year/" + year, { headers: this.myHeaders(), observe: 'response' });
  }

  countYesServiceFilterYearClient(year: number, clientId: number): Observable<HttpResponse<any>> {
    return this.http.get<any>(environment.apiuUrl + "/dashboard/" + this.companyResale + "/filter/yes/service/year/" + year + "/client/" + clientId, { headers: this.myHeaders(), observe: 'response' });
  }

  countVehicleFilterYear(year: number): Observable<HttpResponse<any>> {
    return this.http.get<any>(environment.apiuUrl + "/dashboard/" + this.companyResale + "/filter/vehicle/year/" + year, { headers: this.myHeaders(), observe: 'response' });
  }
  countVehicleFilterYearClient(year: number, clientId: number): Observable<HttpResponse<any>> {
    return this.http.get<any>(environment.apiuUrl + "/dashboard/" + this.companyResale + "/filter/vehicle/year/" + year + "/client/" + clientId, { headers: this.myHeaders(), observe: 'response' });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}