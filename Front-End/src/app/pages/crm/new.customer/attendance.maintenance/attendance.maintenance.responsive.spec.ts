import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import AttendanceMaintenanceComponent from './attendance.maintenance.component';
import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';
import { AttendanceProposalPrintService } from '@/app/services/crm/attendance.proposal.print.service';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';

describe('Attendance summary responsive layout', () => {
    it('fits narrow panels and keeps every item value available without page overflow', async () => {
        const attendance: CustomerAttendance = {
            id: 42,
            visitId: null,
            clientId: 1,
            clientName: 'Cliente'.repeat(30),
            salespersonId: 1,
            salespersonName: 'Vendedor'.repeat(30),
            dateCreated: '2026-11-11',
            dateVisit: null,
            status: AttendanceStatus.COMPLETED,
            notes: '',
            version: 0,
            quoteTotal: 999999999999.99
        };
        const service = jasmine.createSpyObj<CustomerAttendanceService>('CustomerAttendanceService', ['documents', 'getQuote']);
        service.documents.and.callFake((_id, stage) => of([{ id: 1, stage, receiptAmount: null, fileName: 'documento'.repeat(25) + '.pdf', contentType: 'application/pdf', size: 10, createdAt: '' }]));
        service.getQuote.and.returnValue(
            of({
                attendance,
                quote: {
                    id: 1,
                    version: 0,
                    dateCreated: '',
                    dateUpdated: '',
                    notes: 'Observação'.repeat(40),
                    subtotal: 999999999999.99,
                    discountTotal: 0,
                    total: 999999999999.99,
                    items: [{ productName: 'Implemento'.repeat(25), quantity: 1, unitPrice: 999999999999.99, discountType: 'FIXED', discountValue: 0 }]
                }
            })
        );
        TestBed.configureTestingModule({ imports: [AttendanceMaintenanceComponent], providers: [provideRouter([]), { provide: CustomerAttendanceService, useValue: service }, { provide: AttendanceProposalPrintService, useValue: {} }] });
        const fixture = TestBed.createComponent(AttendanceMaintenanceComponent);
        fixture.detectChanges();
        const page = fixture.componentInstance;
        page.detailError.set('');
        page.editing.set(attendance);
        page.budgetSaved(attendance);
        page.selectEditStep(7);
        fixture.detectChanges();
        await page.loadCompletionSummary();
        fixture.detectChanges();
        const summary = fixture.nativeElement.querySelector('.attendance-summary') as HTMLElement;
        const styles = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'))
            .map((element) => element.outerHTML)
            .join('');
        const frame = document.createElement('iframe');
        frame.style.cssText = 'position:fixed;left:-10000px;height:1200px;border:0;';
        document.body.appendChild(frame);
        try {
            for (const width of [320, 375, 768, 1024]) {
                frame.style.width = width + 'px';
                await new Promise<void>((resolve) => {
                    frame.onload = () => resolve();
                    frame.srcdoc = `<!doctype html><html><head><base href="${document.baseURI}">${styles}<style>body{margin:0;padding:16px;box-sizing:border-box}</style></head><body>${summary.outerHTML}</body></html>`;
                });
                const doc = frame.contentDocument!;
                const view = frame.contentWindow!;
                expect(doc.documentElement.scrollWidth)
                    .withContext(`page width at ${width}px`)
                    .toBeLessThanOrEqual(width + 1);
                const mobileItems = doc.querySelector('.summary-mobile-items')!;
                const desktopItems = doc.querySelector('.summary-desktop-items')!;
                expect(view.getComputedStyle(mobileItems).display).toBe(width < 672 ? 'grid' : 'none');
                expect(view.getComputedStyle(desktopItems).display === 'none').toBe(width < 672);
                expect(mobileItems.textContent).toContain('Valor unitário');
                expect(mobileItems.textContent).toContain('Total do item');
            }
        } finally {
            frame.remove();
            fixture.destroy();
        }
    });
});
