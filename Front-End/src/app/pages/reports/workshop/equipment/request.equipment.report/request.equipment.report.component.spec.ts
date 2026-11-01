import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import RequestEquipmentReportComponent, { csvCell } from './request.equipment.report.component';
import { ToolControlRequestService } from '@/app/services/workshop/tool.control/tool.control.request.service';
import { ToolControlMatMecService } from '@/app/services/workshop/tool.control/tool.control.matmec.service';
import { MechanicService } from '@/app/services/workshop/mechanic.service';
import { ToolControlRequest } from '@/app/models/workshop/tool.control/tool.control.request';
import { StatusTollControlRequestEnum as Status } from '@/app/models/workshop/status.tool.control.request.enum';

describe('Equipment request report', () => {
    let component: RequestEquipmentReportComponent;
    let list: jasmine.Spy;
    beforeEach(() => {
        list = jasmine.createSpy('listRequestStatus').and.returnValue(of([]));
        TestBed.configureTestingModule({
            providers: [
                { provide: ToolControlRequestService, useValue: { listRequestStatus: list } },
                { provide: ToolControlMatMecService, useValue: {} },
                { provide: MechanicService, useValue: { listAll: () => of([]) } }
            ]
        });
        component = TestBed.runInInjectionContext(() => new RequestEquipmentReportComponent());
    });
    it('rejects reversed date ranges before requesting data', async () => {
        component.form.patchValue({ start: new Date(2026, 10, 2), end: new Date(2026, 10, 1) });
        await component.consult();
        expect(list).not.toHaveBeenCalled();
        expect(component.error()).toBeTruthy();
    });
    it('includes historical returned requests for the selected mechanic and the entire final day', async () => {
        const returned = Object.assign(new ToolControlRequest(), { id: 7, mechanicId: 2, status: Status.RETURNED, requestDate: '2026-11-01T23:59:59' });
        const other = Object.assign(new ToolControlRequest(), { id: 8, mechanicId: 3, status: Status.RETURNED, requestDate: returned.requestDate });
        list.and.callFake((status: Status) => of(status === Status.RETURNED ? [returned, other] : []));
        component.form.patchValue({ mechanicId: 2, start: new Date(2026, 10, 1), end: new Date(2026, 10, 1) });
        await component.consult();
        expect(component.visibleRows().map((row) => row.id)).toEqual([7]);
        expect(component.summary().returned).toBe(1);
        expect(list).toHaveBeenCalledWith(Status.RETURNED);
    });
    it('reports a failed query rather than a successful empty report', async () => {
        list.and.returnValue(throwError(() => new Error('offline')));
        await component.consult();
        expect(component.error()).toBeTruthy();
        expect(component.loading()).toBeFalse();
        expect(component.rows()).toEqual([]);
    });
    it('applies an accent-insensitive search to the summary and export dataset', () => {
        component.rows.set([Object.assign(new ToolControlRequest(), { id: 1, mechanicName: 'João' }), Object.assign(new ToolControlRequest(), { id: 2, mechanicName: 'Pedro' })]);
        component.search.set('JOAO');
        expect(component.visibleRows().map((row) => row.id)).toEqual([1]);
        expect(component.summary().total).toBe(1);
    });
    it('quotes CSV cells and neutralizes spreadsheet formulas', () => {
        expect(csvCell('Texto; "teste"')).toBe('"Texto; ""teste"""');
        expect(csvCell('=1+1')).toBe('"\'=1+1"');
    });
});
