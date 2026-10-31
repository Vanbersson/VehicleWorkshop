import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import VisitScheduleComponent from './visit.schedule.component';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { Salesperson } from '@/app/models/crm/salesperson';
import { ClientCompany } from '@/app/models/client.company';
import { VisitAgenda } from '@/app/models/crm/visit/visit.agenda';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { Location } from '@angular/common';
import { Visit } from '@/app/models/crm/visit/visit';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';

describe('VisitScheduleComponent', () => {
    let component: VisitScheduleComponent;
    let visits: jasmine.SpyObj<VisitService>;
    let people: jasmine.SpyObj<SalespersonService>;
    const client = Object.assign(new ClientCompany(), { id: 3, name: 'Cliente' });
    const salesperson = Object.assign(new Salesperson(), { id: 7, name: 'Vendedor', status: StatusEnabDisabEnum.ENABLED });

    beforeEach(() => {
        visits = jasmine.createSpyObj<VisitService>('VisitService', ['agendaNew', 'agendaUpdate', 'visitFilterId', 'listAllAgenda', 'listOverdueAgenda']);
        people = jasmine.createSpyObj<SalespersonService>('SalespersonService', ['filterType']);
        visits.agendaNew.and.returnValue(of(new HttpResponse({ status: 201, body: Object.assign(new MessageResponse(), { status: StatusSuccessError.succes }) })));
        visits.agendaUpdate.and.returnValue(of(new HttpResponse({ status: 200, body: Object.assign(new MessageResponse(), { status: StatusSuccessError.succes }) })));
        visits.listAllAgenda.and.returnValue(of([]));
        visits.listOverdueAgenda.and.returnValue(of([]));
        people.filterType.and.returnValue(of([salesperson]));
        TestBed.configureTestingModule({
            providers: [
                VisitScheduleComponent,
                { provide: Location, useValue: { getState: () => ({}) } },
                { provide: VisitService, useValue: visits },
                { provide: SalespersonService, useValue: people },
                { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }
            ]
        });
        component = TestBed.inject(VisitScheduleComponent);
    });

    function fillForm(): void {
        component.form.patchValue({ date: new Date(2026, 10, 4), time: new Date(2026, 0, 1, 14, 35), client, salesperson, information: '  Levar catálogo  ' });
    }

    function appointment(id: number, date: Date): VisitAgenda {
        return { id, dateVisit: date.toISOString(), salespersonId: salesperson.id!, salespersonName: salesperson.name, clientId: client.id!, clientName: client.name, informationAgenda: '' };
    }

    async function editExisting(): Promise<void> {
        await component.loadSalespersons();
        visits.visitFilterId.and.returnValue(
            of(
                new HttpResponse({
                    body: Object.assign(new Visit(), {
                        id: 42,
                        status: StatusVisitEnum.AGENDA,
                        agendaDate: new Date(2026, 10, 4, 14, 35).toISOString(),
                        agendaInfo: 'Levar catálogo',
                        clientId: 3,
                        clientName: client.name,
                        clientCPF: '12345678901',
                        salespersonId: 7,
                        salespersonName: salesperson.name
                    })
                })
            )
        );
        await component.editAppointment(42);
    }

    it('loads the saved date, time, people and notes for editing', async () => {
        await editExisting();
        expect(component.editingId()).toBe(42);
        expect(component.form.controls.time.value?.getHours()).toBe(14);
        expect(component.form.controls.time.value?.getMinutes()).toBe(35);
        expect(component.form.controls.client.value?.cpf).toBe('12345678901');
        expect(component.form.controls.salesperson.value).toBe(salesperson);
        expect(component.form.controls.information.value).toBe('Levar catálogo');
        expect(component.selectedDay().getDate()).toBe(4);
    });

    it('updates the same appointment instead of creating another visit', async () => {
        await editExisting();
        component.form.patchValue({ date: new Date(2026, 10, 5), time: new Date(2026, 0, 1, 16, 10), information: '  Novo horário  ' });
        await component.save();
        const payload = visits.agendaUpdate.calls.mostRecent().args[0];
        const date = new Date(payload.dateVisit);
        expect(payload.id).toBe(42);
        expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([2026, 10, 5, 16, 10]);
        expect(payload.informationAgenda).toBe('Novo horário');
        expect(payload.clientCPF).toBe('12345678901');
        expect(visits.agendaNew).not.toHaveBeenCalled();
        expect(component.editingId()).toBeNull();
    });

    it('preserves the appointment being edited when saving fails', async () => {
        await editExisting();
        visits.agendaUpdate.and.returnValue(throwError(() => new Error('Offline')));
        await component.save();
        expect(component.editingId()).toBe(42);
        expect(component.form.controls.information.value).toBe('Levar catálogo');
        expect(component.saveError()).toBe('Offline');
        expect(component.saving()).toBeFalse();
    });

    it('rejects a visit that has already started and allows cancelling an edit without saving', async () => {
        await editExisting();
        component.cancelEditing();
        expect(component.editingId()).toBeNull();
        expect(component.form.controls.client.value).toBeNull();
        expect(visits.agendaUpdate).not.toHaveBeenCalled();
        visits.visitFilterId.and.returnValue(of(new HttpResponse({ body: Object.assign(new Visit(), { id: 42, status: StatusVisitEnum.OPEN }) })));
        await component.editAppointment(42);
        expect(component.editingId()).toBeNull();
        expect(component.saveError()).toContain('não está mais agendada');
    });

    it('requires the date, time, client and salesperson before sending', async () => {
        await component.save();
        expect(visits.agendaNew).not.toHaveBeenCalled();
        expect(component.submitted()).toBeTrue();
    });

    it('combines the selected local date and time and sends both people', async () => {
        fillForm();
        await component.save();
        const payload = visits.agendaNew.calls.mostRecent().args[0];
        const date = new Date(payload.dateVisit);
        expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([2026, 10, 4, 14, 35]);
        expect(payload.clientId).toBe(3);
        expect(payload.salespersonId).toBe(7);
        expect(payload.informationAgenda).toBe('Levar catálogo');
        expect(component.form.controls.client.value).toBeNull();
        expect(visits.listAllAgenda).toHaveBeenCalled();
    });

    it('keeps the entered data when the server returns an empty response', async () => {
        fillForm();
        visits.agendaNew.and.returnValue(of(new HttpResponse<MessageResponse>({ status: 201 })));
        await component.save();
        expect(component.form.controls.client.value).toBe(client);
        expect(component.saveError()).toContain('não confirmou');
        expect(component.saving()).toBeFalse();
    });

    it('prevents concurrent submissions and allows retrying after a failure', async () => {
        fillForm();
        const response = new Subject<HttpResponse<MessageResponse>>();
        visits.agendaNew.and.returnValue(response);
        const first = component.save();
        await component.save();
        expect(visits.agendaNew).toHaveBeenCalledTimes(1);
        response.error(new Error('Offline'));
        await first;
        expect(component.saving()).toBeFalse();
        expect(component.form.controls.client.value).toBe(client);
    });

    it('filters appointments by local day and sorts them by time', () => {
        component.selectDay(new Date(2026, 10, 4));
        component.appointments.set([appointment(1, new Date(2026, 10, 4, 16)), appointment(2, new Date(2026, 10, 5, 8)), appointment(3, new Date(2026, 10, 4, 9))]);
        expect(component.dayAppointments().map((v) => v.id)).toEqual([3, 1]);
        expect(component.form.controls.date.value?.getDate()).toBe(4);
    });

    it('loads only enabled salespeople and reports agenda loading errors', async () => {
        people.filterType.and.returnValue(of([salesperson, new Salesperson()]));
        await component.loadSalespersons();
        expect(component.salespersons()).toEqual([salesperson]);
        visits.listAllAgenda.and.returnValue(throwError(() => new Error('Offline')));
        await component.loadAppointments();
        expect(component.loadError()).toBe('Offline');
        expect(component.loading()).toBeFalse();
    });

    it('synchronizes the calendar when the form date changes directly', () => {
        const date = new Date(2026, 11, 15);
        component.form.controls.date.setValue(date);
        expect(component.selectedDay()).toBe(date);
        component.form.controls.date.setValue(null);
        expect(component.selectedDay()).toBe(date);
    });

    it('preserves the form when the server does not explicitly confirm success', async () => {
        fillForm();
        const initialLoads = visits.listAllAgenda.calls.count();
        visits.agendaNew.and.returnValue(of(new HttpResponse({ status: 201, body: new MessageResponse() })));
        await component.save();
        expect(component.form.controls.client.value).toBe(client);
        expect(component.saveError()).toContain('não confirmou');
        expect(visits.listAllAgenda.calls.count()).toBe(initialLoads);
    });

    it('reports missing appointment dates instead of silently showing an empty day', async () => {
        visits.listAllAgenda.and.returnValue(of([{ ...appointment(1, new Date()), dateVisit: '' }]));
        await component.loadAppointments();
        expect(component.loadError()).toContain('datas inválidas');
    });

    it('shows overdue appointments across days independently of the selected calendar date', async () => {
        const now = Date.now();
        visits.listOverdueAgenda.and.returnValue(of([appointment(1, new Date(now - 60_000)), appointment(2, new Date(now + 60_000)), appointment(3, new Date(now - 2 * 86_400_000))]));
        await component.loadOverdueAppointments();
        component.selectDay(new Date(2030, 0, 1));
        expect(component.overdueVisits().map((visit) => visit.id)).toEqual([3, 1]);
        expect(component.delayLabel(new Date(now - 2 * 86_400_000).toISOString())).toBe('2 d 0 h');
    });

    it('reports overdue loading failures separately from the selected day', async () => {
        visits.listOverdueAgenda.and.returnValue(throwError(() => new Error('Offline')));
        await component.loadOverdueAppointments();
        expect(component.overdueError()).toBe('Offline');
        expect(component.loadError()).toBe('');
        expect(component.loadingOverdue()).toBeFalse();
    });

    it('keeps the latest selected day when responses arrive out of order', async () => {
        const first = new Subject<VisitAgenda[]>();
        const second = new Subject<VisitAgenda[]>();
        visits.listAllAgenda.and.returnValues(first, second);
        const olderRequest = component.loadAppointments();
        const newerRequest = component.loadAppointments();
        second.next([appointment(2, new Date())]);
        second.complete();
        await newerRequest;
        first.next([appointment(1, new Date())]);
        first.complete();
        await olderRequest;
        expect(component.appointments().map((visit) => visit.id)).toEqual([2]);
    });
});
