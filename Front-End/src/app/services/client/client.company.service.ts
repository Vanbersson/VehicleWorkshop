import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from '../storage/storage.service';
import { MessageResponse } from '@/app/models/message-response';
import { ClientCompany } from '@/app/models/client.company';

@Injectable({
  providedIn: 'root'
})
export class ClientCompanyService {

  private storage = inject(StorageService);
  private http = inject(HttpClient);

  companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  save(client: ClientCompany): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/clientcompany/save", client, { headers: this.myHeaders(), observe: 'response' });
  }
  update(client: ClientCompany): Observable<HttpResponse<MessageResponse>> {
    return this.http.post<MessageResponse>(environment.apiuUrl + "/clientcompany/update", client, { headers: this.myHeaders(), observe: 'response' });
  }
  listAll(): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/all", { headers: this.myHeaders(), observe: 'response' });
  }
  filterId(id: Number): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/id/" + id, { headers: this.myHeaders(), observe: 'response' });
  }
  filterJFantasia(name: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/j/fantasia/" + name, { headers: this.myHeaders(), observe: 'response' });
  }
  filterFFantasia(name: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/f/fantasia/" + name, { headers: this.myHeaders(), observe: 'response' });
  }
  filterJName(name: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/j/name/" + name, { headers: this.myHeaders(), observe: 'response' });
  }
  filterFName(name: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/f/name/" + name, { headers: this.myHeaders(), observe: 'response' });
  }
  filterCNPJ(cnpj: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/cnpj/" + cnpj, { headers: this.myHeaders(), observe: 'response' });
  }
  filterCPF(cpf: string): Observable<HttpResponse<MessageResponse>> {
    return this.http.get<MessageResponse>(environment.apiuUrl + "/clientcompany/" + this.companyResale + "/filter/cpf/" + cpf, { headers: this.myHeaders(), observe: 'response' });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
}
