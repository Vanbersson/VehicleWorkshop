import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import NewCustomerComponent from './new.customer.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';

describe('Customer attendance cards', () => {
    let component: NewCustomerComponent;
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    let printer: jasmine.SpyObj<AttendanceProposalPrintService>;
    const first: CustomerAttendance = {
        id: 1,
        visitId: 42,
        clientId: null,
        clientName: 'João',
        salespersonId: 7,
        salespersonName: 'Maria',
        dateCreated: '2026-10-30T12:00:00Z',
        dateVisit: '2026-10-30T11:00:00Z',
        status: AttendanceStatus.VISIT_COMPLETED,
        notes: '',
        version: 0
    };
    const second: CustomerAttendance = { ...first, id: 2, visitId: 43, clientName: 'Pedro', status: AttendanceStatus.DOCUMENTS_PENDING };

    beforeEach(() => {
        printer = jasmine.createSpyObj<AttendanceProposalPrintService>('ProposalPrinter', ['print']);
        printer.print.and.resolveTo();
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['list', 'detail', 'search', 'update', 'cancel']);
        service.list.and.returnValue(of([first, second]));
        service.search.and.returnValue(of([first, second]));
        service.detail.and.callFake((id) => {
            const item = id === first.id ? first : second;
            return of({ attendance: item, visit: Object.assign(new Visit(), { id: item.visitId, clientName: item.clientName, salespersonName: item.salespersonName, reasonVisit: '1', products: '2' }) });
        });
        TestBed.configureTestingModule({
            providers: [
                NewCustomerComponent,
                { provide: AttendanceProposalPrintService, useValue: printer },
                { provide: CustomerAttendanceService, useValue: service },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ visitId: '42' }) } } },
                { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }
            ]
        });
        component = TestBed.inject(NewCustomerComponent);
    });

    it('saves the proposal before printing and keeps the editor open', async () => {
        await component.open(first);
        component.selectEditStep(3);
        component.form.controls.proposalNotes.setValue('Condições comerciais');
        component.form.markAsDirty();
        const saved = { ...first, proposalNotes: 'Condições comerciais', status: AttendanceStatus.COMMERCIAL_PROPOSAL, version: 1 };
        service.update.and.returnValue(of(saved));
        await component.printProposal();
        expect(service.update).toHaveBeenCalled();
        expect(printer.print).toHaveBeenCalledWith(saved, component.originVisit()!, jasmine.any(Function));
        expect(component.dialogVisible).toBeTrue();
    });

    it('shows loading failures and allows retrying proposal printing', async () => {
        await component.open(first);
        component.form.controls.proposalNotes.setValue('Proposta');
        printer.print.and.rejectWith(new Error('Falha ao carregar a revenda'));
        await component.printProposal();
        expect(component.saveError()).toContain('Falha ao carregar a revenda');
        expect(component.saving()).toBeFalse();
        expect(component.dialogVisible).toBeTrue();
    });

    it('does not print an empty proposal or when saving fails', async () => {
        await component.open(first);
        await component.printProposal();
        expect(printer.print).not.toHaveBeenCalled();
        component.form.controls.proposalNotes.setValue('Proposta');
        component.form.markAsDirty();
        service.update.and.returnValue(throwError(() => new Error('Falha ao salvar')));
        await component.printProposal();
        expect(printer.print).not.toHaveBeenCalled();
        expect(component.saveError()).toBe('Falha ao salvar');
    });

    it('automatically saves the selected client and keeps the editor open and original visit unchanged', async () => {
        await component.load();
        await component.open(first);
        service.update.and.returnValue(of({ ...first, clientId: 88, clientName: 'Novo cliente', version: 1 }));
        await component.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Novo cliente', status: StatusEnabDisabEnum.ENABLED }));
        expect(service.update).toHaveBeenCalledWith(jasmine.objectContaining({ clientId: 88 }));
        expect(component.items()[0].clientName).toBe('Novo cliente');
        expect(component.originVisit()?.clientName).toBe(first.clientName);
        expect(component.dialogVisible).toBeTrue();
        expect(component.form.pristine).toBeTrue();
    });

    it('keeps the client change pending and shows an error when automatic saving fails', async () => {
        await component.load();
        await component.open(first);
        service.update.and.returnValue(throwError(() => new Error('Falha ao salvar cliente')));
        await component.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Novo cliente', status: StatusEnabDisabEnum.ENABLED }));
        expect(component.saveError()).toBe('Falha ao salvar cliente');
        expect(component.form.dirty).toBeTrue();
        expect(component.items()[0].clientId).toBe(first.clientId);
        expect(component.dialogVisible).toBeTrue();
    });

    it('highlights the completed visit and filters the active results by stage', async () => {
        await component.load();
        expect(component.filteredItems()[0].visitId).toBe(42);
        component.changeStatus(AttendanceStatus.DOCUMENTS_PENDING);
        expect(component.filteredItems().map((item) => item.id)).toEqual([2]);
        expect(component.counts().map((stage) => stage.count)).toEqual([1, 1, 0, 0, 0, 0]);
    });

    it('replaces the current stage and sends the record version on update', async () => {
        await component.load();
        await component.open(first);
        component.selectEditStep(5);
        component.form.patchValue({ notes: 'Aguardando confirmação' });
        service.update.and.returnValue(of({ ...first, status: AttendanceStatus.APPROVAL_PENDING, notes: 'Aguardando confirmação', version: 1 }));
        await component.save();
        expect(service.update).toHaveBeenCalledWith({ id: 1, status: AttendanceStatus.APPROVAL_PENDING, notes: 'Aguardando confirmação', version: 0, documentsNotes: '', proposalNotes: '' });
        expect(component.items()[0].status).toBe(AttendanceStatus.APPROVAL_PENDING);
        expect(component.dialogVisible).toBeFalse();
    });

    it('saves a stage without closing the dialog or advancing to another step', async () => {
        await component.load();
        await component.open(first);
        component.selectEditStep(2);
        component.form.controls.documentsNotes.setValue('Documentos conferidos');
        component.form.markAsDirty();
        const saved = { ...first, status: AttendanceStatus.DOCUMENTS_PENDING, documentsNotes: 'Documentos conferidos', version: 1 };
        service.update.and.returnValue(of(saved));
        await component.save(component.activeEditStep() >= 5);
        expect(service.update).toHaveBeenCalledWith(jasmine.objectContaining({ id: first.id, status: AttendanceStatus.DOCUMENTS_PENDING, documentsNotes: 'Documentos conferidos' }));
        expect(component.dialogVisible).toBeTrue();
        expect(component.activeEditStep()).toBe(2);
        expect(component.editing()?.version).toBe(1);
        expect(component.form.pristine).toBeTrue();
    });

    it('keeps the dialog and entered data on an update failure', async () => {
        await component.open(first);
        component.form.controls.notes.setValue('Dados preservados');
        service.update.and.returnValue(throwError(() => new Error('Offline')));
        await component.save();
        expect(component.dialogVisible).toBeTrue();
        expect(component.form.controls.notes.value).toBe('Dados preservados');
        expect(component.saveError()).toBe('Offline');
        expect(component.saving()).toBeFalse();
    });

    it('does not send notes beyond the server limit', async () => {
        await component.open(first);
        component.form.controls.notes.setValue('x'.repeat(2001));
        await component.save();
        expect(service.update).not.toHaveBeenCalled();
    });

    it('updates the card with the saved quote total, including a fully discounted quote', async () => {
        await component.load();
        component.budgetSaved({ ...first, quoteTotal: 180, status: AttendanceStatus.QUOTATION });
        expect(component.items()[0].quoteTotal).toBe(180);
        component.budgetSaved({ ...first, quoteTotal: 0 });
        expect(component.items()[0].quoteTotal).toBe(0);
    });

    it('hides cancelled attendances in the active query', () => {
        const cancelled = { ...second, status: AttendanceStatus.CANCELLED };
        component.items.set([first, cancelled]);
        expect(component.filteredItems().map((item) => item.id)).toEqual([1]);
        component.changeStatus(AttendanceStatus.CANCELLED);
        expect(component.filteredItems()).toEqual([]);
    });

    it('uses the dedicated cancelled query only after an identifying filter is supplied', async () => {
        component.changeQueryMode('CANCELLED');
        await component.load();
        expect(service.search).not.toHaveBeenCalled();
        expect(component.queryError()).toContain('Informe');
        component.queryForm.patchValue({ id: 123, clientName: ' José ', salespersonName: ' Carla ' });
        service.search.and.returnValue(of([{ ...second, id: 123, status: AttendanceStatus.CANCELLED }]));
        await component.load();
        expect(service.search).toHaveBeenCalledWith('CANCELLED', { id: 123, clientName: 'José', salespersonName: 'Carla' });
        expect(component.filteredItems().map((item) => item.id)).toEqual([123]);
        component.clearQuery();
        expect(component.filteredItems()).toEqual([]);
    });

    it('uses the non-cancelled query for active filters', async () => {
        component.queryForm.patchValue({ clientName: 'João' });
        await component.load();
        expect(service.search).toHaveBeenCalledWith('ACTIVE', { id: null, clientName: 'João', salespersonName: '' });
    });

    it('loads the originating visit and advances while preserving workflow notes', async () => {
        await component.open(first);
        expect(component.originVisit()?.id).toBe(42);
        expect(component.describeVisitValues('1', component.visitReasons)).toContain('Librelato');
        component.selectEditStep(2);
        component.form.patchValue({ documentsNotes: 'Documentos conferidos', proposalNotes: 'Prazo combinado' });
        service.update.and.returnValue(of({ ...first, status: AttendanceStatus.COMMERCIAL_PROPOSAL, documentsNotes: 'Documentos conferidos', proposalNotes: 'Prazo combinado', version: 1 }));
        await component.save(false, 3);
        expect(component.activeEditStep()).toBe(3);
        expect(component.dialogVisible).toBeTrue();
        expect(service.update.calls.mostRecent().args[0].documentsNotes).toBe('Documentos conferidos');
        expect(component.editing()?.version).toBe(1);
    });

    it('does not save an incomplete dialog when the originating visit cannot be loaded', async () => {
        service.detail.and.returnValue(throwError(() => new Error('Offline')));
        await component.open(first);
        await component.save();
        expect(component.detailError()).toBe('Offline');
        expect(service.update).not.toHaveBeenCalled();
    });

    it('only drafts the new approval stage for legacy payment records until explicitly saved', async () => {
        const legacy = { ...first, status: AttendanceStatus.PAYMENT_PENDING };
        service.detail.and.returnValue(of({ attendance: legacy, visit: Object.assign(new Visit(), { id: 42 }) }));
        await component.open(legacy);
        expect(component.activeEditStep()).toBe(5);
        expect(component.form.controls.status.value).toBe(AttendanceStatus.APPROVAL_PENDING);
        expect(component.editing()?.status).toBe(AttendanceStatus.PAYMENT_PENDING);
        expect(service.update).not.toHaveBeenCalled();
    });

    it('ignores an older query response after switching to cancelled attendance', async () => {
        const result = new Subject<CustomerAttendance[]>();
        service.list.and.returnValue(result);
        const pending = component.load();
        component.changeQueryMode('CANCELLED');
        result.next([first]);
        result.complete();
        await pending;
        expect(component.items()).toEqual([]);
    });

    it('requires a nonblank cancellation reason and preserves it if the request fails', async () => {
        component.openCancellation(first);
        component.cancelForm.controls.reason.setValue('   ');
        await component.cancel();
        expect(service.cancel).not.toHaveBeenCalled();
        component.cancelForm.controls.reason.setValue('Cliente desistiu');
        service.cancel.and.returnValue(throwError(() => new Error('Offline')));
        await component.cancel();
        expect(component.cancellationVisible).toBeTrue();
        expect(component.cancelForm.controls.reason.value).toBe('Cliente desistiu');
        expect(component.cancelError()).toBe('Offline');
    });

    it('updates the card with the cancellation reason and keeps the quotation amount', async () => {
        await component.load();
        component.openCancellation(first);
        component.cancelForm.controls.reason.setValue('  Cliente desistiu  ');
        service.cancel.and.returnValue(of({ ...first, status: AttendanceStatus.CANCELLED, cancellationReason: 'Cliente desistiu', cancelledAt: '2026-10-30T12:00:00Z', cancelledByName: 'Maria', quoteTotal: 180, version: 1 }));
        await component.cancel();
        expect(service.cancel).toHaveBeenCalledWith({ id: 1, version: 0, reason: 'Cliente desistiu' });
        expect(component.items()[0].status).toBe(AttendanceStatus.CANCELLED);
        expect(component.items()[0].quoteTotal).toBe(180);
        expect(component.cancellationVisible).toBeFalse();
        const cancelled = component.items()[0];
        service.detail.and.returnValue(of({ attendance: cancelled, visit: Object.assign(new Visit(), { id: cancelled.visitId }) }));
        await component.open(cancelled);
        expect(component.dialogVisible).toBeTrue();
        expect(component.readOnly()).toBeTrue();
    });

    it('shows all saved attendance notes and its visit after cancellation without allowing updates', async () => {
        const cancelled = { ...first, status: AttendanceStatus.CANCELLED, notes: 'Observações salvas', documentsNotes: 'Documentos recebidos', proposalNotes: 'Proposta negociada', cancellationReason: 'Cliente desistiu', quoteTotal: 180 };
        service.detail.and.returnValue(of({ attendance: cancelled, visit: Object.assign(new Visit(), { id: 42, clientName: 'Cliente original', reasonVisitInfo: 'Motivo informado' }) }));
        await component.open(cancelled);
        expect(component.dialogVisible).toBeTrue();
        expect(component.form.disabled).toBeTrue();
        expect(component.form.getRawValue()).toEqual(jasmine.objectContaining({ notes: 'Observações salvas', documentsNotes: 'Documentos recebidos', proposalNotes: 'Proposta negociada' }));
        expect(component.originVisit()?.reasonVisitInfo).toBe('Motivo informado');
        for (let step = 1; step <= component.workflow.length; step++) {
            component.selectEditStep(step);
            expect(component.activeEditStep()).toBe(step);
            expect(component.form.controls.status.value).toBe(AttendanceStatus.CANCELLED);
        }
        await component.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Outro cliente', status: StatusEnabDisabEnum.ENABLED }));
        expect(component.selectedClientId()).toBe(first.clientId);
        expect(await component.save()).toBeFalse();
        expect(service.update).not.toHaveBeenCalled();
        await component.openEditingBudget();
        expect(component.budgetAttendance()).toEqual(cancelled);
        expect(component.budgetVisible).toBeTrue();
    });

    it('restores editing when an active attendance is opened after a cancelled one', async () => {
        const cancelled = { ...first, status: AttendanceStatus.CANCELLED };
        service.detail.and.returnValue(of({ attendance: cancelled, visit: Object.assign(new Visit(), { id: 42 }) }));
        await component.open(cancelled);
        expect(component.form.disabled).toBeTrue();
        service.detail.and.returnValue(of({ attendance: first, visit: Object.assign(new Visit(), { id: 42 }) }));
        await component.open(first);
        expect(component.readOnly()).toBeFalse();
        expect(component.form.enabled).toBeTrue();
    });

    it('keeps consultation open if the server reports cancellation while opening an active card', async () => {
        const cancelled = { ...first, status: AttendanceStatus.CANCELLED, cancellationReason: 'Cancelado por outro usuário' };
        service.detail.and.returnValue(of({ attendance: cancelled, visit: Object.assign(new Visit(), { id: 42 }) }));
        await component.open(first);
        expect(component.dialogVisible).toBeTrue();
        expect(component.readOnly()).toBeTrue();
        expect(component.editing()?.cancellationReason).toBe(cancelled.cancellationReason);
        expect(component.form.disabled).toBeTrue();
    });
});
