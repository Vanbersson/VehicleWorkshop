import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CEPService {

    constructor(private http: HttpClient) { }

    search(cep: string): Observable<HttpResponse<any>> {
        return this.http.get("https://viacep.com.br/ws/" + cep + "/json/", { observe: 'response' });
    }

}