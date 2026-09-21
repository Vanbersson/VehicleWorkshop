import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientCompany } from '@/app/models/client.company';

@Injectable({
    providedIn: 'root'
})
export class ClientCompanyApolloService {
    private http = inject(HttpClient);

    filterId(id: Number): Observable<HttpResponse<ClientCompany>> {
        return this.http.get<ClientCompany>(`${environment.apiApollo}/fatclient/filter/code/${id}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterJFantasia(name: string): Observable<HttpResponse<ClientCompany[]>> {
        return this.http.get<ClientCompany[]>(`${environment.apiApollo}/client/filter/j/fantasia/${name}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterFFantasia(name: string): Observable<HttpResponse<ClientCompany[]>> {
        return this.http.get<ClientCompany[]>(`${environment.apiApollo}/client/filter/f/fantasia/${name}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterJName(name: string): Observable<HttpResponse<ClientCompany[]>> {
        return this.http.get<ClientCompany[]>(`${environment.apiApollo}/client/filter/j/name/${name}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterFName(name: string): Observable<HttpResponse<ClientCompany[]>> {
        return this.http.get<ClientCompany[]>(`${environment.apiApollo}/client/filter/f/name/${name}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterCNPJ(cnpj: string): Observable<HttpResponse<ClientCompany>> {
        return this.http.get<ClientCompany>(`${environment.apiApollo}/client/filter/cnpj/${cnpj}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterCPF(cpf: string): Observable<HttpResponse<ClientCompany>> {
        return this.http.get<ClientCompany>(`${environment.apiApollo}/client/filter/cpf/${cpf}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer japiasddm70nAIDF5dk345673@fh!k0fdKNK*%b52LAzZ70#54gv$54g!456!!@SDp8**I',
        });
        return httpOptions;
    }

}
