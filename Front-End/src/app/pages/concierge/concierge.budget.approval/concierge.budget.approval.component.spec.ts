import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ConciergeBudgetApprovalComponent } from './concierge.budget.approval.component';
import { ConciergeBudgetApprovalService } from '@/app/services/concierge/concierge.budget.approval.service';
import { ConciergeBudgetApprovalData } from '@/app/models/concierge.budget.approval';
describe('ConciergeBudgetApprovalComponent', () => {
    let component: ConciergeBudgetApprovalComponent;
    let service: jasmine.SpyObj<ConciergeBudgetApprovalService>;
    const hidden: ConciergeBudgetApprovalData = { accessRequired: true, budgetId: null, clientName: null, vehiclePlate: null, fileName: null, size: null, dateValidation: null, approvedAt: null, total: null, items: [] };
    const budget: ConciergeBudgetApprovalData = {
        ...hidden,
        accessRequired: false,
        budgetId: 15,
        clientName: 'Cliente',
        vehiclePlate: 'ABC1D23',
        fileName: 'orcamento.pdf',
        size: 100,
        total: 140,
        items: [{ type: 1, description: 'Reparo', quantity: 1, hourService: 1.5, price: 100, discount: 10, total: 140 }]
    };
    beforeEach(async () => {
        service = jasmine.createSpyObj('ConciergeBudgetApprovalService', ['load', 'verify', 'approve', 'download']);
        service.load.and.returnValue(of(hidden));
        TestBed.configureTestingModule({
            providers: [ConciergeBudgetApprovalComponent, { provide: ConciergeBudgetApprovalService, useValue: service }, { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ token: 'a'.repeat(43) })) } }]
        });
        component = TestBed.inject(ConciergeBudgetApprovalComponent);
        component.ngOnInit();
        await Promise.resolve();
    });
    it('requires identity confirmation before displaying budget details', async () => {
        expect(component.page()?.accessRequired).toBeTrue();
        expect(component.page()?.items).toEqual([]);
        component.identity.controls.taxId.setValue('123.456.789-01');
        service.verify.and.returnValue(of(budget));
        await component.verify();
        expect(service.verify).toHaveBeenCalledWith('a'.repeat(43), '123.456.789-01');
        expect(component.page()?.total).toBe(140);
        expect(component.identity.controls.taxId.value).toBe('');
    });
    it('requires the checkbox and prevents duplicate approvals', async () => {
        component.page.set(budget);
        await component.approve();
        expect(service.approve).not.toHaveBeenCalled();
        component.confirmation.setValue(true);
        service.approve.and.returnValue(of({ ...budget, approvedAt: '2026-11-09T12:00:00Z' }));
        await component.approve();
        await component.approve();
        expect(service.approve.calls.count()).toBe(1);
        expect(component.page()?.approvedAt).toBeTruthy();
    });
    it('hides previously visible data when access expires', async () => {
        component.page.set(budget);
        component.confirmation.setValue(true);
        service.approve.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
        await component.approve();
        expect(component.page()?.accessRequired).toBeTrue();
        expect(component.page()?.clientName).toBeNull();
        expect(component.page()?.fileName).toBeNull();
        expect(component.page()?.items).toEqual([]);
        expect(component.confirmation.value).toBeFalse();
    });
    it('does not approve or download while access is unverified', async () => {
        component.confirmation.setValue(true);
        await component.approve();
        await component.download();
        expect(service.approve).not.toHaveBeenCalled();
        expect(service.download).not.toHaveBeenCalled();
    });
});

describe('Rendered concierge approval page', () => {
    it('approves through the rendered button and displays the confirmation', async () => {
        const budget: ConciergeBudgetApprovalData = { accessRequired: false, budgetId: 15, clientName: 'Cliente', vehiclePlate: 'ABC1D23', fileName: 'orcamento.pdf', size: 100, dateValidation: null, approvedAt: null, total: 140, items: [] };
        const service = jasmine.createSpyObj<ConciergeBudgetApprovalService>('ConciergeBudgetApprovalService', ['load', 'approve']);
        service.load.and.returnValue(of(budget));
        service.approve.and.returnValue(of({ ...budget, approvedAt: '2026-11-09T12:00:00Z' }));
        TestBed.configureTestingModule({
            imports: [ConciergeBudgetApprovalComponent],
            providers: [
                { provide: ConciergeBudgetApprovalService, useValue: service },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ token: 'a'.repeat(43) })) } }
            ]
        });
        const fixture = TestBed.createComponent(ConciergeBudgetApprovalComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        fixture.componentInstance.confirmation.setValue(true);
        fixture.detectChanges();
        await fixture.whenStable();
        const button = fixture.nativeElement.querySelector('.approval-card form button') as HTMLButtonElement;
        expect(button.disabled).toBeFalse();
        button.click();
        await fixture.whenStable();
        fixture.detectChanges();
        expect(service.approve).toHaveBeenCalledWith('a'.repeat(43));
        expect(fixture.nativeElement.querySelector('.approved')).toBeTruthy();
    });
});
