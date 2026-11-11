import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ConciergeBudgetDocumentsComponent } from './concierge.budget.documents.component';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
import { ConciergeBudgetDocument } from '@/app/models/concierge.budget.document';
describe('Concierge budget PDF', () => {
    let component: ConciergeBudgetDocumentsComponent;
    let service: jasmine.SpyObj<ConciergeBudgetService>;
    const item: ConciergeBudgetDocument = { id: 3, budgetId: 15, fileName: 'orcamento.pdf', contentType: 'application/pdf', size: 10, createdAt: '' };
    beforeEach(() => {
        service = jasmine.createSpyObj('ConciergeBudgetService', ['documents', 'uploadDocument', 'removeDocument', 'share']);
        TestBed.configureTestingModule({ providers: [ConciergeBudgetDocumentsComponent, { provide: ConciergeBudgetService, useValue: service }] });
        component = TestBed.inject(ConciergeBudgetDocumentsComponent);
        component.budgetId = 15;
    });
    it('rejects images and oversized PDFs before sending', async () => {
        await component.upload(new File(['image'], 'foto.png', { type: 'image/png' }));
        await component.upload(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.pdf', { type: 'application/pdf' }));
        expect(service.uploadDocument).not.toHaveBeenCalled();
        expect(component.error()).toContain('PDF');
    });
    it('uploads one PDF and reloads its saved metadata', async () => {
        const file = new File(['%PDF-test'], 'orcamento.pdf', { type: 'application/pdf' });
        service.uploadDocument.and.returnValue(of(item));
        await component.upload(file);
        expect(service.uploadDocument).toHaveBeenCalledWith(15, file);
        expect(component.documents()).toEqual([item]);
        service.documents.and.returnValue(of([item]));
        await component.load();
        expect(service.documents).toHaveBeenCalledWith(15);
        expect(component.documents()).toEqual([item]);
        await component.upload(file);
        expect(service.uploadDocument.calls.count()).toBe(1);
    });
    it('keeps documents visible after removal failure and permits retry', async () => {
        component.documents.set([item]);
        spyOn(window, 'confirm').and.returnValue(true);
        service.removeDocument.and.returnValue(throwError(() => new Error('offline')));
        await component.remove(item);
        expect(component.documents()).toEqual([item]);
        expect(component.error()).toBeTruthy();
        service.removeDocument.and.returnValue(of(undefined));
        await component.remove(item);
        expect(service.removeDocument).toHaveBeenCalledWith(15, 3);
        expect(component.documents()).toEqual([]);
    });
    it('permits consultation but blocks changes on closed budgets', async () => {
        component.readOnly = true;
        service.documents.and.returnValue(of([item]));
        await component.load();
        await component.upload(new File(['%PDF-test'], 'orcamento.pdf', { type: 'application/pdf' }));
        await component.remove(item);
        expect(component.documents()).toEqual([item]);
        expect(service.uploadDocument).not.toHaveBeenCalled();
        expect(service.removeDocument).not.toHaveBeenCalled();
    });

    it('shows the API problem detail and permits retry after a share failure', async () => {
        component.documents.set([item]);
        const detail = 'Cadastre o CPF ou CNPJ do cliente antes de compartilhar.';
        service.share.and.returnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { detail } })));
        await component.share();
        expect(component.error()).toBe(detail);
        expect(component.sharing()).toBeFalse();
        service.share.and.returnValue(of({ path: '/public/concierge-budgets/test', expiresAt: '2026-11-16T12:00:00Z' }));
        await component.share();
        expect(component.error()).toBe('');
        expect(component.shareUrl()).toContain('/public/concierge-budgets/test');
    });

    it('includes the HTTP status when the API omits the reason', async () => {
        component.documents.set([item]);
        service.share.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500, error: {} })));
        await component.share();
        expect(component.error()).toContain('HTTP 500');
        expect(component.shareUrl()).toBe('');
    });

    it('generates an approval link and clears it when budget data reloads', async () => {
        component.documents.set([item]);
        service.share.and.returnValue(of({ path: '/public/concierge-budgets/' + 'a'.repeat(43), expiresAt: '2026-11-16T12:00:00Z' }));
        await component.share();
        expect(service.share).toHaveBeenCalledWith(15);
        expect(component.shareUrl()).toContain('/public/concierge-budgets/');
        service.documents.and.returnValue(of([item]));
        await component.load();
        expect(component.shareUrl()).toBe('');
    });
});
