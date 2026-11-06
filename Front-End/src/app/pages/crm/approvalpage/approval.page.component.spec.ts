import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import ApprovalPageComponent from './approval.page.component';
import { ApprovalPageService } from '@/app/services/crm/approval.page.service';
import { ApprovalPageData } from '@/app/models/crm/approval.page';

describe('Public approval component', () => {
    let component: ApprovalPageComponent;
    let service: jasmine.SpyObj<ApprovalPageService>;
    const token = 'a'.repeat(43);
    const hidden: ApprovalPageData = { accessRequired: true, fileName: null, contentType: null, size: null, signedFileName: null, signedUploadedAt: null, approvedAt: null };
    const document: ApprovalPageData = { ...hidden, accessRequired: false, fileName: 'pedido.pdf', contentType: 'application/pdf', size: 100 };
    beforeEach(() => {
        service = jasmine.createSpyObj<ApprovalPageService>('ApprovalPageService', ['load', 'verify', 'upload', 'approve', 'download']);
        service.load.and.returnValue(of(hidden));
        TestBed.configureTestingModule({
            providers: [
                { provide: ApprovalPageService, useValue: service },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ token })), snapshot: { data: { kind: 'orders' } } } }
            ]
        });
        component = TestBed.runInInjectionContext(() => new ApprovalPageComponent());
        component.ngOnInit();
    });
    it('loads the order and only reveals metadata after identification', async () => {
        await component.load();
        expect(component.page()!.accessRequired).toBeTrue();
        service.verify.and.returnValue(of(document));
        component.identity.controls.taxId.setValue('12345678901');
        await component.verify();
        expect(service.verify).toHaveBeenCalledWith('orders', token, '12345678901');
        expect(component.page()!.fileName).toBe('pedido.pdf');
        expect(component.identity.controls.taxId.value).toBe('');
    });
    it('requires the signed PDF and explicit confirmation before approving', async () => {
        await component.load();
        component.page.set(document);
        component.confirmation.setValue(true);
        await component.approve();
        expect(service.approve).not.toHaveBeenCalled();
        component.page.set({ ...document, signedFileName: 'signed.pdf' });
        component.confirmation.setValue(false);
        await component.approve();
        expect(service.approve).not.toHaveBeenCalled();
        service.approve.and.returnValue(of({ ...document, signedFileName: 'signed.pdf', approvedAt: '2026-11-05T12:00:00Z' }));
        component.confirmation.setValue(true);
        await component.approve();
        expect(service.approve).toHaveBeenCalledWith('orders', token);
        expect(component.page()!.approvedAt).toBeTruthy();
    });
    it('rejects images before uploading', () => {
        const input = documentThisInput(new File(['image'], 'foto.png', { type: 'image/png' }));
        component.selectFile({ target: input } as unknown as Event);
        expect(component.file()).toBeNull();
        expect(component.error()).toContain('PDF');
        expect(service.upload).not.toHaveBeenCalled();
    });
    it('returns to identification when the session expires', async () => {
        await component.load();
        component.page.set({ ...document, signedFileName: 'signed.pdf' });
        component.confirmation.setValue(true);
        service.approve.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Identifique-se novamente.' } })));
        await component.approve();
        expect(component.page()!.accessRequired).toBeTrue();
        expect(component.page()!.fileName).toBeNull();
    });
    it('shows an explicit signed PDF selector on the proposal approval page', async () => {
        const fixture = TestBed.createComponent(ApprovalPageComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        const page = fixture.componentInstance;
        page.kind.set('proposals');
        page.page.set(document);
        page.loading.set(false);
        fixture.detectChanges();
        const input = fixture.nativeElement.querySelector('#signedFile') as HTMLInputElement;
        const select = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find((button) => button.textContent?.includes('Selecionar PDF assinado'));
        expect(select).toBeTruthy();
        spyOn(input, 'click');
        select!.click();
        expect(input.click).toHaveBeenCalled();
        page.page.set({ ...document, signedFileName: 'assinada.pdf' });
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('#signedFile')).toBeNull();
    });
    function documentThisInput(file: File) {
        return { files: [file], value: 'file' };
    }
});
