import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import MaterialComponent from './material.component';
import { ToolControlMaterialService } from '@/app/services/workshop/tool.control/tool.control.material.service';
import { ToolControlCategoryService } from '@/app/services/workshop/tool.control/tool.control.category.service';
import { ToolControlMaterial } from '@/app/models/workshop/tool.control/tool.control.material';
import { ToolControlCategory } from '@/app/models/workshop/tool.control/tool.control.category';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

describe('Material registration', () => {
    let component: MaterialComponent;
    let api: jasmine.SpyObj<ToolControlMaterialService>;
    let material: ToolControlMaterial;
    const category = Object.assign(new ToolControlCategory(), { id: 4, description: 'Tools' });
    const response = (data: unknown) => new HttpResponse({ body: Object.assign(new MessageResponse(), { status: StatusSuccessError.succes, data }) });
    beforeEach(() => {
        material = Object.assign(new ToolControlMaterial(), { id: 7, companyId: 1, resaleId: 2, description: 'Tool', categoryId: 4, photoUrl: 'original.jpg', quantityAccountingLoan: 10, quantityAvailableLoan: 8 });
        api = jasmine.createSpyObj('api', ['save', 'update', 'filterId', 'listAll', 'saveImage', 'deleteImage']);
        api.filterId.and.returnValue(of(response({ ...material })));
        api.listAll.and.returnValue(of([material]));
        api.update.and.callFake((value) => of(response({ ...value })));
        api.save.and.callFake((value) => of(response({ ...value, id: 9 })));
        TestBed.configureTestingModule({
            providers: [
                MaterialComponent,
                MessageService,
                ConfirmationService,
                { provide: ToolControlMaterialService, useValue: api },
                { provide: ToolControlCategoryService, useValue: { listAllEnabled: () => of([category]) } },
                { provide: StorageService, useValue: { companyId: 1, resaleId: 2 } },
                { provide: LoadingService, useValue: { show: () => {}, hide: () => {} } },
                { provide: PermissionUserService, useValue: {} },
                { provide: PhotoService, useValue: {} }
            ]
        });
        component = TestBed.inject(MaterialComponent);
        component.listCat.set([category]);
    });
    it('resets create mode and pending photo actions before editing another material', async () => {
        component.showNewMaterial();
        component.isNewphoto = true;
        component.isDeletePhoto = true;
        await component.editMat(7);
        await component.save();
        expect(api.save).not.toHaveBeenCalled();
        expect(api.update).toHaveBeenCalled();
        expect(api.saveImage).not.toHaveBeenCalled();
        expect(api.deleteImage).not.toHaveBeenCalled();
        expect(api.update.calls.first().args[0].photoUrl).toBe('original.jpg');
    });
    it('preserves disabled quantity values when saving metadata', async () => {
        await component.editMat(7);
        component.formMat.controls.description.setValue('Updated');
        await component.save();
        expect(api.update.calls.first().args[0].quantityAccountingLoan).toBe(10);
        expect(api.update.calls.first().args[0].quantityAvailableLoan).toBe(8);
    });
    it('keeps the existing photo and allows retry after upload failure', async () => {
        await component.editMat(7);
        component.isNewphoto = true;
        component.photoMat.set('data:image/jpeg;base64,YQ==');
        api.saveImage.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        expect(component.material.photoUrl).toBe('original.jpg');
        expect(component.isNewphoto).toBeTrue();
        expect(component.saving()).toBeFalse();
    });
    it('does not recreate a material when its photo upload fails after creation', async () => {
        component.showNewMaterial();
        component.formMat.patchValue({ description: 'New', categories: category });
        component.isNewphoto = true;
        component.photoMat.set('data:image/jpeg;base64,YQ==');
        api.saveImage.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        await component.save();
        expect(api.save.calls.count()).toBe(1);
        expect(component.material.id).toBe(9);
        expect(component.isNewMaterial).toBeFalse();
    });
    it('awaits photo deletion and retains retry state on failure', async () => {
        await component.editMat(7);
        component.deleteFile();
        api.deleteImage.and.returnValue(throwError(() => new Error('offline')));
        await component.save();
        expect(api.deleteImage).toHaveBeenCalled();
        expect(component.isDeletePhoto).toBeTrue();
        expect(component.saving()).toBeFalse();
    });
    it('blocks blank descriptions and repeated saves while one is pending', async () => {
        await component.editMat(7);
        component.formMat.controls.description.setValue('   ');
        await component.save();
        expect(api.update).not.toHaveBeenCalled();
        component.formMat.controls.description.setValue('Valid');
        const pending = new Subject<HttpResponse<MessageResponse>>();
        api.update.and.returnValue(pending);
        const save = component.save();
        await component.save();
        expect(api.update.calls.count()).toBe(1);
        pending.next(response(material));
        pending.complete();
        await save;
        expect(component.saving()).toBeFalse();
    });
});
