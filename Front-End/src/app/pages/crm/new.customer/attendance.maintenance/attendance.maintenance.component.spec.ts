import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, Subject, BehaviorSubject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import AttendanceMaintenanceComponent from './attendance.maintenance.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';

describe('Attendance maintenance page', () => {
    let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
    let router: jasmine.SpyObj<Router>;
    let component: AttendanceMaintenanceComponent;
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
        params = new BehaviorSubject(convertToParamMap({ id: 'invalid' }));
        router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        router.navigate.and.resolveTo(true);
        printer = jasmine.createSpyObj<AttendanceProposalPrintService>('ProposalPrinter', ['print']);
        printer.print.and.resolveTo();
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['list', 'detail', 'search', 'update', 'cancel', 'create', 'creationSalespersons']);
        service.creationSalespersons.and.returnValue(of([]));
        service.list.and.returnValue(of([first, second]));
        service.search.and.returnValue(of([first, second]));
        service.detail.and.callFake((id) => {
            const item = id === first.id ? first : second;
            return of({ attendance: item, visit: Object.assign(new Visit(), { id: item.visitId, clientName: item.clientName, salespersonName: item.salespersonName, reasonVisit: '1', products: '2' }) });
        });
        TestBed.configureTestingModule({
            providers: [
                AttendanceMaintenanceComponent,
                { provide: SalespersonService, useValue: { listAll: () => of([]) } },
                { provide: AttendanceProposalPrintService, useValue: printer },
                { provide: CustomerAttendanceService, useValue: service },
                { provide: ActivatedRoute, useValue: { paramMap: params } },
                { provide: Router, useValue: router },
                { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }
            ]
        });
        component = TestBed.inject(AttendanceMaintenanceComponent);
        component.ngOnInit();
    });

    async function open(item: CustomerAttendance): Promise<void> {
        params.next(convertToParamMap({ id: String(item.id) }));
        await Promise.resolve();
    }
    it('allows saving and printing a direct attendance without marking a visit completed', async () => {
        const direct = { ...first, visitId: null, dateVisit: null, status: AttendanceStatus.DOCUMENTS_PENDING, proposalNotes: 'Proposal' };
        service.detail.and.returnValue(of({ attendance: direct, visit: null }));
        service.update.and.returnValue(of({ ...direct, version: 1 }));
        await open(direct);
        component.selectEditStep(1);
        expect(component.form.controls.status.value).toBe(AttendanceStatus.DOCUMENTS_PENDING);
        expect(await component.save(false)).toBeTrue();
        await component.printProposal();
        expect(printer.print).toHaveBeenCalledWith(component.editing()!, null, jasmine.any(Function));
    });

    it('saves the proposal before printing and keeps the editor open', async () => {
        await open(first);
        component.selectEditStep(3);
        component.form.controls.proposalNotes.setValue('Condições comerciais');
        component.form.markAsDirty();
        const saved = { ...first, proposalNotes: 'Condições comerciais', status: AttendanceStatus.COMMERCIAL_PROPOSAL, version: 1 };
        service.update.and.returnValue(of(saved));
        await component.printProposal();
        expect(service.update).toHaveBeenCalled();
        expect(printer.print).toHaveBeenCalledWith(saved, component.originVisit()!, jasmine.any(Function));
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('shows loading failures and allows retrying proposal printing', async () => {
        await open(first);
        component.form.controls.proposalNotes.setValue('Proposta');
        printer.print.and.rejectWith(new Error('Falha ao carregar a revenda'));
        await component.printProposal();
        expect(component.saveError()).toContain('Falha ao carregar a revenda');
        expect(component.saving()).toBeFalse();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('does not print an empty proposal or when saving fails', async () => {
        await open(first);
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
        await open(first);
        service.update.and.returnValue(of({ ...first, clientId: 88, clientName: 'Novo cliente', version: 1 }));
        await component.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Novo cliente', status: StatusEnabDisabEnum.ENABLED }));
        expect(service.update).toHaveBeenCalledWith(jasmine.objectContaining({ clientId: 88 }));
        expect(component.editing()!.clientName).toBe('Novo cliente');
        expect(component.originVisit()?.clientName).toBe(first.clientName);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.form.pristine).toBeTrue();
    });

    it('keeps the client change pending and shows an error when automatic saving fails', async () => {
        await open(first);
        service.update.and.returnValue(throwError(() => new Error('Falha ao salvar cliente')));
        await component.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Novo cliente', status: StatusEnabDisabEnum.ENABLED }));
        expect(component.saveError()).toBe('Falha ao salvar cliente');
        expect(component.form.dirty).toBeTrue();
        expect(component.editing()!.clientId).toBe(first.clientId);
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('replaces the current stage and sends the record version on update', async () => {
        await open(first);
        component.selectEditStep(5);
        component.form.patchValue({ notes: 'Aguardando confirmação' });
        service.update.and.returnValue(of({ ...first, status: AttendanceStatus.APPROVAL_PENDING, notes: 'Aguardando confirmação', version: 1 }));
        await component.save();
        expect(service.update).toHaveBeenCalledWith({ id: 1, status: AttendanceStatus.APPROVAL_PENDING, notes: 'Aguardando confirmação', version: 0, documentsNotes: '', proposalNotes: '' });
        expect(component.editing()!.status).toBe(AttendanceStatus.APPROVAL_PENDING);
        expect(router.navigate).toHaveBeenCalledWith(['/crm/new/customer']);
    });

    it('saves a stage without closing the dialog or advancing to another step', async () => {
        await open(first);
        component.selectEditStep(2);
        component.form.controls.documentsNotes.setValue('Documentos conferidos');
        component.form.markAsDirty();
        const saved = { ...first, status: AttendanceStatus.DOCUMENTS_PENDING, documentsNotes: 'Documentos conferidos', version: 1 };
        service.update.and.returnValue(of(saved));
        await component.save(component.activeEditStep() >= 5);
        expect(service.update).toHaveBeenCalledWith(jasmine.objectContaining({ id: first.id, status: AttendanceStatus.DOCUMENTS_PENDING, documentsNotes: 'Documentos conferidos' }));
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.activeEditStep()).toBe(2);
        expect(component.editing()?.version).toBe(1);
        expect(component.form.pristine).toBeTrue();
    });

    it('keeps the dialog and entered data on an update failure', async () => {
        await open(first);
        component.form.controls.notes.setValue('Dados preservados');
        service.update.and.returnValue(throwError(() => new Error('Offline')));
        await component.save();
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.form.controls.notes.value).toBe('Dados preservados');
        expect(component.saveError()).toBe('Offline');
        expect(component.saving()).toBeFalse();
    });

    it('does not send notes beyond the server limit', async () => {
        await open(first);
        component.form.controls.notes.setValue('x'.repeat(2001));
        await component.save();
        expect(service.update).not.toHaveBeenCalled();
    });

    it('loads the originating visit and advances while preserving workflow notes', async () => {
        await open(first);
        expect(component.originVisit()?.id).toBe(42);
        expect(component.describeVisitValues('1', component.visitReasons)).toContain('Librelato');
        component.selectEditStep(2);
        component.form.patchValue({ documentsNotes: 'Documentos conferidos', proposalNotes: 'Prazo combinado' });
        service.update.and.returnValue(of({ ...first, status: AttendanceStatus.COMMERCIAL_PROPOSAL, documentsNotes: 'Documentos conferidos', proposalNotes: 'Prazo combinado', version: 1 }));
        await component.save(false, 3);
        expect(component.activeEditStep()).toBe(3);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(service.update.calls.mostRecent().args[0].documentsNotes).toBe('Documentos conferidos');
        expect(component.editing()?.version).toBe(1);
    });

    it('does not save an incomplete dialog when the originating visit cannot be loaded', async () => {
        service.detail.and.returnValue(throwError(() => new Error('Offline')));
        await open(first);
        await component.save();
        expect(component.detailError()).toBe('Offline');
        expect(service.update).not.toHaveBeenCalled();
    });

    it('only drafts the new approval stage for legacy payment records until explicitly saved', async () => {
        const legacy = { ...first, status: AttendanceStatus.PAYMENT_PENDING };
        service.detail.and.returnValue(of({ attendance: legacy, visit: Object.assign(new Visit(), { id: 42 }) }));
        await open(legacy);
        expect(component.activeEditStep()).toBe(5);
        expect(component.form.controls.status.value).toBe(AttendanceStatus.APPROVAL_PENDING);
        expect(component.editing()?.status).toBe(AttendanceStatus.PAYMENT_PENDING);
        expect(service.update).not.toHaveBeenCalled();
    });

    it('shows all saved attendance notes and its visit after cancellation without allowing updates', async () => {
        const cancelled = { ...first, status: AttendanceStatus.CANCELLED, notes: 'Observações salvas', documentsNotes: 'Documentos recebidos', proposalNotes: 'Proposta negociada', cancellationReason: 'Cliente desistiu', quoteTotal: 180 };
        service.detail.and.returnValue(of({ attendance: cancelled, visit: Object.assign(new Visit(), { id: 42, clientName: 'Cliente original', reasonVisitInfo: 'Motivo informado' }) }));
        await open(cancelled);
        expect(router.navigate).not.toHaveBeenCalled();
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
        await open(cancelled);
        expect(component.form.disabled).toBeTrue();
        service.detail.and.returnValue(of({ attendance: first, visit: Object.assign(new Visit(), { id: 42 }) }));
        await open(first);
        expect(component.readOnly()).toBeFalse();
        expect(component.form.enabled).toBeTrue();
    });

    it('keeps consultation open if the server reports cancellation while opening an active card', async () => {
        const cancelled = { ...first, status: AttendanceStatus.CANCELLED, cancellationReason: 'Cancelado por outro usuário' };
        service.detail.and.returnValue(of({ attendance: cancelled, visit: Object.assign(new Visit(), { id: 42 }) }));
        await open(first);
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.readOnly()).toBeTrue();
        expect(component.editing()?.cancellationReason).toBe(cancelled.cancellationReason);
        expect(component.form.disabled).toBeTrue();
    });

    it('opens an attendance from its URL and retries loading failures', async () => {
        service.detail.and.returnValue(throwError(() => new Error('Offline')));
        await open(first);
        expect(service.detail).toHaveBeenCalledWith(1);
        expect(component.detailError()).toBe('Offline');
        service.detail.and.returnValue(of({ attendance: first, visit: Object.assign(new Visit(), { id: 42 }) }));
        await component.loadDetail();
        expect(component.editing()?.id).toBe(1);
        expect(component.detailError()).toBe('');
    });

    it('rejects invalid route IDs without making an API request', () => {
        expect(component.detailError()).toContain('inv');
        expect(service.detail).not.toHaveBeenCalled();
    });

    it('ignores an old detail response after navigating to another attendance', async () => {
        const pending = new Subject<{ attendance: CustomerAttendance; visit: Visit | null }>();
        service.detail.and.returnValue(pending);
        params.next(convertToParamMap({ id: '1' }));
        service.detail.and.returnValue(of({ attendance: second, visit: Object.assign(new Visit(), { id: 43 }) }));
        await open(second);
        pending.next({ attendance: first, visit: Object.assign(new Visit(), { id: 42 }) });
        pending.complete();
        await Promise.resolve();
        expect(component.editing()?.id).toBe(2);
    });

    it('creates an attendance and returns to the list without assuming permission to view the other seller', async () => {
        params.next(convertToParamMap({ id: 'new' }));
        await Promise.resolve();
        expect(component.isNew()).toBeTrue();
        await component.create();
        expect(service.create).not.toHaveBeenCalled();
        const created = { ...first, id: 10, visitId: null, clientId: 88, status: AttendanceStatus.DOCUMENTS_PENDING };
        service.create.and.returnValue(of(created));
        component.createForm.patchValue({ clientId: 88, salespersonId: 7, notes: ' Direct contact ' });
        await component.create();
        expect(service.create).toHaveBeenCalledWith({ clientId: 88, salespersonId: 7, notes: 'Direct contact' });
        expect(router.navigate).toHaveBeenCalledWith(['/crm/new/customer'], { replaceUrl: true, queryParams: { createdAttendanceId: 10 } });
    });

    it('loads only the sellers authorized by the API and selects the sole option', async () => {
        service.creationSalespersons.and.returnValue(of([{ id: 7, name: 'Maria', status: StatusEnabDisabEnum.ENABLED } as import('@/app/models/crm/salesperson').Salesperson]));
        params.next(convertToParamMap({ id: 'new' }));
        await Promise.resolve();
        expect(service.creationSalespersons).toHaveBeenCalled();
        expect(component.salespersons().map((person) => person.id)).toEqual([7]);
        expect(component.createForm.controls.salespersonId.value).toBe(7);
    });

    it('keeps the seller selection empty when the permission lookup fails', async () => {
        service.creationSalespersons.and.returnValue(throwError(() => new Error('Not authorized')));
        params.next(convertToParamMap({ id: 'new' }));
        await Promise.resolve();
        expect(component.salespersons()).toEqual([]);
        expect(component.createForm.controls.salespersonId.value).toBeNull();
        expect(component.createError()).toBe('Not authorized');
    });

    it('keeps the new attendance form when creation fails', async () => {
        params.next(convertToParamMap({ id: 'new' }));
        await Promise.resolve();
        service.create.and.returnValue(throwError(() => new Error('Offline')));
        component.createForm.patchValue({ clientId: 88, salespersonId: 7, notes: 'Keep this' });
        await component.create();
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.createForm.controls.notes.value).toBe('Keep this');
        expect(component.createError()).toBe('Offline');
        expect(component.saving()).toBeFalse();
    });

    it('updates the saved quotation without changing the selected step', async () => {
        await open(first);
        component.selectEditStep(4);
        component.budgetSaved({ ...first, quoteTotal: 0, status: AttendanceStatus.QUOTATION });
        expect(component.editing()?.quoteTotal).toBe(0);
        expect(component.activeEditStep()).toBe(4);
    });
});
