import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPartApollo } from '@/app/interfaces/i.part.apollo';



@Injectable({
    providedIn: 'root'
})
export class PartApolloService {
    http = inject(HttpClient);

    filterCode(code: string): Observable<HttpResponse<IPartApollo[]>> {
        return this.http.get<IPartApollo[]>(`${environment.apiApollo}/part/filter/code/${code}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }
    filterDesc(desc: string): Observable<HttpResponse<IPartApollo[]>> {
        return this.http.get<IPartApollo[]>(`${environment.apiApollo}/part/filter/desc/${desc}`, { headers: this.myHeaders(), responseType: 'json', observe: 'response' });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer japiasddm70nAIDF5dk345673@fh!k0fdKNK*%b52LAzZ70#54gv$54g!456!!@SDp8**I',
        });
        return httpOptions;
    }

}
