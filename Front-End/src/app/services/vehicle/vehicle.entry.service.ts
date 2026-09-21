import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { StorageService } from '../storage/storage.service';

import { MessageResponse } from '@/app/models/message-response';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { VehicleEntryAuth } from '@/app/models/vehicle.entry.auth';
import { VehicleExit } from '@/app/models/vehicle.exit';
import { VehicleEntryChecklist } from '@/app/models/vehicle.entry.checklist';

@Injectable({
  providedIn: 'root'
})
export class VehicleEntryService {

  http = inject(HttpClient);
  storage = inject(StorageService);

  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  entrySave(vehicle: VehicleEntry): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/save", vehicle, { headers: this.myHeaders(), observe: 'response' });
  }

  entryUpdate(vehicle: VehicleEntry): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/update", vehicle, { headers: this.myHeaders(), observe: 'response' });
  }

  entryExit(vehicle: VehicleExit): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/exit", vehicle, { headers: this.myHeaders(), observe: 'response' });
  }

  listAllAuthorized(): Observable<VehicleEntry[]> {
    return this.http.get<VehicleEntry[]>(environment.apiuUrl + "/vehicle/entry/" + this.companyResale + "/all/authorized", { headers: this.myHeaders() });
  }

  listAll(): Observable<VehicleEntry[]> {
    return this.http.get<VehicleEntry[]>(environment.apiuUrl + "/vehicle/entry/" + this.companyResale + "/all", { headers: this.myHeaders() });
  }

  entryFilterId(id: number): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/vehicle/entry/" + this.companyResale + "/filter/id/" + id, { headers: this.myHeaders(), observe: 'response' });
  }

  saveChecklist(ch: VehicleEntryChecklist): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/save/checklist", ch, { headers: this.myHeaders(), observe: 'response' });
  }
  updateChecklist(ch: VehicleEntryChecklist): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/update/checklist", ch, { headers: this.myHeaders(), observe: 'response' });
  }

   filterChecklist(id: number): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/vehicle/entry/" + this.companyResale + "/filter/checklist/" + id, { headers: this.myHeaders(), observe: 'response' });
  }

  filterPlate(plate: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/vehicle/entry/" + this.companyResale + "/filter/plate/" + plate, { headers: this.myHeaders(), observe: 'response' });
  }

   filterTogether(together: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/vehicle/entry/" + this.companyResale + "/filter/together/" + together, { headers: this.myHeaders(), observe: 'response' });
  }

  entryAddAuth(auth: VehicleEntryAuth): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/authorization/add", auth, { headers: this.myHeaders(), observe: 'response' });
  }

  entryDeleteAuth1(auth: VehicleEntryAuth): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/authorization/delete1", auth, { headers: this.myHeaders(), observe: 'response' });
  }

  entryDeleteAuth2(auth: VehicleEntryAuth): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/authorization/delete2", auth, { headers: this.myHeaders(), observe: 'response' });
  }
  saveImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/save/image", data, { headers: this.myHeaders(), observe: 'response' });
  }

  deleteImage(data: FormData): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/vehicle/entry/delete/image",data, { headers: this.myHeaders(), observe: 'response' });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }

}
