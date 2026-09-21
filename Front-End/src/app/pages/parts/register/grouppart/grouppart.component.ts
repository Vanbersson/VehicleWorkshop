import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';

import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { Brand } from '@/app/models/brand';
import { StorageService } from '@/app/services/storage/storage.service';
import { BrandService } from '@/app/services/brand/brand.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { GroupPartTypeEnum } from '@/app/models/parts/group.part.type.enum';
import { GroupPart } from '@/app/models/parts/group.part';
import { GroupPartService } from '@/app/services/parts/group.part';
import { MessageResponse } from '@/app/models/message-response';
import { StatusSuccessError } from '@/app/models/status-suc-err';


@Component({
  selector: 'app-grouppart',
  standalone: true,
  imports: [CommonModule, InputTextModule, IconFieldModule, SelectModule, RadioButtonModule, InputIconModule,
    ButtonModule, InputNumberModule, ReactiveFormsModule, TableModule, ToastModule, DialogModule],
  templateUrl: './grouppart.component.html',
  styleUrl: './grouppart.component.scss',
  providers: [MessageService]
})
export default class GrouppartComponent implements OnInit {
  private isNewGroup: boolean = true;
  private group!: GroupPart;

  pecas = GroupPartTypeEnum.PECAS;
  acessorio = GroupPartTypeEnum.ACESSORIO;
  lubrificates = GroupPartTypeEnum.LUBRIFICANTE;
  combustiveis = GroupPartTypeEnum.COMBUSTIVEIS;
  outros = GroupPartTypeEnum.OUTROS;

  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  formGroup = new FormGroup({
    status: new FormControl<StatusEnabDisabEnum>(StatusEnabDisabEnum.ENABLED),
    type: new FormControl<GroupPartTypeEnum>(GroupPartTypeEnum.OUTROS),
    description: new FormControl<string>('', [Validators.required, Validators.maxLength(100)]),
    brand: new FormControl<Brand | null>(null,Validators.required)
  });

  brands = signal<Brand[]>([]);
  listGroups = signal<GroupPart[]>([]);
  dialogVisible: boolean = false;

  constructor(
    private storageService: StorageService,
    private brandService: BrandService,
    private groupService: GroupPartService,
    private messageService: MessageService,
    private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.init();
  }
  private async init() {
    this.loadingService.show();
    this.listGroups.set(await this.listAll());
    this.brands.set( await this.brandListAllEnabled()) ;
    this.loadingService.hide();
  }
  showNewGroup() {
    this.isNewGroup = true;
    this.group = new GroupPart();
    this.cleanForm();
    this.showDialog();
  }
  showDialog() {
    this.dialogVisible = true;
  }
  hideDialog() {
    this.dialogVisible = false;
  }
  searchBrand(id: number): string {
    return this.brands().find(b => b.id == id)?.name!;
  }
  private cleanForm() {
    this.formGroup.patchValue({
      type: GroupPartTypeEnum.OUTROS,
      description: '',
      status: this.enabled,
      brand: null
    });
  }
  edit(g: GroupPart) {
    this.isNewGroup = false;
    this.group = g;
    this.cleanForm();
    this.showDialog();

    this.formGroup.patchValue({
      brand: this.brands().find(b => b.id == g.brandId),
      description: this.group.description,
      type: this.group.type,
      status: this.group.status,
    });
  }
  save() {
    if (this.isNewGroup) {
      this.saveNewGroup();
    } else {
      this.saveUpdateGroup();
    }
  }

  private async saveNewGroup() {
    const { value, valid } = this.formGroup;
    if (!valid) {
      return;
    }

    this.group.companyId = this.storageService.companyId;
    this.group.resaleId = this.storageService.resaleId;
    this.group.type = value.type!;
    this.group.brandId = value.brand!.id;
    this.group.description = value.description!;
    this.group.status = value.status!;

    this.loadingService.show();
    const result = await this.saveNew(this.group);
    this.loadingService.hide();
    if (result.status == 201 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.hideDialog();
      this.init();
    }
    if (result.status == 201 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async saveUpdateGroup() {
    const { value, valid } = this.formGroup;
    if (!valid) {
      return;
    }

    this.group.type = value.type!;
    this.group.brandId = value.brand!.id;
    this.group.description = value.description!;
    this.group.status = value.status!;

    this.loadingService.show();
    const result = await this.saveUpdate(this.group);
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.hideDialog();
    }
    if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
    this.init();
  }

  private async saveNew(group: GroupPart): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.groupService.save(group));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveUpdate(group: GroupPart): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.groupService.update(group));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listAll(): Promise<GroupPart[]> {
    try {
      return await lastValueFrom(this.groupService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
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

}
