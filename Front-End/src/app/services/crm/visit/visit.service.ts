import { CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { Observable } from 'rxjs';
import { Visit } from '@/app/models/crm/visit/visit';
import { VisitAgenda, VisitAgendaNew, VisitAgendaUpdate } from '@/app/models/crm/visit/visit.agenda';
import { MessageResponse } from '@/app/models/message-response';
import { environment } from '@/environments/environment';
import { Salesperson } from '@/app/models/crm/salesperson';

@Injectable({
    providedIn: 'root'
})
export class VisitService {
    storage = inject(StorageService);
    http = inject(HttpClient);

    agendaSalespersons(): Observable<Salesperson[]> {
        return this.http.get<Salesperson[]>(`${environment.apiuUrl}/salesperson/visit/agenda/salespersons`, { headers: this.myHeaders() });
    }

    registerSalespersons(): Observable<Salesperson[]> {
        return this.http.get<Salesperson[]>(`${environment.apiuUrl}/salesperson/visit/register/salespersons`, { headers: this.myHeaders() });
    }

    registerNew(p: Visit): Observable<HttpResponse<Visit>> {
        return this.http.post<Visit>(`${environment.apiuUrl}/salesperson/visit/register/new`, p, { headers: this.myHeaders(), observe: 'response' });
    }
    registerUpdate(p: Visit): Observable<HttpResponse<Visit>> {
        return this.http.post<Visit>(`${environment.apiuUrl}/salesperson/visit/register/update`, p, { headers: this.myHeaders(), observe: 'response' });
    }

    generateAttendance(id: number): Observable<CustomerAttendance> {
        return this.http.post<CustomerAttendance>(`${environment.apiuUrl}/salesperson/visit/register/${id}/attendance`, {}, { headers: this.myHeaders() });
    }

    visitFilterId(id: number): Observable<HttpResponse<Visit>> {
        return this.http.get<Visit>(`${environment.apiuUrl}/salesperson/visit/id/${id}`, { headers: this.myHeaders(), observe: 'response' });
    }

    listAll(): Observable<Visit[]> {
        return this.http.get<Visit[]>(`${environment.apiuUrl}/salesperson/visit/all`, { headers: this.myHeaders() });
    }

    //Agenda
    agendaNew(p: VisitAgendaNew): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/salesperson/visit/agenda/new`, p, { headers: this.myHeaders(), observe: 'response' });
    }

    agendaUpdate(p: VisitAgendaUpdate): Observable<HttpResponse<MessageResponse>> {
        return this.http.post<MessageResponse>(`${environment.apiuUrl}/salesperson/visit/agenda/update`, p, { headers: this.myHeaders(), observe: 'response' });
    }

    listAllAgenda(day: string): Observable<VisitAgenda[]> {
        return this.http.post<VisitAgenda[]>(`${environment.apiuUrl}/salesperson/visit/agenda/day`, { day: day }, { headers: this.myHeaders() });
    }

    listOverdueAgenda(): Observable<VisitAgenda[]> {
        return this.http.get<VisitAgenda[]>(`${environment.apiuUrl}/salesperson/visit/agenda/overdue`, { headers: this.myHeaders() });
    }

    private myHeaders(): HttpHeaders {
        const httpOptions = new HttpHeaders({
            Authorization: 'Bearer ' + this.storage.token
        });
        return httpOptions;
    }
}
