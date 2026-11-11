import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import ConciergeBudgetMaintenanceComponent from './concierge.budget.maintenance.component';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { TypePaymentService } from '@/app/services/client/type.payment.service';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { ConciergeBudget } from '@/app/models/concierge.budget';
describe('ConciergeBudgetMaintenanceComponent', () => {
    let component: ConciergeBudgetMaintenanceComponent;
    let service: jasmine.SpyObj<ConciergeBudgetService>;
    let router: jasmine.SpyObj<Router>;
    beforeEach(() => {
        service = jasmine.createSpyObj('ConciergeBudgetService', ['create', 'update', 'attendants']);
        service.attendants.and.returnValue(of([{ id: 3, name: 'Atendente' }]));
        router = jasmine.createSpyObj('Router', ['navigate']);
        router.navigate.and.returnValue(Promise.resolve(true));
        const vehicle = { ...new VehicleEntry(), id: 7, clientCompanyId: 2, salespersonId: 3, clientCompanyName: 'Cliente' };
        TestBed.configureTestingModule({
            providers: [
                ConciergeBudgetMaintenanceComponent,
                { provide: ConciergeBudgetService, useValue: service },
                { provide: Router, useValue: router },
                { provide: VehicleEntryService, useValue: { listAllPlates: () => of([vehicle]) } },
                { provide: TypePaymentService, useValue: { listAllEnabled: () => of([]) } }
            ]
        });
        component = TestBed.inject(ConciergeBudgetMaintenanceComponent);
        component.loadOptions();
    });
    it('fills client and attendant from the entry and clears stale data when changing or clearing it', () => {
        const first = { ...component.vehicles()[0], salespersonName: 'Atendente da entrada' };
        const second = { ...first, id: 8, clientCompanyId: 5, clientCompanyName: 'Outra empresa', salespersonId: null, salespersonName: '' };
        component.vehicles.set([first, second]);
        component.selectVehicle(7);
        expect(component.form.controls.clientCompanyId.value).toBe(2);
        expect(component.clientName()).toBe('Cliente');
        expect(component.form.controls.salespersonUserId.value).toBe(3);
        expect(component.attendantName()).toBe('Atendente da entrada');
        component.selectVehicle(8);
        expect(component.form.controls.clientCompanyId.value).toBe(5);
        expect(component.clientName()).toBe('Outra empresa');
        expect(component.form.controls.salespersonUserId.value).toBeNull();
        expect(component.attendantName()).toBe('');
        component.selectVehicle(null);
        expect(component.form.controls.clientCompanyId.value).toBeNull();
        expect(component.clientName()).toBe('');
    });
    it('requires a vehicle and sends only editable fields on creation', () => {
        component.save();
        expect(service.create).not.toHaveBeenCalled();
        component.form.patchValue({ vehicleId: 7, information: ' Teste ' });
        component.selectVehicle(7);
        service.create.and.returnValue(of({ id: 15, vehicleId: 7, status: 'OpenBudget', clientCompanyId: 2, salespersonUserId: 3, salespersonUserName: 'Vendedor', information: 'Teste', items: [] } as unknown as ConciergeBudget));
        component.save();
        expect(service.create).toHaveBeenCalledWith({ vehicleId: 7, dateValidation: null, paymentTypeId: null, information: 'Teste', items: [], clientCompanyId: 2, salespersonUserId: 3 });
        expect(component.editing()?.id).toBe(15);
        expect(component.editId).toBe(15);
        expect(component.form.controls.vehicleId.disabled).toBeTrue();
        expect(component.form.pristine).toBeTrue();
        expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { id: 15 }, replaceUrl: true }));
        service.update.and.returnValue(of(component.editing()!));
        component.form.controls.information.setValue('Alterado');
        component.save();
        expect(service.create).toHaveBeenCalledTimes(1);
        expect(service.update).toHaveBeenCalledWith(15, jasmine.objectContaining({ information: 'Alterado' }));
    });
    it('calculates item and service totals and sends both types with the budget', () => {
        component.form.patchValue({ vehicleId: 7 });
        component.selectVehicle(7);
        component.addItem(0);
        component.items.at(0).patchValue({ description: ' Peca ', quantity: 2, price: 10.125, discount: 0.25 });
        component.addItem(1);
        component.items.at(1).patchValue({ description: 'Reparo', quantity: 2, hourService: 1.5, price: 100, discount: 10 });
        expect(component.lineTotal(0)).toBe(20);
        expect(component.lineTotal(1)).toBe(140);
        expect(component.total).toBe(160);
        service.create.and.returnValue(of({ id: 15, vehicleId: 7, status: 'OpenBudget', clientCompanyId: 2, salespersonUserId: 3, salespersonUserName: 'Vendedor', information: 'Teste', items: [] } as unknown as ConciergeBudget));
        component.save();
        const payload = service.create.calls.mostRecent().args[0];
        expect(payload.items[0]).toEqual({ type: 0, description: 'Peca', quantity: 2, hourService: null, price: 10.125, discount: 0.25 });
        expect(payload.items[1].hourService).toBe(1.5);
        expect(payload.items[1].quantity).toBe(1);
    });
    it('rounds fractional line values consistently to three decimal places', () => {
        component.addItem(0);
        component.items.at(0).patchValue({ description: 'Fracionado', quantity: 0.5, price: 0.009 });
        expect(component.lineTotal(0)).toBe(0.005);
        component.items.at(0).patchValue({ discount: 0.005 });
        expect(component.items.valid).toBeTrue();
        expect(component.lineTotal(0)).toBe(0);
    });
    it('blocks invalid discounts and missing service hours and permits removing a line', () => {
        component.form.patchValue({ vehicleId: 7 });
        component.selectVehicle(7);
        component.addItem(1);
        component.items.at(0).patchValue({ description: 'Reparo', price: 50, hourService: null });
        component.save();
        expect(service.create).not.toHaveBeenCalled();
        component.items.at(0).patchValue({ hourService: 1, discount: 51 });
        component.save();
        expect(service.create).not.toHaveBeenCalled();
        component.removeItem(0);
        component.addItem(0);
        component.items.at(0).patchValue({ description: 'Peca', price: 50, discount: 0, quantity: 0 });
        component.save();
        expect(service.create).not.toHaveBeenCalled();
        component.removeItem(0);
        expect(component.items.length).toBe(0);
        expect(component.total).toBe(0);
    });
    it('allows saving without payment when the optional payment lookup fails', () => {
        spyOn(TestBed.inject(TypePaymentService), 'listAllEnabled').and.returnValue(throwError(() => new Error('Forbidden')));
        component.loadOptions();
        expect(component.loadError()).toBe('');
        expect(component.paymentWarning()).toBeTruthy();
        expect(component.vehicles().length).toBe(1);
        component.form.patchValue({ vehicleId: 7 });
        component.selectVehicle(7);
        service.create.and.returnValue(of({ id: 15, vehicleId: 7, status: 'OpenBudget', clientCompanyId: 2, salespersonUserId: 3, salespersonUserName: 'Vendedor', information: 'Teste', items: [] } as unknown as ConciergeBudget));
        component.save();
        expect(service.create).toHaveBeenCalled();
        expect(service.create.calls.mostRecent().args[0].paymentTypeId).toBeNull();
    });
    it('keeps the client mandatory', () => {
        component.vehicles.set(component.vehicles().map((item) => ({ ...item, clientCompanyId: null })));
        component.form.controls.vehicleId.setValue(7);
        component.selectVehicle(7);
        component.save();
        expect(service.create).not.toHaveBeenCalled();
        expect(component.error()).toContain('cliente');
    });
    it('keeps entered data and releases saving state after failure', () => {
        component.form.patchValue({ vehicleId: 7, information: 'Manter' });
        component.selectVehicle(7);
        service.create.and.returnValue(throwError(() => new Error('Offline')));
        component.save();
        expect(component.form.controls.information.value).toBe('Manter');
        expect(component.form.enabled).toBeTrue();
        expect(component.saving()).toBeFalse();
        expect(component.error()).toBeTruthy();
        expect(router.navigate).not.toHaveBeenCalled();
    });
});

describe('Editing concierge budgets', () => {
    function setup(status = 'OpenBudget', canEdit = true) {
        const service = jasmine.createSpyObj<ConciergeBudgetService>('ConciergeBudgetService', ['detail', 'update', 'create', 'cancel', 'complete']);
        const budget = {
            id: 15,
            status,
            canEdit,
            vehicleId: 7,
            clientCompanyId: 2,
            clientCompanyName: 'Cliente',
            salespersonUserId: 3,
            salespersonUserName: 'Vendedor',
            dateValidation: null,
            paymentTypeId: null,
            information: 'Original',
            items: [{ type: 0 as const, description: 'Peca', quantity: 2, hourService: null, price: 20, discount: 1 }]
        } as ConciergeBudget;
        service.detail.and.returnValue(of(budget));
        service.update.and.returnValue(of(budget));
        const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
        router.navigate.and.returnValue(Promise.resolve(true));
        TestBed.configureTestingModule({
            providers: [
                ConciergeBudgetMaintenanceComponent,
                { provide: ConciergeBudgetService, useValue: service },
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ id: 15 }) } } },
                { provide: VehicleEntryService, useValue: { listAllPlates: () => of([]) } },
                { provide: TypePaymentService, useValue: { listAllEnabled: () => of([]) } }
            ]
        });
        const component = TestBed.inject(ConciergeBudgetMaintenanceComponent);
        component.loadOptions();
        return { component, service, router };
    }
    it('keeps budgets from other sellers read only when the API denies editing', () => {
        const { component, service } = setup('OpenBudget', false);
        expect(component.readOnly).toBeTrue();
        expect(component.form.disabled).toBeTrue();
        component.save();
        expect(service.update).not.toHaveBeenCalled();
        expect(service.create).not.toHaveBeenCalled();
    });
    it('refreshes status and lines from the API on the same page', () => {
        const { component, service, router } = setup();
        const refreshed = { ...component.editing()!, status: 'Approved', information: 'Atualizado' };
        service.detail.and.returnValue(of(refreshed));
        component.refreshBudget();
        expect(service.detail).toHaveBeenCalledWith(15);
        expect(component.editing()).toEqual(refreshed);
        expect(component.form.controls.information.value).toBe('Atualizado');
        expect(component.form.pristine).toBeTrue();
        expect(component.loading()).toBeFalse();
        expect(router.navigate).not.toHaveBeenCalled();
    });
    it('asks before discarding changes and preserves them if refresh fails', () => {
        const { component, service } = setup();
        component.form.controls.information.setValue('Alterado');
        component.form.markAsDirty();
        service.detail.calls.reset();
        component.refreshBudget();
        expect(component.refreshConfirmation()).toBeTrue();
        expect(service.detail).not.toHaveBeenCalled();
        service.detail.and.returnValue(throwError(() => new Error('Offline')));
        component.refreshBudget(true);
        expect(component.form.controls.information.value).toBe('Alterado');
        expect(component.form.dirty).toBeTrue();
        expect(component.form.enabled).toBeTrue();
        expect(component.loading()).toBeFalse();
        expect(component.error()).toBeTruthy();
    });
    it('loads saved lines and updates the existing budget without creating another', () => {
        const { component, service, router } = setup();
        expect(component.total).toBe(39);
        expect(component.form.controls.vehicleId.disabled).toBeTrue();
        component.items.at(0).controls.price.setValue(25);
        component.save();
        expect(service.update).toHaveBeenCalledWith(15, jasmine.objectContaining({ vehicleId: 7, information: 'Original', items: [jasmine.objectContaining({ price: 25 })] }));
        expect(service.create).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
        expect(component.success()).toContain('atualizado');
        expect(component.saving()).toBeFalse();
        expect(component.form.pristine).toBeTrue();
    });
    it('keeps completed and cancelled budgets read-only', () => {
        const { component, service } = setup('CancelledBudget');
        expect(component.form.disabled).toBeTrue();
        component.addItem(0);
        component.save();
        expect(component.items.length).toBe(1);
        expect(service.update).not.toHaveBeenCalled();
        expect(service.create).not.toHaveBeenCalled();
    });

    it('allows editing approved budgets and updates their status after saving', () => {
        const { component, service } = setup('Approved');
        expect(component.readOnly).toBeFalse();
        expect(component.form.controls.information.enabled).toBeTrue();
        service.update.and.returnValue(of({ ...component.editing()!, status: 'OpenBudget', dateAuthorization: null }));
        component.save();
        expect(service.update).toHaveBeenCalled();
        expect(component.editing()?.status).toBe('OpenBudget');
    });
    it('reflects PDF removal from an approved budget without discarding unsaved fields', () => {
        const { component } = setup('Approved');
        component.form.controls.information.setValue('Manter');
        component.documentChanged();
        expect(component.editing()?.status).toBe('OpenBudget');
        expect(component.editing()?.dateAuthorization).toBeNull();
        expect(component.form.controls.information.value).toBe('Manter');
    });

    it('cancels from maintenance only after a valid justification and stays on this page', () => {
        const { component, service, router } = setup('Approved');
        const original = component.editing()!;
        component.openCancellation();
        component.cancellationReason.setValue('  ');
        component.confirmCancellation();
        expect(service.cancel).not.toHaveBeenCalled();
        component.cancellationReason.setValue(' Cliente desistiu ');
        service.cancel.and.returnValue(throwError(() => new Error('Offline')));
        component.confirmCancellation();
        expect(component.cancelling()).toBeTruthy();
        expect(component.cancellationReason.value).toBe(' Cliente desistiu ');
        expect(component.saving()).toBeFalse();
        service.cancel.and.returnValue(of({ ...original, status: 'CancelledBudget', cancellationReason: 'Cliente desistiu' }));
        component.confirmCancellation();
        expect(service.cancel).toHaveBeenCalledWith(15, 'Cliente desistiu');
        expect(component.form.disabled).toBeTrue();
        expect(component.editing()?.status).toBe('CancelledBudget');
        expect(component.cancelling()).toBeNull();
        expect(router.navigate).not.toHaveBeenCalled();
    });
    it('concludes an unchanged approved budget without resaving its approval', () => {
        const { component, service, router } = setup('Approved');
        spyOn(window, 'confirm').and.returnValue(true);
        service.complete.and.returnValue(of({ ...component.editing()!, status: 'CompleteBudget' }));
        component.complete();
        expect(service.update).not.toHaveBeenCalled();
        expect(service.complete).toHaveBeenCalledWith(15);
        expect(component.form.disabled).toBeTrue();
        expect(router.navigate).not.toHaveBeenCalled();
    });
    it('blocks completion until the budget is approved', () => {
        const { component, service } = setup();
        expect(component.canComplete).toBeFalse();
        component.complete();
        expect(service.complete).not.toHaveBeenCalled();
        expect(component.error()).toContain('aprovado');
    });
    it('blocks completion when approved data has unsaved edits', () => {
        const { component, service } = setup('Approved');
        expect(component.canComplete).toBeTrue();
        component.form.controls.information.setValue('Alterado');
        component.form.markAsDirty();
        expect(component.canComplete).toBeFalse();
        component.complete();
        expect(service.complete).not.toHaveBeenCalled();
        expect(service.update).not.toHaveBeenCalled();
        expect(component.error()).toContain('nova');
    });
});
