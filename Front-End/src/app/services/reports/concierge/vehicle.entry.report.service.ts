import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleEntryReportService {

  constructor(private http: HttpClient, private storage: StorageService) { }

  filterVehicle(data: any): Observable<HttpResponse<VehicleEntry[]>> {
    return this.http.post<VehicleEntry[]>(environment.apiuUrl + "/reports/concierge/filter/vehicle/entry", data, { headers: this.myHeaders(), observe: 'response' });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }

}
