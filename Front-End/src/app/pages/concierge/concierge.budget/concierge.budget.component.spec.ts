import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import ConciergeBudgetComponent from './concierge.budget.component';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
describe('ConciergeBudgetComponent', () => {
    it('queries the API when selecting completed or cancelled budgets and retains the filter on refresh', () => {
        const service = jasmine.createSpyObj<ConciergeBudgetService>('ConciergeBudgetService', ['list']);
        service.list.and.returnValue(of([]));
        TestBed.configureTestingModule({ providers: [ConciergeBudgetComponent, { provide: ConciergeBudgetService, useValue: service }] });
        const component = TestBed.inject(ConciergeBudgetComponent);
        component.ngOnInit();
        expect(service.list).toHaveBeenCalledWith('OpenBudget');
        component.selectStatus('CompleteBudget');
        expect(service.list).toHaveBeenCalledWith('CompleteBudget');
        component.selectStatus('CancelledBudget');
        expect(service.list).toHaveBeenCalledWith('CancelledBudget');
        component.load();
        expect(service.list.calls.mostRecent().args).toEqual(['CancelledBudget']);
    });
    it('keeps the selected status while a request is pending', () => {
        const service = jasmine.createSpyObj<ConciergeBudgetService>('ConciergeBudgetService', ['list']);
        const response = new Subject<never[]>();
        service.list.and.returnValue(response);
        TestBed.configureTestingModule({ providers: [ConciergeBudgetComponent, { provide: ConciergeBudgetService, useValue: service }] });
        const component = TestBed.inject(ConciergeBudgetComponent);
        component.load();
        component.selectStatus('CompleteBudget');
        expect(component.statusFilter()).toBe('OpenBudget');
        expect(service.list).toHaveBeenCalledTimes(1);
        response.complete();
    });
    it('loads budgets and allows retrying after a failure', () => {
        const service = jasmine.createSpyObj<ConciergeBudgetService>('ConciergeBudgetService', ['list']);
        service.list.and.returnValue(throwError(() => new Error('Offline')));
        TestBed.configureTestingModule({ providers: [ConciergeBudgetComponent, { provide: ConciergeBudgetService, useValue: service }] });
        const component = TestBed.inject(ConciergeBudgetComponent);
        component.load();
        expect(service.list).toHaveBeenCalledWith('OpenBudget');
        expect(component.statusFilter()).toBe('OpenBudget');
        expect(component.error()).toBeTruthy();
        expect(component.loading()).toBeFalse();
        service.list.and.returnValue(of([]));
        component.load();
        expect(component.error()).toBe('');
        expect(component.budgets()).toEqual([]);
    });
});
