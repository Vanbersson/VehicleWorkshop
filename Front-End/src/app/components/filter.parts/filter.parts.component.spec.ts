import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { FilterPartsComponent } from './filter.parts.component';
import { IPartFilter } from '@/app/interfaces/i.part.filter';
import { PartService } from '@/app/services/parts/part.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';

describe('Parts filter', () => {
    let component: FilterPartsComponent;
    let service: jasmine.SpyObj<PartService>;
    let part: IPartFilter;
    const ok = (data: unknown) => new HttpResponse({ body: { status: StatusSuccessError.succes, header: '', message: '', data } });
    beforeEach(() => {
        part = { companyId: 1, resaleId: 2, id: 7, code: 'ABC', description: 'Part', available: 5, price: 10, selectPrice: 10, selectQuantity: 1, selectDiscount: 0 };
        service = jasmine.createSpyObj('Parts', ['filterCode', 'filterDesc']);
        service.filterCode.and.returnValue(of(ok([part])) as never);
        TestBed.configureTestingModule({ providers: [FilterPartsComponent, { provide: PartService, useValue: service }, { provide: MessageService, useValue: { add() {} } }, { provide: LoadingService, useValue: { show() {}, hide() {} } }] });
        component = TestBed.inject(FilterPartsComponent);
    });
    it('keeps existing selections isolated from the parent while editing', async () => {
        component.inputParts.set([part]);
        await component.showDialogParts();
        component.deleteSelectPart = component.listPartsSelected()[0];
        component.disabledButtonDelete = false;
        component.editSelectPart();
        component.formSelectPart.setValue({ price: 20, quantity: 2, discount: 1 });
        component.confirmSelectPart();
        expect(component.listPartsSelected()[0].selectPrice).toBe(20);
        expect(component.totalParts()).toBe(39);
        expect(component.totalPartsDiscount()).toBe(1);
        expect(part.selectPrice).toBe(10);
    });
    it('keeps an existing part when optional metadata is not returned', async () => {
        component.inputParts.set([part]);
        service.filterCode.and.returnValue(of(ok([])) as never);
        await component.showDialogParts();
        expect(component.listPartsSelected()).toEqual([part]);
        expect(component.preparing()).toBeFalse();
    });
    it('selects values and prevents duplicate selected items', () => {
        component.selectedPart = part;
        component.disabledButtonSelected = false;
        component.selectPartsConfirme();
        component.formSelectPart.setValue({ price: 12, quantity: 2, discount: 3 });
        component.confirmSelectPart();
        expect(component.totalParts()).toBe(21);
        expect(component.listPartsSelected().length).toBe(1);
        component.selectedPart = part;
        component.disabledButtonSelected = false;
        component.selectPartsConfirme();
        expect(component.visibleSelected).toBeFalse();
    });
    it('reports invalid values without adding a part', () => {
        component.selectedPart = part;
        component.disabledButtonSelected = false;
        component.selectPartsConfirme();
        component.formSelectPart.setValue({ price: 10, quantity: 1, discount: 11 });
        component.confirmSelectPart();
        expect(component.selectionError()).toBeTruthy();
        expect(component.visibleSelected).toBeTrue();
        expect(component.listPartsSelected()).toEqual([]);
    });
    it('shows search failures and supports retry with trimmed code priority', async () => {
        component.formFilterParts.setValue({ filterCode: ' ABC ', filterDesc: 'Part' });
        service.filterCode.and.returnValue(throwError(() => new Error('offline')));
        await component.filterPart();
        expect(component.searchError()).toBeTruthy();
        expect(component.loading()).toBeFalse();
        service.filterCode.and.returnValue(of(ok([part])) as never);
        await component.filterPart();
        expect(service.filterCode).toHaveBeenCalledWith('ABC');
        expect(service.filterDesc).not.toHaveBeenCalled();
        expect(component.listParts()).toEqual([part]);
        expect(component.searchError()).toBe('');
    });
    it('does not restore search results cleared while a request was pending', async () => {
        const response = new Subject<ReturnType<typeof ok>>();
        service.filterCode.and.returnValue(response as never);
        component.formFilterParts.controls.filterCode.setValue('ABC');
        const pending = component.filterPart();
        component.clearFormFilter();
        response.next(ok([part]));
        response.complete();
        await pending;
        expect(component.listParts()).toEqual([]);
        expect(component.searched()).toBeFalse();
    });
    it('applies the selected parts only after loading finishes', () => {
        const emit = spyOn(component.outputPart, 'emit');
        component.listPartsSelected.set([part]);
        component.visiblePart = true;
        component.loading.set(true);
        component.hideDialogParts();
        expect(emit).not.toHaveBeenCalled();
        component.loading.set(false);
        component.hideDialogParts();
        expect(emit).toHaveBeenCalledWith([part]);
        expect(component.visiblePart).toBeFalse();
    });
});
