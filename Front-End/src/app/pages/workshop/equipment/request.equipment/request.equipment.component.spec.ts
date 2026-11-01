import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import RequestEquipmentComponent from './request.equipment.component';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { MechanicService } from '@/app/services/workshop/mechanic.service';
import { MechanicDepartmentService } from '@/app/services/workshop/mechanic.department.service';
import { ToolControlCategoryService } from '@/app/services/workshop/tool.control/tool.control.category.service';
import { ToolControlMaterialService } from '@/app/services/workshop/tool.control/tool.control.material.service';
import { ToolControlMatMecService } from '@/app/services/workshop/tool.control/tool.control.matmec.service';
import { ToolControlRequestService } from '@/app/services/workshop/tool.control/tool.control.request.service';
import { ToolcontrolReportService } from '@/app/services/workshop/tool.control/tool.control.report.service';
import { Mechanic } from '@/app/models/workshop/mechanic';
import { ToolControlRequest } from '@/app/models/workshop/tool.control/tool.control.request';
import { ToolControlMaterial } from '@/app/models/workshop/tool.control/tool.control.material';
import { IToolControlMaterialMec } from '@/app/interfaces/workshop/i.tool.control.material.mec';
import { TypeCategoryEnum } from '@/app/models/workshop/type.category.enum';

describe('Equipment requests', () => {
    let component: RequestEquipmentComponent;
    let requests: jasmine.SpyObj<ToolControlRequestService>;
    let materials: jasmine.SpyObj<ToolControlMatMecService>;
    beforeEach(() => {
        requests = jasmine.createSpyObj('requests', ['newRequest', 'filterMechanicId']);
        requests.filterMechanicId.and.returnValue(of([]));
        materials = jasmine.createSpyObj('materials', ['returnMaterial', 'saveMaterial']);
        TestBed.configureTestingModule({
            providers: [
                RequestEquipmentComponent,
                MessageService,
                ConfirmationService,
                { provide: LoadingService, useValue: { show: () => {}, hide: () => {} } },
                { provide: StorageService, useValue: {} },
                { provide: MechanicService, useValue: {} },
                { provide: MechanicDepartmentService, useValue: {} },
                { provide: ToolControlCategoryService, useValue: {} },
                { provide: ToolControlMaterialService, useValue: {} },
                { provide: ToolControlMatMecService, useValue: materials },
                { provide: ToolControlRequestService, useValue: requests },
                { provide: ToolcontrolReportService, useValue: {} }
            ]
        });
        component = TestBed.inject(RequestEquipmentComponent);
    });
    it('blocks submission of an incomplete request or delivery', async () => {
        await component.newRequest();
        await component.confirmDeliveryMaterial();
        expect(requests.newRequest).not.toHaveBeenCalled();
        expect(materials.saveMaterial).not.toHaveBeenCalled();
        expect(component.formRequest.touched).toBeTrue();
    });
    it('clears the previous mechanic request and ignores stale responses', async () => {
        const stale = new Subject<ToolControlRequest[]>();
        requests.filterMechanicId.and.callFake((id) => (id === 1 ? stale : of([])));
        component.formPegar.controls.mechanic.setValue(Object.assign(new Mechanic(), { id: 1 }));
        component.formPegar.controls.request.setValue(new ToolControlRequest());
        const pending = component.selectMechanic();
        component.formPegar.controls.mechanic.setValue(Object.assign(new Mechanic(), { id: 2 }));
        await component.selectMechanic();
        stale.next([new ToolControlRequest()]);
        stale.complete();
        await pending;
        expect(component.listRequest()).toEqual([]);
        expect(component.formPegar.controls.request.value).toBeNull();
        expect(component.tempMaterialSelected).toEqual([]);
    });
    it('blocks mixed-mechanic returns instead of silently processing only one person', async () => {
        component.selectedMaterials = [{ mechanicId: 1 }, { mechanicId: 2 }] as IToolControlMaterialMec[];
        await component.returnMaterial();
        expect(component.visibleDialogDev).toBeFalse();
        expect(materials.returnMaterial).not.toHaveBeenCalled();
    });
    it('requires all EPI return reasons before requesting confirmation', async () => {
        component.listReturnMaterial.set([{ categoryType: TypeCategoryEnum.EPI, returnInformation: '  ' }] as IToolControlMaterialMec[]);
        const confirm = spyOn(component, 'confirmCodePassMechanic');
        await component.confirmReturnMaterial();
        expect(confirm).not.toHaveBeenCalled();
        expect(component.saving()).toBeFalse();
    });
    it('rejects a password with a numeric prefix and extra characters', () => {
        component.currentCodePassExpected = 123;
        component.formCodePass.controls.maskedPassword.setValue('123abc');
        const dialog = { onAccept: jasmine.createSpy('accept') };
        component.onConfirmCodePassMechanic(dialog as never);
        expect(dialog.onAccept).not.toHaveBeenCalled();
        component.formCodePass.controls.maskedPassword.setValue('123');
        component.onConfirmCodePassMechanic(dialog as never);
        expect(dialog.onAccept).toHaveBeenCalled();
    });
    it('restores the same material object after an invalid quantity edit', () => {
        const item = Object.assign(new ToolControlMaterial(), { id: 7, quantityLoan: 1, quantityAvailableLoan: 2 });
        component.tempMaterialSelected = [item];
        component.onRowEditInit(item);
        item.quantityLoan = 3;
        component.onRowEditSave(item, 0);
        expect(item.quantityLoan).toBe(1);
        expect(component.tempMaterialSelected[0]).toBe(item);
    });
    it('handles missing mechanics in historical requests', () => {
        expect(component.getMechanicName(99)).toBeTruthy();
    });
});
