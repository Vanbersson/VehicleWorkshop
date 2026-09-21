import { Component, DoCheck, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TabsModule } from 'primeng/tabs';
import { DividerModule } from 'primeng/divider';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

import { YesNotEnum } from '@/app/models/yes.not.enum';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { UnitMeasure } from '@/app/models/parts/unit.measure';
import { Brand } from '@/app/models/brand';
import { GroupPart } from '@/app/models/parts/group.part';
import { CategoryPart } from '@/app/models/parts/category.part';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { GroupPartService } from '@/app/services/parts/group.part';
import { CategoryPartService } from '@/app/services/parts/category.part.service';
import { BrandService } from '@/app/services/brand/brand.service';
import { UnitMeasureService } from '@/app/services/parts/unit.measure.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { AdditionDiscountEnum } from '@/app/models/parts/addition.discount.enum';
import { Part } from '@/app/models/parts/part';
import { IPartList } from '@/app/interfaces/i.part.list';
import { PartService } from '@/app/services/parts/part.service';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { FilterPartsApollo } from '@/app/components/filter.parts.apollo/filter.parts.apollo.component';
import { IPartApollo } from '@/app/interfaces/i.part.apollo';

interface IAdditionDiscount {
  discount: AdditionDiscountEnum;
}

@Component({
  selector: 'app-parts',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonModule, TabsModule, TableModule, RadioButtonModule, FilterPartsApollo,
    DividerModule, InputGroupModule, InputGroupAddonModule,
    ReactiveFormsModule, IconFieldModule, SelectModule, InputIconModule, InputNumberModule, DialogModule, ToastModule],
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss',
  providers: [MessageService]
})
export default class PartsComponent implements OnInit, DoCheck {
  activeTab: number = 0;
  visibleDialog: boolean = false;
  private isNewPart: boolean = false;
  isLoadingGroup: boolean = false;
  private part!: Part;
  parts = signal<IPartList[]>([]);
  partBrands = signal<Brand[]>([]);
  partGroups = signal<GroupPart[]>([]);
  partCategories = signal<CategoryPart[]>([]);
  partUnits = signal<UnitMeasure[]>([]);
  siglaUnit: string = '';
  listAdditionDiscount: IAdditionDiscount[] = [];
  yes = YesNotEnum.YES;
  not = YesNotEnum.NOT;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  formPart = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    priceNow: new FormControl<number>(0, Validators.required),
    priceOld: new FormControl<number>(0, Validators.required),
    priceWarranty: new FormControl<number>(0, Validators.required),
    additionDiscount: new FormControl<IAdditionDiscount | null>(null, Validators.required),//Acrécimo, Desconto, Ambos, Nenhum
    id: new FormControl<number | null>({ value: null, disabled: true }),
    code: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
    unit: new FormControl<UnitMeasure | null>(null, Validators.required),
    description: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    brand: new FormControl<Brand | null>(null, Validators.required),
    group: new FormControl<GroupPart | null>(null, Validators.required),
    category: new FormControl<CategoryPart | null>(null, Validators.required),
    locationPriArea: new FormControl<string>(''),
    locationPriStreet: new FormControl<string>(''),
    locationPriBookcase: new FormControl<string>(''),
    locationPriShelf: new FormControl<string>(''),
    locationPriPosition: new FormControl<string>(''),
    locationSecArea: new FormControl<string>(''),
    locationSecStreet: new FormControl<string>(''),
    locationSecBookcase: new FormControl<string>(''),
    locationSecShelf: new FormControl<string>(''),
    locationSecPosition: new FormControl<string>(''),
  });

  photoPartFront = signal<string>('');
  photoPartVerse = signal<string>('');
  isPhotoNewFront: boolean = false;
  isPhotoNewVerse: boolean = false;
  isPhotoDeleteFront: boolean = false;
  isPhotoDeleteVerse: boolean = false;

  //import part
  importPart = signal<IPartApollo | null>(null);

  constructor(
    private photoService: PhotoService,
    private partService: PartService,
    private storageService: StorageService,
    private groupService: GroupPartService,
    private categoryService: CategoryPartService,
    private brandService: BrandService,
    private unitService: UnitMeasureService,
    private messageService: MessageService,
    private loadingService: LoadingService) { }
  ngDoCheck(): void {
    if (this.importPart() != null) {
      this.showNewPart();
      this.editImportPart(this.importPart()!);
      this.importPart.set(null);
    }
  }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    this.loadingService.show();
    this.parts.set(await this.listAll());
    this.partUnits.set(await this.unitListAllEnabled());
    this.partBrands.set(await this.brandListAllEnabled());
    this.partCategories.set(await this.categoriesListAllEnabled());
    this.loadingService.hide();

    this.listAdditionDiscount = [
      { discount: AdditionDiscountEnum.ACRESCIMO },
      { discount: AdditionDiscountEnum.DESCONTO },
      { discount: AdditionDiscountEnum.AMBOS },
      { discount: AdditionDiscountEnum.NENHUM }];;
  }

  showNewPart() {
    this.isNewPart = true;
    this.part = new Part();
    this.cleanForm();
    //Habilita código peça
    this.formPart.get('code')?.enable();
    this.showDialog();
  }

  private showDialog() {
    this.visibleDialog = true;
    //TabView index
    this.activeTab = 0;
  }
  hideDialog() {
    this.visibleDialog = false;
  }
  changeTabs(index: any) {
    this.activeTab = index as number;
  }
  private cleanForm() {
    this.formPart.patchValue({
      status: this.enabled,
      priceNow: 0,
      priceOld: 0,
      priceWarranty: 0,
      additionDiscount: null,
      id: null,
      code: '',
      unit: null,
      description: '',
      brand: null,
      group: null,
      category: null,
      locationPriArea: '',
      locationPriStreet: '',
      locationPriBookcase: '',
      locationPriShelf: '',
      locationPriPosition: '',
      locationSecArea: '',
      locationSecStreet: '',
      locationSecBookcase: '',
      locationSecShelf: '',
      locationSecPosition: ''
    });
    this.siglaUnit = '';
    this.isLoadingGroup = false;
    this.photoPartFront.set('');
    this.photoPartVerse.set('');
  }
  onUnitSelected(event: any) {
    this.siglaUnit = event.value.unitMeasure;
  }
  async onBrandSelected(event: any) {
    this.isLoadingGroup = true;
    this.partGroups.set([]);
    this.formPart.get('group')?.setValue(null);
    this.partGroups.set(await this.filterGroupBrand(event.value.id));
    this.isLoadingGroup = false;
  }
  async onFileSelectedFront() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoPartFront.set(photo.base64!);
      //informa que foi selecionado uma imagem nova
      this.isPhotoNewFront = true;
      //informa que não exclua a imagem
      this.isPhotoDeleteFront = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  async onFileSelectedVerse() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.photoPartVerse.set(photo.base64!);
      //informa que foi selecionado uma imagem nova
      this.isPhotoNewVerse = true;
      //informa que não exclua a imagem
      this.isPhotoDeleteVerse = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }

  public async onFileDeleteFront() {
    this.photoPartFront.set('');
    //informa que a imagem não é nova
    this.isPhotoNewFront = false;
    //informa que exclua a imagem
    this.isPhotoDeleteFront = true;
  }
  public async onFileDeleteVerse() {
    this.photoPartVerse.set('');
    //informa que a imagem não é nova
    this.isPhotoNewVerse = false;
    //informa que exclua a imagem
    this.isPhotoDeleteVerse = true;
  }
  private editImportPart(item: IPartApollo) {
    this.formPart.patchValue({
      status: StatusEnabDisabEnum.ENABLED,
      priceNow: item.price,
      code: item.code,
      description: item.description,
     
      locationPriArea: item.locationArea,
      locationPriStreet: item.locationStreet,
      locationPriBookcase:item.locationBookcase,
      locationPriShelf: item.locationShelf
    });
  }
  save() {
    if (this.isNewPart) {
      this.saveNewPart();
    } else {
      this.saveUpdatePart();
    }
  }

  private async saveNewPart() {
    const { value, valid } = this.formPart;
    if (!valid) {
      return;
    }
    this.part.companyId = this.storageService.companyId;
    this.part.resaleId = this.storageService.resaleId;
    //Tab dados
    this.part.status = value.status!;
    this.part.priceNow = value.priceNow!;
    this.part.priceOld = value.priceOld!;
    this.part.priceWarranty = value.priceWarranty!;
    this.part.additionDiscount = value.additionDiscount!['discount']!;
    this.part.code = value.code!;
    this.part.description = value.description!;
    this.part.unitMeasureId = value.unit!.id;
    this.part.brandId = value.brand!.id;
    this.part.groupId = value.group!.id;
    this.part.categoryId = value.category!.id;
    //tab location
    this.part.locationPriArea = value.locationPriArea!;
    this.part.locationPriStreet = value.locationPriStreet!;
    this.part.locationPriBookcase = value.locationPriBookcase!;
    this.part.locationPriShelf = value.locationPriShelf!;
    this.part.locationPriPosition = value.locationPriPosition!;
    this.part.locationSecArea = value.locationSecArea!;
    this.part.locationSecStreet = value.locationSecStreet!;
    this.part.locationSecBookcase = value.locationSecBookcase!;
    this.part.locationSecShelf = value.locationSecShelf!;
    this.part.locationSecPosition = value.locationSecPosition!;
    this.loadingService.show();
    const result = await this.saveNewP(this.part);
    if (result.status == 201 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.part = result.body.data;
      this.formPart.get('id')?.setValue(this.part.id);
      this.isNewPart = false;
      //Salvar as imagens
      if (this.isPhotoNewFront == true) {
        const img1 = await this.savePhoto(this.part.id!, this.photoPartFront(), "image1");
        this.part.photoUrlFront = img1;
      }
      if (this.isPhotoNewVerse == true) {
        const img2 = await this.savePhoto(this.part.id!, this.photoPartVerse(), "image2");
        this.part.photoUrlVerse = img2;
      }
      if (this.isPhotoNewFront || this.isPhotoNewVerse) {
        const resultSaveImage = await this.saveUpdateP(this.part);
        this.isPhotoNewFront = false;
        this.isPhotoNewVerse = false;
      }
      this.parts.set(await this.listAll());
    }
    this.loadingService.hide();
    if (result.status == 201 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async saveUpdatePart() {
    const { value, valid } = this.formPart;
    if (!valid) {
      return;
    }
    this.loadingService.show();
    //Tab dados
    this.part.status = value.status!;
    this.part.priceNow = value.priceNow!;
    this.part.priceOld = value.priceOld!;
    this.part.priceWarranty = value.priceWarranty!;
    this.part.additionDiscount = value.additionDiscount!['discount']!;
    //Salvar as imagens
    if (this.isPhotoNewFront == true && this.isPhotoDeleteFront == false) {
      this.isPhotoNewFront = false;
      const img1 = await this.savePhoto(this.part.id!, this.photoPartFront(), "image1");
      this.part.photoUrlFront = img1;
    }
    if (this.isPhotoNewVerse == true && this.isPhotoDeleteVerse == false) {
      this.isPhotoNewVerse = false;
      const img2 = await this.savePhoto(this.part.id!, this.photoPartVerse(), "image2");
      this.part.photoUrlVerse = img2;
    }
    //Excluir as imagens
    if (this.isPhotoNewFront == false && this.isPhotoDeleteFront == true) {
      this.isPhotoDeleteFront = false;
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/parts/` +
        `${this.part.id}/image1.jpg`;
      const formData = new FormData();
      formData.append('local', path);
      this.deleteImage(formData);
      this.part.photoUrlFront = "";
    }
    if (this.isPhotoNewVerse == false && this.isPhotoDeleteVerse == true) {
      this.isPhotoDeleteVerse = false;
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/parts/` +
        `${this.part.id}/image2.jpg`;
      const formData = new FormData();
      formData.append('local', path);
      this.deleteImage(formData);
      this.part.photoUrlVerse = "";
    }
    // this.part.code = value.code;
    this.part.description = value.description!;
    this.part.unitMeasureId = value.unit!.id;
    this.part.brandId = value.brand!.id;
    this.part.groupId = value.group!.id;
    this.part.categoryId = value.category!.id;
    //tab location
    this.part.locationPriArea = value.locationPriArea!;
    this.part.locationPriStreet = value.locationPriStreet!;
    this.part.locationPriBookcase = value.locationPriBookcase!;
    this.part.locationPriShelf = value.locationPriShelf!;
    this.part.locationPriPosition = value.locationPriPosition!;
    this.part.locationSecArea = value.locationSecArea!;
    this.part.locationSecStreet = value.locationSecStreet!;
    this.part.locationSecBookcase = value.locationSecBookcase!;
    this.part.locationSecShelf = value.locationSecShelf!;
    this.part.locationSecPosition = value.locationSecPosition!;

    const result = await this.saveUpdateP(this.part);
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.part = result.body.data;
      this.parts.set(await this.listAll());
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }

  async edit(id: number) {
    this.loadingService.show();
    const result = await this.filterId(id);
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.part = result.body.data;
      this.isNewPart = false;
      this.cleanForm();
      //Desabilita código
      this.formPart.get('code')?.disable();
      //Grupos
      this.partGroups.set(await this.filterGroupBrand(this.part.brandId!));
      //Unidade de Medida
      const unit = this.partUnits().find(u => u.id == this.part.unitMeasureId);
      this.siglaUnit = unit?.unitMeasure!;
      //Form
      this.formPart.patchValue({
        status: this.part.status,
        priceNow: this.part.priceNow,
        priceOld: this.part.priceOld,
        priceWarranty: this.part.priceWarranty,
        additionDiscount: this.listAdditionDiscount.find(a => a.discount == this.part.additionDiscount),
        id: this.part.id,
        code: this.part.code,
        description: this.part.description,
        unit: unit,
        brand: this.partBrands().find(b => b.id == this.part.brandId),
        group: this.partGroups().find(g => g.id == this.part.groupId),
        category: this.partCategories().find(c => c.id == this.part.categoryId),
      });
      this.photoPartFront.set(this.part.photoUrlFront);
      this.photoPartVerse.set(this.part.photoUrlVerse);
      //Tab Location
      this.formPart.patchValue({
        locationPriArea: this.part.locationPriArea,
        locationPriStreet: this.part.locationPriStreet,
        locationPriBookcase: this.part.locationPriBookcase,
        locationPriShelf: this.part.locationPriShelf,
        locationPriPosition: this.part.locationPriPosition,
        locationSecArea: this.part.locationSecArea,
        locationSecStreet: this.part.locationSecStreet,
        locationSecBookcase: this.part.locationSecBookcase,
        locationSecShelf: this.part.locationSecShelf,
        locationSecPosition: this.part.locationSecPosition,
      });
      this.showDialog();
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }

  private async savePhoto(id: number, img: string, name: string): Promise<string> {
    try {
      let path =
        `${this.storageService.companyId}/` +
        `${this.storageService.resaleId}/parts/` +
        `${id}/` +
        `${name}.jpg`;

      const { base64, mime } = this.cleanBase64(img);
      const file = this.base64ToFile(base64, mime);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('local', path);

      const resultSave = await this.saveImage(formData);
      if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error) {
      return "";
    }
    return "";

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


  private async saveNewP(p: Part): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.save(p));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveUpdateP(p: Part): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.update(p));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAll(): Promise<IPartList[]> {
    try {
      return await lastValueFrom(this.partService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.filterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.saveImage(data));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async deleteImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.deleteImage(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async brandListAllEnabled(): Promise<Brand[]> {
    try {
      return await lastValueFrom(this.brandService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async unitListAllEnabled(): Promise<UnitMeasure[]> {
    try {
      return await lastValueFrom(this.unitService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async filterGroupBrand(brandId: number): Promise<GroupPart[]> {
    try {
      return await lastValueFrom(this.groupService.filterBrand(brandId));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async categoriesListAllEnabled(): Promise<CategoryPart[]> {
    try {
      return await lastValueFrom(this.categoryService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
}
