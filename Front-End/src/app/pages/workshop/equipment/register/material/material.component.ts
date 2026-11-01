import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputMaskModule } from 'primeng/inputmask';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { ToolControlCategory } from '@/app/models/workshop/tool.control/tool.control.category';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { ToolControlCategoryService } from '@/app/services/workshop/tool.control/tool.control.category.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { ToolControlMaterial } from '@/app/models/workshop/tool.control/tool.control.material';
import { ToolControlMaterialService } from '@/app/services/workshop/tool.control/tool.control.material.service';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { environment } from '@/environments/environment';
import { TypeMaterialEnum } from '@/app/models/workshop/type.material.enum';

@Component({
    selector: 'app-material',
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        InputNumberModule,
        DialogModule,
        ToastModule,
        InputMaskModule,
        RadioButtonModule,
        SelectModule,
        ConfirmDialogModule,
        ReactiveFormsModule,
        FormsModule,
        InputGroupModule,
        InputIconModule,
        ButtonModule,
        TableModule,
        IconFieldModule
    ],
    templateUrl: './material.component.html',
    styleUrl: './material.component.scss',
    providers: [ConfirmationService, MessageService]
})
export default class MaterialComponent implements OnInit {
    readonly loading = signal(false);
    readonly saving = signal(false);
    readonly loadError = signal('');
    search = '';
    statusFilter: StatusEnabDisabEnum | null = null;
    categoryFilter: number | null = null;
    material!: ToolControlMaterial;
    isNewMaterial: boolean = false;
    visibleDialog = false;
    enabled = StatusEnabDisabEnum.ENABLED;
    disabled = StatusEnabDisabEnum.DISABLED;
    listMat = signal<ToolControlMaterial[]>([]);
    listCat = signal<ToolControlCategory[]>([]);
    photoMat = signal<string>('');
    isNewphoto: boolean = false;
    isDeletePhoto: boolean = false;
    //Dialog
    editQuantityLoan = false;
    editQuantityKit = false;

    LOAN = TypeMaterialEnum.LOAN;
    KIT = TypeMaterialEnum.KIT;
    BOTH = TypeMaterialEnum.BOTH;

    formMat = new FormGroup({
        status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
        type: new FormControl<TypeMaterialEnum>(TypeMaterialEnum.LOAN, Validators.required),
        numberCA: new FormControl<number | null>(null, Validators.min(0)),
        description: new FormControl<string>('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(255)]),
        quantityAccountingLoan: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        quantityAvailableLoan: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        quantityAccountingKit: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        quantityAvailableKit: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
        validityDay: new FormControl<number | null>(null),
        categories: new FormControl<ToolControlCategory | null>(null, Validators.required)
    });

    constructor(
        private permissionUserService: PermissionUserService,
        private loadingService: LoadingService,
        private materialService: ToolControlMaterialService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private storageService: StorageService,
        private categoryService: ToolControlCategoryService,
        private photoService: PhotoService
    ) {}

    ngOnInit(): void {
        this.init();
        this.disableQuantityAccountingLoan();
        this.disableQuantityAvailableLoan();
        this.disableQuantityAccountingKit();
        this.disableQuantityAvailableKit();
    }

    async init() {
        if (this.loading()) return;
        this.loading.set(true);
        this.loadError.set('');
        try {
            const [materials, categories] = await Promise.all([lastValueFrom(this.materialService.listAll()), lastValueFrom(this.categoryService.listAllEnabled())]);
            this.listMat.set(materials);
            this.listCat.set(categories);
        } catch {
            this.loadError.set('Não foi possível atualizar os materiais. Tente novamente.');
        } finally {
            this.loading.set(false);
        }
    }

    showNewMaterial() {
        if (this.saving()) return;
        this.cleanForm();
        this.isNewMaterial = true;
        this.material = new ToolControlMaterial();
        this.disableQuantityAccountingLoan();
        this.disableQuantityAvailableLoan();
        this.editQuantityLoan = false;
        this.disableQuantityAccountingKit();
        this.disableQuantityAvailableKit();
        this.editQuantityKit = false;
        this.showDialog();
    }
    private showDialog() {
        this.visibleDialog = true;
    }
    hideDialog() {
        if (this.saving()) return;
        this.visibleDialog = false;
    }

    async save(): Promise<void> {
        if (this.saving()) return;
        this.formMat.markAllAsTouched();
        const value = this.formMat.getRawValue();
        const quantities = [value.quantityAccountingLoan, value.quantityAvailableLoan, value.quantityAccountingKit, value.quantityAvailableKit];
        if (this.formMat.invalid || quantities.some((q) => q == null || !Number.isFinite(q) || q < 0)) {
            this.messageService.add({ severity: 'warn', summary: 'Material', detail: 'Revise os campos obrigatórios e as quantidades.' });
            return;
        }
        this.saving.set(true);
        this.loadingService.show();
        try {
            const candidate: ToolControlMaterial = {
                ...this.material,
                companyId: this.storageService.companyId,
                resaleId: this.storageService.resaleId,
                status: value.status!,
                type: value.type!,
                description: value.description!.trim(),
                categoryId: value.categories!.id,
                numberCA: value.numberCA,
                validityDay: value.validityDay,
                quantityAccountingLoan: value.quantityAccountingLoan!,
                quantityAvailableLoan: value.quantityAvailableLoan!,
                quantityAccountingKit: value.quantityAccountingKit!,
                quantityAvailableKit: value.quantityAvailableKit!
            };
            const response = await lastValueFrom(this.isNewMaterial ? this.materialService.save(candidate) : this.materialService.update(candidate));
            this.applySaved(response);
            this.isNewMaterial = false;
            if (this.isNewphoto) {
                const url = await this.savePhoto(this.material.id!, this.photoMat());
                this.applySaved(await lastValueFrom(this.materialService.update({ ...this.material, photoUrl: url })));
                this.isNewphoto = false;
                this.photoMat.set(url);
            } else if (this.isDeletePhoto) {
                this.applySaved(await lastValueFrom(this.materialService.update({ ...this.material, photoUrl: '' })));
                const data = new FormData();
                data.append('local', this.photoPath(this.material.id!));
                const deleted = await lastValueFrom(this.materialService.deleteImage(data));
                if (deleted.body?.status !== StatusSuccessError.succes) throw new Error(deleted.body?.message || 'Falha ao excluir a foto.');
                this.isDeletePhoto = false;
            }
            this.messageService.add({ severity: 'success', summary: 'Material', detail: 'Salvo com sucesso.' });
            await this.init();
        } catch (error: unknown) {
            const err = error as { error?: { message?: string }; message?: string };
            this.messageService.add({ severity: 'error', summary: 'Material', detail: err?.error?.message || err?.message || 'Não foi possível salvar o material.' });
        } finally {
            this.disableQuantityAccountingLoan();
            this.disableQuantityAvailableLoan();
            this.disableQuantityAccountingKit();
            this.disableQuantityAvailableKit();
            this.editQuantityLoan = false;
            this.editQuantityKit = false;
            this.saving.set(false);
            this.loadingService.hide();
        }
    }
    private applySaved(response: HttpResponse<MessageResponse>): void {
        if (response.body?.status !== StatusSuccessError.succes || !response.body.data?.id) throw new Error(response.body?.message || 'Resposta inválida ao salvar o material.');
        this.material = { ...response.body.data };
        this.formMat.patchValue({
            quantityAccountingLoan: this.material.quantityAccountingLoan,
            quantityAvailableLoan: this.material.quantityAvailableLoan,
            quantityAccountingKit: this.material.quantityAccountingKit,
            quantityAvailableKit: this.material.quantityAvailableKit
        });
        this.listMat.update((items) => (items.some((item) => item.id === this.material.id) ? items.map((item) => (item.id === this.material.id ? { ...this.material } : item)) : [...items, { ...this.material }]));
    }
    private photoPath(id: number): string {
        return this.storageService.companyId + '/' + this.storageService.resaleId + '/workshop/equipment/reg/material/' + id + '/image1.jpg';
    }

    filterCategoriesDesc(id: number): string {
        return this.listCat().find((c) => c.id === id)?.description ?? '';
    }

    private cleanForm() {
        this.formMat.reset({
            status: StatusEnabDisabEnum.ENABLED,
            description: '',
            categories: null,
            validityDay: null,
            quantityAccountingLoan: 0,
            quantityAvailableLoan: 0,
            quantityAccountingKit: 0,
            quantityAvailableKit: 0,
            type: TypeMaterialEnum.LOAN,
            numberCA: null
        });
        this.photoMat.set('');
        this.isNewphoto = false;
        this.isDeletePhoto = false;
        this.material = null!;
    }

    async onSelectFile() {
        const photo: IPhotoResult = await this.photoService.takePicture();
        if (photo.status == StatusPhotoResult.SUCCESS) {
            this.photoMat.set(photo.base64!);
            this.isNewphoto = true;
            this.isDeletePhoto = false;
        }
        if (photo.status == StatusPhotoResult.LIMIT) {
            this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
        }
        if (photo.status == StatusPhotoResult.ERROR) {
            // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
        }
    }
    deleteFile() {
        this.photoMat.set('');
        this.isNewphoto = false;
        this.isDeletePhoto = true;
    }
    enableQuantityAccountingLoan() {
        this.formMat.get('quantityAccountingLoan')?.enable();
    }
    disableQuantityAccountingLoan() {
        this.formMat.get('quantityAccountingLoan')?.disable();
    }
    enableQuantityAccountingKit() {
        this.formMat.get('quantityAccountingKit')?.enable();
    }
    disableQuantityAccountingKit() {
        this.formMat.get('quantityAccountingKit')?.disable();
    }
    enableQuantityAvailableLoan() {
        this.formMat.get('quantityAvailableLoan')?.enable();
    }
    disableQuantityAvailableLoan() {
        this.formMat.get('quantityAvailableLoan')?.disable();
    }
    enableQuantityAvailableKit() {
        this.formMat.get('quantityAvailableKit')?.enable();
    }
    disableQuantityAvailableKit() {
        this.formMat.get('quantityAvailableKit')?.disable();
    }

    async confirmEditQuant() {
        /* PERMISSION - 300 */
        /* PERMITIR ALTERAR A QUANTIDADE DE MATERIAIS */
        const permission = await this.searchPermission(300);
        if (!permission) {
            return;
        }

        this.confirmationService.confirm({
            header: 'Alterar Quantidade?',
            message: 'Por favor comfirme para alterar.',
            acceptLabel: 'Comfirmar',
            accept: () => {
                switch (this.formMat.get('type')?.value) {
                    case TypeMaterialEnum.LOAN:
                        if (this.editQuantityKit == false) {
                            this.enableQuantityAccountingLoan();
                            this.editQuantityLoan = true;
                        }
                        break;
                    case TypeMaterialEnum.KIT:
                        if (this.editQuantityLoan == false) {
                            this.enableQuantityAccountingKit();
                            this.editQuantityKit = true;
                        }
                        break;
                    default:
                        this.enableQuantityAccountingLoan();
                        this.editQuantityLoan = true;
                        this.enableQuantityAccountingKit();
                        this.editQuantityKit = true;
                        break;
                }
            },
            reject: () => {}
        });
    }
    async editMat(id: number) {
        if (this.saving()) return;
        this.loadingService.show();
        const resultFilter = await this.filterMaterial(id);
        this.loadingService.hide();
        if (resultFilter.status == 200 && resultFilter.body?.status == StatusSuccessError.succes) {
            this.cleanForm();
            this.isNewMaterial = false;
            this.material = { ...resultFilter.body.data };
            let category: ToolControlCategory = this.listCat().find((cat) => cat.id == this.material.categoryId)!;

            this.formMat.patchValue({
                description: this.material.description,
                status: this.material.status!,
                type: this.material.type,
                numberCA: this.material?.numberCA ?? null,
                categories: category,
                validityDay: this.material?.validityDay ?? null,
                quantityAccountingLoan: this.material.quantityAccountingLoan,
                quantityAvailableLoan: this.material.quantityAvailableLoan,
                quantityAccountingKit: this.material.quantityAccountingKit,
                quantityAvailableKit: this.material.quantityAvailableKit
            });

            this.photoMat.set(this.material.photoUrl);
            this.showDialog();
            this.disableQuantityAccountingLoan();
            this.disableQuantityAvailableLoan();
            this.editQuantityLoan = false;
            this.disableQuantityAccountingKit();
            this.disableQuantityAvailableKit();
            this.editQuantityKit = false;
        }
    }

    private async saveMat(mat: ToolControlMaterial): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.materialService.save(mat));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async updateMat(mat: ToolControlMaterial): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.materialService.update(mat));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return error;
        }
    }
    private async listAllCat(): Promise<ToolControlCategory[]> {
        try {
            return await lastValueFrom(this.categoryService.listAllEnabled());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return [];
        }
    }
    private async searchPermission(permission: number): Promise<boolean> {
        try {
            var result = await lastValueFrom(this.permissionUserService.filterPermission(this.storageService.companyId, this.storageService.resaleId, this.storageService.id, permission));
            if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
                return true;
            } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
                this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
            }
            return false;
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return false;
        }
    }

    private async listAllMaterial(): Promise<ToolControlMaterial[]> {
        try {
            return await lastValueFrom(this.materialService.listAll());
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return [];
        }
    }

    private async filterMaterial(id: number): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.materialService.filterId(id));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return error;
        }
    }

    private async savePhoto(id: number, img: string): Promise<string> {
        const { base64, mime } = this.cleanBase64(img);
        const data = new FormData();
        data.append('file', this.base64ToFile(base64, mime));
        data.append('local', this.photoPath(id));
        const response = await lastValueFrom(this.materialService.saveImage(data));
        const url = response.body?.data?.url;
        if (response.body?.status !== StatusSuccessError.succes || !url) throw new Error(response.body?.message || 'Falha ao enviar a foto. Os dados foram salvos; tente salvar novamente para reenviar a imagem.');
        return environment.apiuUrl + url;
    }
    private cleanBase64(base64: string): { base64: string; mime: string } {
        if (!base64.includes(',')) {
            return { base64, mime: 'image/jpeg' };
        }

        const [header, data] = base64.split(',');
        const mime = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';

        return { base64: data, mime };
    }
    private base64ToFile(base64: string, mime: string): File {
        const byteString = atob(base64);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new File([ia], 'image.jpg', { type: mime });
    }

    private async savePhotoMaterial(data: FormData): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.materialService.saveImage(data));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return error;
        }
    }

    private async deletePhotoMaterial(data: FormData): Promise<HttpResponse<MessageResponse>> {
        try {
            return await lastValueFrom(this.materialService.deleteImage(data));
        } catch (error: any) {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: error?.error?.message || error?.message || 'Falha na opera\u00e7\u00e3o.', icon: 'pi pi-times' });
            return error;
        }
    }
}
