import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { LoadingService } from '@/app/services/loading/loading.service';
import { SalespersonGroupService } from '@/app/services/salesperson/salesperson.group.service';
import { SalespersonGroup } from '@/app/models/salesperson/salesperson.group';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { ClientCompanyRegion } from '@/app/models/client.company.region';
import { ClientCompanyRegionService } from '@/app/services/client/client.company.region';
import { Brand } from '@/app/models/brand';
import { BrandService } from '@/app/services/brand/brand.service';

@Component({
  selector: 'app-salesperson.group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule, InputTextModule, InputNumberModule, MultiSelectModule,
    InputGroupModule, IconFieldModule, TableModule, RadioButtonModule,
    ButtonModule, InputIconModule, DialogModule],
  templateUrl: './salesperson.group.component.html',
  styleUrl: './salesperson.group.component.scss',
  providers: [MessageService]
})
export default class SalespersonGroupComponent {
  visibleDialog: boolean = false;
  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  groups = signal<SalespersonGroup[]>([]);

  group!: SalespersonGroup;
  isNewGroup: boolean = true;

  formSalespersonGroup = new FormGroup({
    id: new FormControl<number | null>({ value: null, disabled: true }),
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED, Validators.required),
    description: new FormControl<string>('', Validators.required),
    ufs: new FormControl<string[]>([]),
    brands: new FormControl<Brand[]>([]),
    regions: new FormControl<ClientCompanyRegion[]>([]),
  });
  ufs = [
    { label: 'AC', value: 'AC' },
    { label: 'AL', value: 'AL' },
    { label: 'AP', value: 'AP' },
    { label: 'AM', value: 'AM' },
    { label: 'BA', value: 'BA' },
    { label: 'CE', value: 'CE' },
    { label: 'DF', value: 'DF' },
    { label: 'ES', value: 'ES' },
    { label: 'GO', value: 'GO' },
    { label: 'MA', value: 'MA' },
    { label: 'MT', value: 'MT' },
    { label: 'MS', value: 'MS' },
    { label: 'MG', value: 'MG' },
    { label: 'PA', value: 'PA' },
    { label: 'PB', value: 'PB' },
    { label: 'PR', value: 'PR' },
    { label: 'PE', value: 'PE' },
    { label: 'PI', value: 'PI' },
    { label: 'RJ', value: 'RJ' },
    { label: 'RN', value: 'RN' },
    { label: 'RS', value: 'RS' },
    { label: 'RO', value: 'RO' },
    { label: 'RR', value: 'RR' },
    { label: 'SC', value: 'SC' },
    { label: 'SP', value: 'SP' },
    { label: 'SE', value: 'SE' },
    { label: 'TO', value: 'TO' }
  ];
  brands = signal<Brand[]>([]);
  regions = signal<ClientCompanyRegion[]>([]);
  constructor(
    private loadingService: LoadingService,
    private salespersonGroupService: SalespersonGroupService,
    private messageService: MessageService,
    private regionService: ClientCompanyRegionService,
    private brandService: BrandService) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    this.loadingService.show();
    this.groups.set(await this.listAllGroups());
    this.brands.set(await this.listAllBrands());
    this.regions.set(await this.listAllRegions());
    this.loadingService.hide();
  }

  private showDialog() {
    this.visibleDialog = true;
  }

  newGroup() {
    this.isNewGroup = true;
    this.cleanForm();
    this.showDialog();
  }

  hideDialog() {
    this.visibleDialog = false;
  }

  private cleanForm() {
    this.formSalespersonGroup.patchValue({
      id: null,
      description: "",
      status: StatusEnabDisabEnum.ENABLED,
      ufs: [],
      brands: [],
      regions: []
    });
  }
  edit(group: SalespersonGroup) {
    this.cleanForm();
    this.isNewGroup = false;
    this.group = group;
    this.formSalespersonGroup.patchValue({
      id: group.id,
      description: group.description,
      status: group.status,
      ufs: group.ufs ? group.ufs.split(',') : [],
      brands: group.brands ? this.brands().filter(b => group.brands.split(',').includes(b.id!.toString())) : [],
      regions: group.regions ? this.regions().filter(r => group.regions.split(',').includes(r.id!.toString())) : []
    });
    this.showDialog();
  }
  save() {
    if (this.isNewGroup) {
      this.saveNewGroup();
    } else {
      this.saveUpdateGroup();
    }
  }

  private async saveNewGroup() {
    const { value, valid } = this.formSalespersonGroup;
    if (!valid) {
      return;
    }
    this.group = new SalespersonGroup();
    this.group.status = value.status!;
    this.group.description = value.description!;
    this.group.ufs = value?.ufs!.join(',') ?? '';
    this.group.brands = value?.brands!.join(',') ?? '';
    this.group.regions = value?.regions!.join(',') ?? '';
    this.loadingService.show();
    const resultSave = await this.saveGroup(this.group);
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.group = resultSave.body.data;
      this.formSalespersonGroup.get("id")?.setValue(this.group.id);
      this.isNewGroup = false;
      this.groups.set(await this.listAllGroups());
    }
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async saveUpdateGroup() {
    const { value, valid } = this.formSalespersonGroup;
    if (!valid) {
      return;
    }
    this.group.status = value.status!;
    this.group.description = value.description!;
    this.group.ufs = value?.ufs!.join(',') ?? '';
    //Retornar os ids das marcas e regiões selecionadas, separados por vírgula
    this.group.brands = value?.brands!.map((b: Brand) => b.id).join(',') ?? '';
    this.group.regions = value?.regions!.map((r: ClientCompanyRegion) => r.id).join(',') ?? '';
    //open Load
    this.loadingService.show();
    const resultSave = await this.updateGroup(this.group);
    //Close Load
    this.loadingService.hide();
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });
      this.groups.set(await this.listAllGroups());
    }
    if (resultSave.status == 200 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async listAllGroups(): Promise<SalespersonGroup[]> {
    try {
      return await lastValueFrom(this.salespersonGroupService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async saveGroup(group: SalespersonGroup): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.salespersonGroupService.save(group));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateGroup(group: SalespersonGroup): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.salespersonGroupService.update(group));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAllRegions(): Promise<ClientCompanyRegion[]> {
    try {
      return await lastValueFrom(this.regionService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async listAllBrands(): Promise<Brand[]> {
    try {
      return await lastValueFrom(this.brandService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }
}
