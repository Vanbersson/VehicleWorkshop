import { TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import VisitMaintenanceComponent from './visit.maintenance.component';
import { VisitService } from '@/app/services/crm/visit/visit.service';

import { UserService } from '@/app/services/user/user.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { Visit } from '@/app/models/crm/visit/visit';
import { Salesperson } from '@/app/models/crm/salesperson';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';

describe('VisitMaintenanceComponent registration flow', () => {
    let component: VisitMaintenanceComponent;
    let service: jasmine.SpyObj<VisitService>;
    let state: { visit?: Visit };
    const salesperson = Object.assign(new Salesperson(), { id: 7, name: 'Vendedor' });

    beforeEach(() => {
        state = {};
        service = jasmine.createSpyObj<VisitService>('VisitService', ['generateAttendance', 'registerNew', 'registerUpdate', 'registerSalespersons']);
        service.registerSalespersons.and.returnValue(of([salesperson]));
        service.registerNew.and.callFake((v) => of(new HttpResponse({ status: 201, body: Object.assign(new Visit(), v, { id: 42 }) })));
        service.registerUpdate.and.callFake((v) => of(new HttpResponse({ status: 200, body: v })));
        TestBed.configureTestingModule({
            providers: [
                VisitMaintenanceComponent,
                { provide: VisitService, useValue: service },

                { provide: UserService, useValue: { getUser: () => of(new HttpResponse({ status: 200, body: { id: 1 } })) } },
                { provide: LoadingService, useValue: { show: () => {}, hide: () => {} } },
                { provide: Location, useValue: { getState: () => state } },
                { provide: Router, useValue: { navigate: jasmine.createSpy('navigate').and.resolveTo(true) } },
                { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }
            ]
        });
        component = TestBed.inject(VisitMaintenanceComponent);
        component.initializing.set(false);
        component.formVisit.patchValue({ clientNotExists: true, clientName: 'Cliente', salesperson });
    });

    function fillOtherSelections(): void {
        component.formVisit.patchValue({ reasonInfoChecked: true, reasonInfo: 'Outro motivo', productsInfoChecked: true, productsInfo: 'Outro produto' });
    }

    it('accepts only Other selections through completion', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        component.openDateVisit();
        expect(component.visibleDateVisit).toBeTrue();
        await component.saveComplete();
        expect(service.registerUpdate.calls.mostRecent().args[0].status).toBe(StatusVisitEnum.CLOSE);
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        expect(component.visibleDateVisit).toBeFalse();
        await component.onCompletionDialogHide();
        expect(component.attendancePromptVisible).toBeTrue();
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        expect(service.generateAttendance).not.toHaveBeenCalled();
        await component.finishWithoutAttendance();
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        await component.onAttendancePromptHide();
        expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/crm/visit']);
    });

    it('does not navigate when the completion dialog is cancelled', async () => {
        component.openDateVisit();
        component.visibleDateVisit = false;
        await component.onCompletionDialogHide();
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    });

    it('stays on the registration screen when completing the visit fails', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        component.openDateVisit();
        service.registerUpdate.and.returnValue(throwError(() => new Error('Offline')));
        await component.saveComplete();
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        expect(component.visibleDateVisit).toBeTrue();
    });

    it('rejects whitespace-only descriptions and redirects to the required step', async () => {
        fillOtherSelections();
        component.formVisit.controls.reasonInfo.setValue('   ');
        await component.goToStep(5);
        expect(component.activeStepper()).toBe(3);
        expect(service.registerNew).not.toHaveBeenCalled();
    });

    it('validates contact before advancing', async () => {
        component.formVisit.patchValue({ contactType: component.EMAIL, contact: 'invalid' });
        await component.goToStep(3);
        expect(component.activeStepper()).toBe(2);
        expect(service.registerNew).not.toHaveBeenCalled();
    });

    it('creates once and persists changes when revisiting a step', async () => {
        await component.goToStep(2);
        await component.goToStep(1);
        component.formVisit.controls.clientName.setValue('Cliente alterado');
        await component.goToStep(2);
        expect(service.registerNew).toHaveBeenCalledTimes(1);
        expect(service.registerUpdate.calls.mostRecent().args[0].clientName).toBe('cliente alterado');
    });

    it('prevents concurrent registrations and preserves the current step on failure', async () => {
        const response = new Subject<HttpResponse<Visit>>();
        service.registerNew.and.returnValue(response);
        const first = component.goToStep(2);
        await component.goToStep(2);
        expect(service.registerNew).toHaveBeenCalledTimes(1);
        response.error(new Error('Offline'));
        await first;
        expect(component.saving()).toBeFalse();
        expect(component.activeStepper()).toBe(1);
        service.registerNew.and.returnValue(throwError(() => new Error('Offline')));
        await component.goToStep(2);
        expect(component.activeStepper()).toBe(1);
    });

    it('restores all editing fields and preserves the selected date when reopening confirmation', async () => {
        state.visit = Object.assign(new Visit(), {
            id: 42,
            clientId: 9,
            clientName: 'Cliente salvo',
            salespersonId: 7,
            contactType: component.EMAIL,
            contact: 'teste@example.com',
            reasonVisit: '1',
            products: '2',
            reasonVisitInfo: 'Detalhes',
            dateVisit: '2026-10-20T10:30:00-03:00'
        });
        component.ngOnInit();
        // Wait for salesperson loading and form restoration.
        await Promise.resolve();
        await Promise.resolve();
        expect(service.registerSalespersons).toHaveBeenCalled();
        expect(component.selectClient()?.id).toBe(9);
        expect(component.formVisit.controls.contact.value).toBe('teste@example.com');
        expect(component.formVisit.controls.reasonVisit.value?.map((v) => v.id)).toEqual([1]);
        expect(component.formVisit.controls.products.value?.map((v) => v.id)).toEqual([2]);
        const selected = component.formVisit.controls.dateVisit.value;
        component.openDateVisit();
        component.visibleDateVisit = false;
        component.openDateVisit();
        expect(component.formVisit.controls.dateVisit.value).toBe(selected);
    });
    it('creates attendance without a registered client after confirmation and returns to the visit list', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        component.openDateVisit();
        await component.saveComplete();
        await component.onCompletionDialogHide();
        component.attendancePromptVisible = true;
        service.generateAttendance.and.returnValue(of({ id: 16 } as import('@/app/models/crm/customer.attendance').CustomerAttendance));
        await component.generateAttendance();
        expect(service.generateAttendance).toHaveBeenCalledWith(42);
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        expect(component.generatedAttendanceId()).toBe(16);
        await component.onAttendancePromptHide();
        expect(TestBed.inject(Router).navigate).toHaveBeenCalledOnceWith(['/crm/visit']);
        expect(component.attendancePromptVisible).toBeFalse();
    });
    it('shows a useful error instead of silently ignoring a missing saved visit', async () => {
        component.attendancePromptVisible = true;
        await component.generateAttendance();
        expect(component.attendanceError()).toContain('identificar a visita salva');
        expect(component.attendancePromptVisible).toBeTrue();
        expect(service.generateAttendance).not.toHaveBeenCalled();
    });
    it('shows the server validation message and keeps the prompt open for retry', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        await component.saveComplete();
        await component.onCompletionDialogHide();
        service.generateAttendance.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { emessage: 'Conclua a visita antes de gerar o atendimento.' } })));
        await component.generateAttendance();
        expect(component.attendanceError()).toBe('Conclua a visita antes de gerar o atendimento.');
        expect(component.attendancePromptVisible).toBeTrue();
        expect(component.generatingAttendance()).toBeFalse();
    });
    it('retries returning to visits without generating the attendance again', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        await component.saveComplete();
        await component.onCompletionDialogHide();
        service.generateAttendance.and.returnValue(of({ id: 16 } as import('@/app/models/crm/customer.attendance').CustomerAttendance));
        const navigate = TestBed.inject(Router).navigate as jasmine.Spy;
        navigate.and.resolveTo(false);
        await component.generateAttendance();
        await component.onAttendancePromptHide();
        expect(component.attendancePromptVisible).toBeTrue();
        expect(component.attendanceError()).toContain('foi gerado');
        navigate.and.resolveTo(true);
        await component.generateAttendance();
        await component.onAttendancePromptHide();
        expect(service.generateAttendance).toHaveBeenCalledTimes(1);
        expect(navigate).toHaveBeenCalledWith(['/crm/visit']);
        expect(component.attendancePromptVisible).toBeFalse();
    });
    it('prevents duplicate requests while attendance generation is in progress', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        await component.saveComplete();
        const response = new Subject<import('@/app/models/crm/customer.attendance').CustomerAttendance>();
        service.generateAttendance.and.returnValue(response);
        const generating = component.generateAttendance();
        await component.generateAttendance();
        expect(service.generateAttendance).toHaveBeenCalledTimes(1);
        response.next({ id: 16 } as import('@/app/models/crm/customer.attendance').CustomerAttendance);
        response.complete();
        await generating;
        expect(component.generatingAttendance()).toBeFalse();
    });
    it('keeps the completed visit and allows retrying when attendance generation fails', async () => {
        fillOtherSelections();
        await component.goToStep(5);
        component.openDateVisit();
        await component.saveComplete();
        await component.onCompletionDialogHide();
        component.attendancePromptVisible = true;
        service.generateAttendance.and.returnValue(throwError(() => new Error('Offline')));
        await component.generateAttendance();
        expect(component.attendancePromptVisible).toBeTrue();
        expect(component.attendanceError()).toBeTruthy();
        expect(service.registerUpdate.calls.mostRecent().args[0].status).toBe(StatusVisitEnum.CLOSE);
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    });
    it('navigates once only after the attendance prompt has fully closed', async () => {
        await component.onAttendancePromptHide();
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        component.attendancePromptVisible = true;
        await component.finishWithoutAttendance();
        expect(component.attendancePromptVisible).toBeFalse();
        expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
        await component.onAttendancePromptHide();
        await component.onAttendancePromptHide();
        expect(TestBed.inject(Router).navigate).toHaveBeenCalledOnceWith(['/crm/visit']);
    });
    it('releases the residual dialog scroll lock after returning to visits', async () => {
        document.body.classList.add('p-overflow-hidden');
        try {
            await component.finishWithoutAttendance();
            expect(document.body.classList.contains('p-overflow-hidden')).toBeTrue();
            await component.onAttendancePromptHide();
            expect(document.body.classList.contains('p-overflow-hidden')).toBeFalse();
        } finally {
            document.body.classList.remove('p-overflow-hidden');
        }
    });
    it('preserves scroll blocking when another modal is active', async () => {
        const modal = document.createElement('div');
        modal.setAttribute('data-p-scrollblocker-active', 'true');
        document.body.appendChild(modal);
        document.body.classList.add('p-overflow-hidden');
        try {
            await component.finishWithoutAttendance();
            await component.onAttendancePromptHide();
            expect(document.body.classList.contains('p-overflow-hidden')).toBeTrue();
        } finally {
            modal.remove();
            document.body.classList.remove('p-overflow-hidden');
        }
    });
});
