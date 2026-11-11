import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import AttendanceMaintenanceComponent from './attendance.maintenance.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { AttendanceDocument } from '@/app/models/crm/attendance.document';
import { Confirmation, ConfirmationService } from 'primeng/api';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';

describe('Attendance completion summary', () => {
    const attendance: CustomerAttendance = {
        id: 42,
        visitId: null,
        clientId: 2,
        clientName: 'Cliente de teste',
        salespersonId: 3,
        salespersonName: 'Vendedor de teste',
        dateCreated: '2026-11-11',
        dateVisit: null,
        status: AttendanceStatus.DELIVERY_PENDING,
        notes: '',
        version: 0,
        quoteTotal: 1000
    };
    const document = (stage: 'PAYMENT' | 'INVOICING', receiptAmount: number | null, id = 1): AttendanceDocument => ({
        id,
        stage,
        receiptAmount,
        fileName: `documento-${id}.pdf`,
        contentType: 'application/pdf',
        size: 10,
        createdAt: '2026-11-11'
    });
    let service: jasmine.SpyObj<CustomerAttendanceService>;
    let page: AttendanceMaintenanceComponent;
    let confirmations: ConfirmationService;
    beforeEach(() => {
        service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['documents', 'getQuote', 'update', 'create']);
        service.documents.and.returnValue(of([]));
        service.getQuote.and.returnValue(of({ attendance, quote: null }));
        TestBed.configureTestingModule({
            imports: [AttendanceMaintenanceComponent],
            providers: [provideRouter([]), { provide: CustomerAttendanceService, useValue: service }, { provide: AttendanceProposalPrintService, useValue: {} }]
        });
        const fixture = TestBed.createComponent(AttendanceMaintenanceComponent);
        page = fixture.componentInstance;
        confirmations = fixture.debugElement.injector.get(ConfirmationService);
        spyOn(confirmations, 'confirm');
        page.editing.set(attendance);
        page.activeEditStep.set(7);
    });
    it('compares payment and invoicing independently and identifies documents without values', async () => {
        service.documents.and.callFake((_id, stage) => of(stage === 'PAYMENT' ? [document('PAYMENT', 250), document('PAYMENT', 150, 2), document('INVOICING', 9999)] : [document('INVOICING', 800), document('INVOICING', null, 3)]));
        await page.loadCompletionSummary();
        const [payment, invoicing] = page.financialSummaries();
        expect(payment.total).toBe(400);
        expect(payment.remaining).toBe(600);
        expect(payment.count).toBe(2);
        expect(invoicing.total).toBe(800);
        expect(invoicing.remaining).toBe(200);
        expect(invoicing.missingValues).toEqual(['documento-3.pdf']);
    });
    it('requires a registered client to save every stage of a visit attendance', async () => {
        const fromVisit = { ...attendance, visitId: 99, clientId: null };
        page.editing.set(fromVisit);
        page.form.controls.salespersonId.setValue(3);
        expect(page.hasRegisteredClient()).toBeFalse();
        for (let step = 1; step <= page.workflow.length; step++) {
            page.selectEditStep(step);
            expect(await page.save(false)).toBeFalse();
            expect(page.saveError()).toContain('cliente cadastrado');
        }
        expect(service.update).not.toHaveBeenCalled();
        page.selectEditStep(2);
        service.update.and.returnValue(of({ ...fromVisit, clientId: 88, clientName: 'Cliente cadastrado' }));
        await page.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Cliente cadastrado', status: StatusEnabDisabEnum.ENABLED }));
        expect(page.hasRegisteredClient()).toBeTrue();
        expect(service.update).toHaveBeenCalledWith(jasmine.objectContaining({ clientId: 88 }));
        expect(page.editing()?.visitId).toBe(99);
    });
    it('does not create a direct attendance without a registered client', async () => {
        page.createForm.controls.salespersonId.setValue(3);
        await page.create();
        expect(service.create).not.toHaveBeenCalled();
        expect(page.createForm.controls.clientId.invalid).toBeTrue();
    });
    it('does not implicitly conclude when selecting a client on the final step', async () => {
        page.editing.set({ ...attendance, visitId: 99, clientId: null });
        page.form.controls.salespersonId.setValue(3);
        await page.selectAttendanceClient(Object.assign(new ClientCompany(), { id: 88, name: 'Cliente cadastrado', status: StatusEnabDisabEnum.ENABLED }));
        expect(page.hasRegisteredClient()).toBeTrue();
        expect(page.form.dirty).toBeTrue();
        expect(service.update).not.toHaveBeenCalled();
        expect(confirmations.confirm).not.toHaveBeenCalled();
    });
    it('asks for confirmation and saves only after acceptance', async () => {
        service.documents.and.callFake((_id, stage) => of([document(stage as 'PAYMENT' | 'INVOICING', 1000)]));
        await page.loadCompletionSummary();
        page.form.controls.salespersonId.setValue(3);
        page.form.controls.status.setValue(AttendanceStatus.COMPLETED);
        const save = spyOn(page, 'save').and.resolveTo(true);
        page.saveCurrentStep();
        expect(confirmations.confirm).toHaveBeenCalledTimes(1);
        expect(save).not.toHaveBeenCalled();
        const dialog = (confirmations.confirm as jasmine.Spy).calls.mostRecent().args[0] as Confirmation;
        expect(dialog.message).toContain('não poderão ser alterados');
        page.requestCompletion();
        expect(confirmations.confirm).toHaveBeenCalledTimes(1);
        dialog.reject?.();
        expect(page.confirmingCompletion()).toBeFalse();
        expect(save).not.toHaveBeenCalled();
        page.requestCompletion();
        const accepted = (confirmations.confirm as jasmine.Spy).calls.mostRecent().args[0] as Confirmation;
        accepted.accept?.();
        expect(save).toHaveBeenCalledOnceWith(true);
    });
    it('does not open confirmation with pending values and rechecks them on acceptance', async () => {
        page.requestCompletion();
        expect(confirmations.confirm).not.toHaveBeenCalled();
        service.documents.and.callFake((_id, stage) => of([document(stage as 'PAYMENT' | 'INVOICING', 1000)]));
        await page.loadCompletionSummary();
        page.form.controls.salespersonId.setValue(3);
        page.requestCompletion();
        const dialog = (confirmations.confirm as jasmine.Spy).calls.mostRecent().args[0] as Confirmation;
        service.documents.and.returnValue(of([]));
        await page.loadCompletionSummary();
        const save = spyOn(page, 'save').and.resolveTo(true);
        dialog.accept?.();
        expect(save).not.toHaveBeenCalled();
    });
    it('keeps a completed attendance in consultation mode across all stages', async () => {
        page.budgetSaved({ ...attendance, status: AttendanceStatus.COMPLETED });
        expect(page.readOnly()).toBeTrue();
        expect(page.form.disabled).toBeTrue();
        expect(page.activeEditStep()).toBe(7);
        page.selectEditStep(4);
        expect(page.activeEditStep()).toBe(4);
        expect(page.form.controls.status.value).toBe(AttendanceStatus.COMPLETED);
        expect(await page.save(false)).toBeFalse();
        expect(service.update).not.toHaveBeenCalled();
        expect(page.canComplete()).toBeFalse();
    });
    it('allows completion only after both stages match the order total', async () => {
        expect(page.canComplete()).toBeFalse();
        for (const invoiceAmount of [null, 900, 1100]) {
            service.documents.and.callFake((_id, stage) => of([document(stage as 'PAYMENT' | 'INVOICING', stage === 'PAYMENT' ? 1000 : invoiceAmount)]));
            await page.loadCompletionSummary();
            expect(page.canComplete()).toBeFalse();
        }
        service.documents.and.callFake((_id, stage) => of([document(stage as 'PAYMENT' | 'INVOICING', 1000)]));
        await page.loadCompletionSummary();
        expect(page.canComplete()).toBeTrue();
        page.editing.set({ ...attendance, id: 99 });
        expect(page.canComplete()).toBeFalse();
    });
    it('blocks completion while refreshing or when consultation fails', async () => {
        service.documents.and.callFake((_id, stage) => of([document(stage as 'PAYMENT' | 'INVOICING', 1000)]));
        await page.loadCompletionSummary();
        expect(page.canComplete()).toBeTrue();
        const pending = new Subject<AttendanceDocument[]>();
        service.documents.and.returnValue(pending);
        const loading = page.loadCompletionSummary();
        expect(page.canComplete()).toBeFalse();
        pending.error(new Error('Falha na consulta'));
        await loading;
        expect(page.canComplete()).toBeFalse();
    });
    it('does not send a completion update when financial values are pending', async () => {
        page.form.controls.status.setValue(AttendanceStatus.COMPLETED);
        expect(await page.save(false)).toBeFalse();
        expect(service.update).not.toHaveBeenCalled();
        expect(page.saveError()).toContain('pendências');
    });
    it('opens the review from delivery without persisting the completed status', async () => {
        page.activeEditStep.set(6);
        page.form.controls.salespersonId.setValue(3);
        page.form.controls.status.setValue(AttendanceStatus.DELIVERY_PENDING);
        service.update.and.returnValue(of(attendance));
        expect(await page.save(false, 7)).toBeTrue();
        expect(service.update.calls.mostRecent().args[0].status).toBe(AttendanceStatus.DELIVERY_PENDING);
        expect(page.activeEditStep()).toBe(7);
        expect(page.form.controls.status.value).toBe(AttendanceStatus.COMPLETED);
        expect(await page.save(false)).toBeFalse();
        expect(service.update).toHaveBeenCalledTimes(1);
    });
    it('loads the saved quote items and distinguishes a quote failure from an empty budget', async () => {
        const quote = {
            id: 1,
            version: 0,
            notes: '',
            dateCreated: '',
            dateUpdated: '',
            subtotal: 1000,
            discountTotal: 0,
            total: 1000,
            items: [{ productName: 'Implemento', quantity: 2.5, unitPrice: 400, discountType: 'FIXED' as const, discountValue: 0 }]
        };
        service.getQuote.and.returnValue(of({ attendance, quote }));
        await page.loadCompletionSummary();
        expect(service.getQuote).toHaveBeenCalledWith(42);
        expect(page.summaryQuote()?.items).toEqual(quote.items);
        service.getQuote.and.returnValue(throwError(() => new Error('Falha no orçamento')));
        await page.loadCompletionSummary();
        expect(page.summaryQuote()).toBeUndefined();
        expect(page.summaryQuoteError()).toBe('Falha no orçamento');
        expect(page.financialSummaries()[0].error).toBeUndefined();
    });
    it('handles cents accurately and reports excess separately', async () => {
        page.editing.set({ ...attendance, quoteTotal: 0.3 });
        service.documents.and.callFake((_id, stage) => of(stage === 'PAYMENT' ? [document('PAYMENT', 0.1), document('PAYMENT', 0.2, 2)] : [document('INVOICING', 0.4)]));
        await page.loadCompletionSummary();
        const [payment, invoicing] = page.financialSummaries();
        expect(payment.total).toBe(0.3);
        expect(payment.remaining).toBe(0);
        expect(payment.excess).toBe(0);
        expect(invoicing.remaining).toBe(0);
        expect(invoicing.excess).toBe(0.1);
    });
    it('does not treat a missing budget as a fully informed payment', async () => {
        page.editing.set({ ...attendance, quoteTotal: null });
        await page.loadCompletionSummary();
        expect(page.financialSummaries().every((summary) => summary.remaining === null && summary.count === 0)).toBeTrue();
    });
    it('keeps the available stage when the other request fails', async () => {
        service.documents.and.callFake((_id, stage) => (stage === 'PAYMENT' ? throwError(() => new Error('Falha no pagamento')) : of([document('INVOICING', 1000)])));
        await page.loadCompletionSummary();
        expect(page.financialSummaries()[0].error).toBe('Falha no pagamento');
        expect(page.financialSummaries()[1].remaining).toBe(0);
        expect(page.loadingSummary()).toBeFalse();
    });
    it('refreshes the saved document values on every consultation', async () => {
        await page.loadCompletionSummary();
        expect(page.financialSummaries()[0].remaining).toBe(1000);
        service.documents.and.returnValue(of([document('PAYMENT', 1000)]));
        await page.loadCompletionSummary();
        expect(page.financialSummaries()[0].remaining).toBe(0);
    });
    it('ignores a stale response after leaving the completion step', async () => {
        const pending = new Subject<AttendanceDocument[]>();
        service.documents.and.returnValue(pending);
        const loading = page.loadCompletionSummary();
        page.activeEditStep.set(4);
        await page.loadCompletionSummary();
        pending.next([document('PAYMENT', 1000)]);
        pending.complete();
        await loading;
        expect(page.financialSummaries()[0].total).toBe(0);
        expect(page.loadingSummary()).toBeFalse();
    });
});
