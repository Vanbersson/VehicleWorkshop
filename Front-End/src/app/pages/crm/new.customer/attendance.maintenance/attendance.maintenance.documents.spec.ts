import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import AttendanceMaintenanceComponent from './attendance.maintenance.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
describe('Attendance document panel requests', () => {
    it('creates a single document panel and reloads only when the selected stage changes', async () => {
        const service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['documents', 'update', 'getQuote']);
        service.documents.and.returnValue(of([]));
        TestBed.configureTestingModule({
            imports: [AttendanceMaintenanceComponent],
            providers: [provideRouter([]), MessageService, { provide: CustomerAttendanceService, useValue: service }, { provide: AttendanceProposalPrintService, useValue: { print: () => Promise.resolve() } }]
        });
        const fixture = TestBed.createComponent(AttendanceMaintenanceComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        const page = fixture.componentInstance;
        const item: CustomerAttendance = {
            id: 16,
            visitId: null,
            clientId: 1,
            clientName: 'Cliente',
            salespersonId: 1,
            salespersonName: 'Vendedor',
            dateCreated: '2026-11-06',
            dateVisit: null,
            status: AttendanceStatus.QUOTATION,
            notes: '',
            version: 0
        };
        page.detailError.set('');
        page.editing.set(item);
        page.activeEditStep.set(3);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(service.documents.calls.allArgs()).toEqual([[16, 'DOCUMENTS']]);
        expect(fixture.nativeElement.querySelectorAll('p-attendance-documents').length).toBe(1);
        page.editing.set({ ...item, quoteTotal: 100 });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.count()).toBe(1);
        page.activeEditStep.set(4);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.allArgs()).toEqual([
            [16, 'DOCUMENTS'],
            [16, 'PAYMENT']
        ]);
        expect(fixture.nativeElement.querySelectorAll('p-attendance-payment').length).toBe(1);
        page.activeEditStep.set(3);
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.allArgs()).toEqual([
            [16, 'DOCUMENTS'],
            [16, 'PAYMENT'],
            [16, 'DOCUMENTS']
        ]);
        page.activeEditStep.set(6);
        page.budgetSaved({ ...item, scheduledDeliveryDate: '2026-11-20', pickupDate: '2026-11-21' });
        fixture.detectChanges();
        await fixture.whenStable();
        expect(service.documents.calls.mostRecent().args).toEqual([16, 'DELIVERY']);
        expect(fixture.nativeElement.querySelector('#scheduledDeliveryDate')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('#pickupDate')).toBeTruthy();
        expect(page.form.controls.scheduledDeliveryDate.value?.getDate()).toBe(20);
        expect(page.form.controls.pickupDate.value?.getDate()).toBe(21);
        service.update.and.returnValue(of({ ...item, status: AttendanceStatus.DELIVERY_PENDING, scheduledDeliveryDate: '2026-11-20', pickupDate: '2026-11-21' }));
        expect(await page.save(false)).toBeTrue();
        expect(service.update.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ scheduledDeliveryDate: '2026-11-20', pickupDate: '2026-11-21' }));
        page.editing.set({ ...item, quoteTotal: 1000 });
        service.getQuote.and.returnValue(
            of({
                attendance: item,
                quote: {
                    id: 1,
                    version: 0,
                    notes: '',
                    dateCreated: '',
                    dateUpdated: '',
                    subtotal: 1000,
                    discountTotal: 0,
                    total: 1000,
                    items: [{ productName: 'Implemento para teste', quantity: 2.5, unitPrice: 440, discountType: 'FIXED', discountValue: 100 }]
                }
            })
        );
        page.selectEditStep(7);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(service.documents.calls.allArgs().slice(-2)).toEqual([
            [16, 'PAYMENT'],
            [16, 'INVOICING']
        ]);
        await page.loadCompletionSummary();
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('Resumo do atendimento');
        expect(fixture.nativeElement.textContent).toContain('Data de agendamento de retirada');
        expect(fixture.nativeElement.querySelector('table').textContent).toContain('Implemento para teste');
        expect(fixture.nativeElement.querySelector('table').textContent).toContain('2.5');
        expect(fixture.nativeElement.querySelector('tbody tr').cells[2].textContent.replace(/\D/g, '')).toBe('44000');
        expect(fixture.nativeElement.querySelector('tbody tr').cells[3].textContent.replace(/\D/g, '')).toBe('100000');
        expect(fixture.nativeElement.textContent).toContain('Nenhum comprovante de pagamento anexado.');
        expect(fixture.nativeElement.textContent).toContain('Nenhum documento fiscal anexado.');
        expect(page.financialSummaries().map((summary) => summary.remaining)).toEqual([1000, 1000]);
        const completeButton = (): HTMLButtonElement => Array.from(fixture.nativeElement.querySelectorAll('footer button') as NodeListOf<HTMLButtonElement>).find((button) => button.textContent?.includes('Concluir atendimento'))!;
        expect(completeButton().disabled).toBeTrue();
        service.documents.and.callFake((_id, stage) => of([{ id: 1, stage, fileName: 'documento.pdf', contentType: 'application/pdf', size: 10, createdAt: '', receiptAmount: 1000 }]));
        await page.loadCompletionSummary();
        fixture.detectChanges();
        expect(completeButton().disabled).toBeFalse();
    });
});
