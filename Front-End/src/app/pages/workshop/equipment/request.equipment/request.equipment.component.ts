import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, FormsModule, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { PopoverModule } from 'primeng/popover';

import { Mechanic } from '@/app/models/workshop/mechanic';
import { ToolControlMaterial } from '@/app/models/workshop/tool.control/tool.control.material';
import { ToolControlCategory } from '@/app/models/workshop/tool.control/tool.control.category';
import { ToolControlMatMec } from '@/app/models/workshop/tool.control/tool.control.mat.mec';
import { ToolControlRequest } from '@/app/models/workshop/tool.control/tool.control.request';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { MechanicService } from '@/app/services/workshop/mechanic.service';
import { ToolControlCategoryService } from '@/app/services/workshop/tool.control/tool.control.category.service';
import { ToolControlMaterialService } from '@/app/services/workshop/tool.control/tool.control.material.service';
import { ToolControlMatMecService } from '@/app/services/workshop/tool.control/tool.control.matmec.service';
import { ToolControlRequestService } from '@/app/services/workshop/tool.control/tool.control.request.service';
import { ToolcontrolReportService } from '@/app/services/workshop/tool.control/tool.control.report.service';
import { ToolControlReport } from '@/app/models/workshop/tool.control/tool.control.report';
import { TypeCategoryEnum } from '@/app/models/workshop/type.category.enum';
import { TypeMaterialEnum } from '@/app/models/workshop/type.material.enum';
import { StatusTollControlRequestEnum } from '@/app/models/workshop/status.tool.control.request.enum';
import { IToolControlRequestMechanic } from '@/app/interfaces/workshop/i.tool.control.request.mechanic';
import { IToolControlMaterialMec } from '@/app/interfaces/workshop/i.tool.control.material.mec';
import { MechanicDepartment } from '@/app/models/workshop/mechanic.department';
import { MechanicDepartmentService } from '@/app/services/workshop/mechanic.department.service';
import { PrintTermEpiComponent } from '@/app/components/print.term.epi/print.term.epi.component';

@Component({
  selector: 'app-request-equipment',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, InputTextModule, InputNumberModule, PopoverModule, SelectModule, MultiSelectModule, CheckboxModule,
    IconFieldModule, InputMaskModule, InputGroupModule, InputIconModule, DialogModule, ReactiveFormsModule, FormsModule, PasswordModule, RadioButtonModule,
    ConfirmDialogModule, ToastModule, TextareaModule, DatePickerModule, PrintTermEpiComponent],
  templateUrl: './request.equipment.component.html',
  styleUrl: './request.equipment.component.scss',
  providers: [ConfirmationService, MessageService]
})
export default class RequestEquipmentComponent implements OnInit {
  expandedRows = {};
  listRequestMec = signal<IToolControlRequestMechanic[]>([]);
  currentCodePassReal = '';
  currentCodePassExpected: number | null = null;
  request!: ToolControlRequest;
  isDeliveryMaterial: boolean = false;
  //Dialog Requisição de mateiais
  listRequest = signal<ToolControlRequest[]>([]);
  visibleDialogPegar = false;
  photoMec = signal<string>('');
  quantityReqDefault = 1;
  quantitySelectDefaultMat = signal<number>(0);
  tempMaterialSelected: ToolControlMaterial[] = [];
  formCodePass = new FormGroup({
    maskedPassword: new FormControl<any>([''], Validators.required)
  });
  formPegar = new FormGroup({
    deliveryCompleted: new FormControl<string>(''),
    request: new FormControl<ToolControlRequest | null>(null),
    mechanic: new FormControl<Mechanic | null>(null, Validators.required),
    material: new FormControl<ToolControlMaterial[] | null>([], Validators.required),
    category: new FormControl<ToolControlCategory | null>(null, Validators.required),
    inforReq: new FormControl<string>(""),
  });
  listMec = signal<Mechanic[]>([]);
  listMecDepartment = signal<MechanicDepartment[]>([]);
  listCat = signal<ToolControlCategory[]>([]);

  listMat = signal<ToolControlMaterial[]>([]);
  listMatTemp = signal<ToolControlMaterial[]>([]);
  selectedMaterials: IToolControlMaterialMec[] = [];
  listMatMec: ToolControlMatMec[] = [];
  //Dialog Devolver
  materialReturned: boolean = false;

  visibleDialogDev = false;
  listReturnMaterial = signal<IToolControlMaterialMec[]>([]);
  disabledSelectMat = false;
  //Edit
  clonedMaterial: { [s: number]: ToolControlMaterial } = {};
  UNIFORME: string = TypeCategoryEnum.UNIFORM;
  EPI: string = TypeCategoryEnum.EPI;
  FERRAMENTA: string = TypeCategoryEnum.TOOL;
  OUTRO = TypeCategoryEnum.OTHER;
  selectTypeCategory: string = "";
  //Dialog request
  listRequestPendent = signal<ToolControlRequest[]>([]);
  visibleDialogRequest = false;
  formRequest = new FormGroup({
    mechanic: new FormControl<Mechanic | null>(null, Validators.required),
    type: new FormControl<TypeCategoryEnum>(TypeCategoryEnum.OTHER, Validators.required),
    inforReq: new FormControl<string>("", Validators.required),
  });

  //Detalhe requisição
  visibleDialogDetailsRequest = false;

  isPrintDetailsEPI: boolean = true;
  printEPIMechanicName!: string;
  printEPIMechanicDep!: string;
  printEPIRequestId!: number;
  printEPIList = signal<ToolControlMatMec[]>([]);
  listMaterialDetailsRequest = signal<ToolControlMatMec[]>([]);

  formDetailsRequest = new FormGroup({
    id: new FormControl<number | null>(null),
    status: new FormControl<string>(''),
    requestType: new FormControl<TypeMaterialEnum>(TypeMaterialEnum.BOTH),
    requestDate: new FormControl<string | Date>(""),
    requestInformation: new FormControl<string>(""),
    requestUserId: new FormControl<number | null>(null),
    requestUserName: new FormControl<string>(""),
    categoryType: new FormControl<TypeCategoryEnum>(TypeCategoryEnum.OTHER),
    mechanicName: new FormControl<string>(""),
    mechanicDepartment: new FormControl<string>(""),
  });

  @ViewChild('printEPIComponent') printEPIComponent!: PrintTermEpiComponent;

  constructor(
    private loadingService: LoadingService,
    private storageService: StorageService,
    private mechanicService: MechanicService,
    private departmentService: MechanicDepartmentService,
    private categoryService: ToolControlCategoryService,
    private materialService: ToolControlMaterialService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private matMecService: ToolControlMatMecService,
    private requestService: ToolControlRequestService,
    private reportService: ToolcontrolReportService) {
  }
  ngOnInit(): void {
    this.init();
  }
  onInputPassword(): void {
    const masked = this.formCodePass.get('maskedPassword')?.value;
    const realLength = this.currentCodePassReal.length;
    const maskedLength = masked.length;
    if (maskedLength < realLength) {
      // backspace ou remoção
      this.currentCodePassReal = this.currentCodePassReal.substring(0, maskedLength);
    } else {
      const newChar = masked.charAt(maskedLength - 1);
      this.currentCodePassReal += newChar;
    }
    // atualiza o campo com asteriscos
    this.formCodePass.get('maskedPassword')?.setValue('*'.repeat(this.currentCodePassReal.length), {
      emitEvent: false // evita loop de input
    });
  }
  private async init() {
    //Inicia o loading
    this.loadingService.show();
    const resultCat = await this.listCategory();
    this.listCat.set(resultCat);
    this.listMat.set(await this.listMaterialEnabled());
    this.listMec.set(await this.listMecEnabled());
    this.listMecDepartment.set(await this.listAllEnabledDepartment());
    this.filterMaterialMec();
    //Facha o loading
    this.loadingService.hide();
  }
  //Request
  private async saveNewRequest(req: ToolControlRequest): Promise<HttpResponse<ToolControlRequest>> {
    try {
      return await lastValueFrom(this.requestService.newRequest(req));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateRequest(req: ToolControlRequest): Promise<HttpResponse<ToolControlRequest>> {
    try {
      return await lastValueFrom(this.requestService.updateRequest(req));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterRequestId(id: number): Promise<HttpResponse<ToolControlRequest>> {
    try {
      return await lastValueFrom(this.requestService.filterRequestId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listRequestStatus(status: string): Promise<ToolControlRequest[]> {
    try {
      return await lastValueFrom(this.requestService.listRequestStatus(status));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  selectRequest() {
    if (this.formPegar.get('request')?.value != null) {
      this.request = this.formPegar.get('request')?.value!;
      this.formPegar.get("deliveryCompleted")?.enable();
    } else {
      this.request = null!;
      this.formPegar.get("deliveryCompleted")?.setValue('');
      this.formPegar.get("deliveryCompleted")?.disable();
    }
  }

  public cleanSelected() {
    this.selectedMaterials = [];
  }
  //Material
  private async listMaterialEnabled(): Promise<ToolControlMaterial[]> {
    try {
      return await lastValueFrom(this.materialService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  selectMaterial() {
    this.tempMaterialSelected = this.formPegar.get('material')?.value!;
  }

  private async listCategory(): Promise<ToolControlCategory[]> {
    try {
      return await lastValueFrom(this.categoryService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  selectCategory() {
    const { value } = this.formPegar;
    if (value.category != null) {
      //Tipo de categoria
      this.selectTypeCategory = value.category!.type;
      //Quantidade de requisição padrão de categoria
      const quantityReq = value.category!.quantityReq;
      //Total permitido de seleção
      this.quantitySelectDefaultMat.set(quantityReq!);
      //Habilitar a seleção de materiais
      this.disabledSelectMat = false;
      //limpa a lista temporaria
      this.listMatTemp.set([]);
      this.tempMaterialSelected = [];
      this.formPegar.get('material')?.setValue(null);

      //Filtra os materiais disponíveis para a categoria
      for (var mat of this.listMat()) {
        if (value.category.id == mat.categoryId && (mat.type == TypeMaterialEnum.LOAN || mat.type == TypeMaterialEnum.BOTH) && mat.quantityAvailableLoan > 0) {
          //Quantidade padrão de requisição
          mat.quantityLoan = this.quantityReqDefault;
          //Adiciona o material
          this.listMatTemp.set([...this.listMatTemp(), mat]);
        }
      }

      if (value.category!.type == TypeCategoryEnum.TOOL || value.category!.type == TypeCategoryEnum.EPI) {
        const mecSelecionado = this.listRequestMec().find(m => m.id === value.mechanic?.id);
        if (mecSelecionado) {

          // Materiais que já foram entregues ao mecânico
          const materialsDelivered = mecSelecionado.materials;

          this.listMatTemp.set(
            this.listMatTemp().filter(mat =>
              !materialsDelivered.some(material => material.materialId === mat.id)
            )
          );

          // Calcula quantos materiais da categoria já foram entregues ao mecânico
          if (quantityReq > 0) {
            const qtdSelected = materialsDelivered.filter(
              material =>
                material.materialId != null &&
                this.listMat().some(mat =>
                  mat.id === material.materialId &&
                  mat.categoryId === value.category!.id)
            ).length;

            // Quantidade restante que pode ser selecionada
            const quantityRemaining = Math.max(0, quantityReq - qtdSelected);
            this.quantitySelectDefaultMat.set(quantityRemaining);

            // Já atingiu o limite da categoria
            if (qtdSelected >= quantityReq) {
              this.disabledSelectMat = true;
            }
          }

        }
      }
    } else {
      this.selectTypeCategory = "";
      this.listMatTemp.set([]);
      this.tempMaterialSelected = [];
      this.formPegar.get('material')?.setValue([]);
    }
  }
  //Mecânicos
  private async listMecEnabled(): Promise<Mechanic[]> {
    try {
      return await lastValueFrom(this.mechanicService.listAllEnabled());
    } catch (error) {
      return [];
    }
  }
  async selectMechanic() {
    const { value } = this.formPegar;
    if (value.mechanic != null) {
      this.photoMec.set(value.mechanic.photoUrl);
      this.listRequest.set(await this.listRequestMechanic(value.mechanic.id!));
    } else {
      this.photoMec.set("");
      this.formPegar.patchValue({ category: null, material: [] });
      this.listMatTemp.set([]);
      this.tempMaterialSelected = [];
    }
  }
  getMechanicName(id: number): string {
    return this.listMec().find(mec => mec.id == id)!.name;
  }

  private cleanFormCodePass() {
    this.formCodePass.patchValue({ maskedPassword: "" });
    this.currentCodePassReal = "";
  }

  private async filterMatMecRequesId(requestId: number): Promise<ToolControlMatMec[]> {
    try {
      return await lastValueFrom(this.matMecService.filterRequesId(requestId));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async filterMaterialMec() {
    //Limpa a lista de materiais entregues para os mecânicos
    this.listRequestMec.set([]);
    for (const mechanic of this.listMec()) {
      const resultMec = await this.filterMechanicId(mechanic.id!);
      if (resultMec.status == 200 && resultMec.body != null) {
        let item: IToolControlRequestMechanic = resultMec.body;
        for (let material of item.materials) {
          const mat = this.listMat().find(m => m.id === material.materialId);
          const category = this.listCat().find(cat => cat.id == mat?.categoryId);
          material.materialDesc = mat?.description!;
          material.materialPhoto = mat?.photoUrl;
          material.categoryId = category?.id!;
          material.categoryDesc = category?.description;
          material.categoryType = category?.type;
          material.mechanicId = item.id;
          material.mechanicName = item.name;
          material.mechanicPhoto = item.photoUrl;
          material.mechanicCodePassword = item.codePassword;
        }
        this.listRequestMec.set([...this.listRequestMec(), resultMec.body]);
      }
    }
  }

  private async filterMechanicId(id: number): Promise<HttpResponse<IToolControlRequestMechanic>> {
    try {
      return await lastValueFrom(this.reportService.filterMechanicId(id));
    } catch (error: any) {
      return error;
    }
  }

  private async listRequestMechanic(id: number): Promise<ToolControlRequest[]> {
    try {
      return await lastValueFrom(this.requestService.filterMechanicId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  cleanFormPegar() {
    this.formPegar.patchValue({
      deliveryCompleted: '',
      request: null,
      mechanic: null,
      material: [],
      category: null,
      inforReq: ""
    });
    this.photoMec.set("");
    this.formPegar.get("deliveryCompleted")?.disable();
    this.tempMaterialSelected = [];
    this.request = null!;
    this.listRequest.set([]);
    this.listMatTemp.set([]);
  }
  //Nova solicitação
  public showDialogReq() {
    this.cleanFormRequest();
    this.listRequestPend();
    this.visibleDialogRequest = true;
  }
  private async listRequestPend() {
    this.listRequestPendent.set(await this.listRequestStatus(StatusTollControlRequestEnum.OPEN));
    const resultDeli = await this.listRequestStatus(StatusTollControlRequestEnum.DELIVERED);
    resultDeli.map(d => {
      this.listRequestPendent.update(requests => [...requests, d]);
    });
  }
  hideDialogReq() {
    this.visibleDialogRequest = false;
  }
  private cleanFormRequest() {
    this.formRequest.patchValue({
      mechanic: null,
      type: TypeCategoryEnum.OTHER,
      inforReq: ""
    });
  }
  async newRequest() {
    const { value } = this.formRequest;
    var req: ToolControlRequest = new ToolControlRequest();
    req.companyId = this.storageService.companyId;
    req.resaleId = this.storageService.resaleId;
    req.status = StatusTollControlRequestEnum.OPEN!;
    req.requestType = TypeMaterialEnum.LOAN;
    req.requestDate = this.formatDateTime(new Date());
    req.requestInformation = value.inforReq!;
    req.requestUserId = this.storageService.id;
    req.requestUserName = this.storageService.name;
    req.categoryType = value.type!;
    req.mechanicId = value.mechanic!.id;
    this.loadingService.show();
    const resultReq = await this.saveNewRequest(req);
    this.loadingService.hide();
    if (resultReq.status == 201) {
      this.messageService.add({ severity: 'success', summary: 'Requisição', detail: 'Aberta com sucesso', icon: 'pi pi-check' });
      this.listRequestPend();
    }
  }
  //Retorno de material
  showDialogDev() {
    this.visibleDialogDev = true;
  }
  async hideDialogDev() {
    this.visibleDialogDev = false;
    if (this.materialReturned) {
      this.materialReturned = false;
      this.selectedMaterials = [];
      //Atualiza a lista de materiais entregues para o mecânico
      this.filterMaterialMec();
      //Atualiza a lista de materiais disponíveis
      this.listMat.set(await this.listMaterialEnabled());
    }
  }

  async returnMaterial() {
    //Vefica se a material selecionado
    if (this.selectedMaterials.length <= 0) {
      return;
    }
    this.listReturnMaterial.set([]);
    for (let index = 0; index < this.selectedMaterials.length; index++) {
      const element = this.selectedMaterials[index];
      this.listReturnMaterial.set([...this.listReturnMaterial(), element]);
    }
    this.showDialogDev();
  }
  async confirmReturnMaterial() {
    if (this.listReturnMaterial().length <= 0) {
      return;
    }
    //Confirma a senha do mecânico
    const resultConfirm = await this.confirmCodePassMechanic(this.listReturnMaterial()[0].mechanicName!, this.listReturnMaterial()[0].mechanicPhoto!, this.listReturnMaterial()[0].mechanicCodePassword!);
    if (!resultConfirm) {
      return;
    }
    // filtra os materias do mecânico selecionado
    const materialMec = this.listReturnMaterial().filter(mec => mec.mechanicId === this.listReturnMaterial()[0].mechanicId);
    for (const mat of materialMec) {
      if (mat.returnInformation == null && mat.categoryType == TypeCategoryEnum.EPI) {
        this.messageService.add({ severity: 'info', summary: 'EPI', detail: 'Informação não adicionada', icon: 'pi pi-info-circle' });
        return;
      } else if (mat.returnInformation == '' && mat.categoryType == TypeCategoryEnum.EPI) {
        this.messageService.add({ severity: 'info', summary: 'EPI', detail: 'Informação não adicionada', icon: 'pi pi-info-circle' });
        return;
      }
      let matmec: ToolControlMatMec = new ToolControlMatMec();
      matmec.companyId = this.storageService.companyId;
      matmec.resaleId = this.storageService.resaleId;
      matmec.id = mat.matmecId;
      matmec.returnUserId = this.storageService.id;
      matmec.returnUserName = this.storageService.name;
      matmec.returnInformation = mat?.returnInformation ?? '';
      //Salva a devolução do material
      const resultReturn = await this.returnMatMec(matmec);
      if (resultReturn.status == 200) {
        this.messageService.add({ severity: 'success', summary: 'Material', detail: mat.materialDesc + ' devoldido com sucesso', icon: 'pi pi-check' });
        //remove o material da lista de devolução
        this.listReturnMaterial.set(this.listReturnMaterial().filter(material => material.matmecId != matmec.id));
        this.materialReturned = true;
      }
    }

    if (this.listReturnMaterial().length == 0) {
      this.hideDialogDev();
    }
  }
  //
  onRowCollapse(event: TableRowCollapseEvent) {
    //this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
  }
  onRowExpand(event: TableRowExpandEvent) {
    // this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
  }
  formatDateTime(date: Date): string {
    const datePipe = new DatePipe('en-US');
    // Obtém o fuso horário local no formato ±hh:mm
    const tzOffset = -date.getTimezoneOffset();
    const sign = tzOffset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
    const minutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
    const timezone = `${sign}${hours}:${minutes}`;
    // Formata a data e adiciona o fuso horário
    return datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") + timezone;
  }
  //Entrega de Material
  showDialogDeliveryMat() {
    this.cleanFormPegar();
    this.visibleDialogPegar = true;
  }
  async hideDialogDeliveryMat() {
    this.visibleDialogPegar = false;
    //Verifica se teve maerial salvo e alterar o status da solicitação
    if (this.isDeliveryMaterial) {
      this.isDeliveryMaterial = false;
      //Atualiza a lista de materiais entregues para o mecânico
      this.filterMaterialMec();
      //Atualiza a lista de materiais disponíveis
      this.listMat.set(await this.listMaterialEnabled());
    }
  }
  onConfirmCodePassMechanic(dv: ConfirmDialog) {
    if (Number.parseInt(this.currentCodePassReal) == this.currentCodePassExpected) {
      //Limpa código
      this.cleanFormCodePass();
      this.currentCodePassExpected = 0;
      dv.onAccept(); // Vai cair na lógica do `accept` da Promise
    } else {
      this.messageService.add({ severity: 'error', summary: 'Senha', detail: 'Senha incorreta', icon: 'pi pi-times', life: 3000 });
    }
  }
  async confirmCodePassMechanic(name: string, photo: string, code: number): Promise<boolean> {
    //Foto do mecânico
    this.photoMec.set(photo);
    //Código atual
    this.currentCodePassExpected = code;
    //Limpa campo da senha
    this.cleanFormCodePass();
    //Aguarda a confirmação
    return new Promise<boolean>((resolve) => {
      this.confirmationService.confirm({
        key: 'confimMecCodePass',
        header: 'Colaborador',
        message: name,
        acceptLabel: 'Comfirmar',
        accept: () => {
          setTimeout(() => resolve(true), 300);
        },
        reject: () => {
          resolve(false);
        }
      });
    });
  }
  async confirmDeliveryMaterial() {
    const { value } = this.formPegar;
    for (const mat of this.tempMaterialSelected) {
      if ((mat.numberCA == null || mat.numberCA == 0) && value.category!.type == TypeCategoryEnum.EPI) {
        this.messageService.add({ severity: 'info', summary: 'EPI', detail: 'C.A. não adicionado', icon: 'pi pi-info-circle' });
        return;
      }
    }
    const result = await this.confirmCodePassMechanic(value.mechanic!.name, value.mechanic!.photoUrl, value.mechanic!.codePassword!);
    if (result) {
      this.save();
    }
  }
  private async save() {
    const { value } = this.formPegar;
    //nova solicitação
    if (this.request == null) {
      this.request = new ToolControlRequest();
      this.request.companyId = this.storageService.companyId;
      this.request.resaleId = this.storageService.resaleId;
      this.request.status = StatusTollControlRequestEnum.OPEN;
      this.request.requestType = TypeMaterialEnum.LOAN;
      this.request.requestDate = this.formatDateTime(new Date());
      this.request.requestInformation = value.inforReq!;
      this.request.requestUserId = this.storageService.id;
      this.request.requestUserName = this.storageService.name;
      this.request.categoryType = value.category!.type;
      this.request.mechanicId = value.mechanic!.id;
      this.loadingService.show();
      const resultReq = await this.saveNewRequest(this.request);
      this.loadingService.hide();
      if (resultReq.status == 201) {
        this.request.id = resultReq.body!.id;
        this.messageService.add({ severity: 'success', summary: 'Requisição', detail: 'Aberta com sucesso', icon: 'pi pi-check' });
      } else {
        return;
      }
    }
    //Salvar materiais
    for (var index = 0; index < this.tempMaterialSelected.length; index++) {
      var item = this.tempMaterialSelected[index];
      var matMec: ToolControlMatMec = new ToolControlMatMec();
      matMec.companyId = this.storageService.companyId;
      matMec.resaleId = this.storageService.resaleId;
      matMec.requestId = this.request.id;
      matMec.deliveryUserId = this.storageService.id;
      matMec.deliveryUserName = this.storageService.name;
      matMec.deliveryDate = this.formatDateTime(new Date());
      matMec.deliveryQuantity = item.quantityLoan;
      matMec.deliveryInformation = item?.informationLoan ?? '';
      matMec.materialId = item.id;
      matMec.materialDescription = item.description;
      matMec.materialNumberCA = item.numberCA ?? null;
      const resultMatMec = await this.saveMatMec(matMec);
      if (resultMatMec.status == 201) {
        //informa que houve a entrega de material para alterar o status da solicitação
        this.isDeliveryMaterial = true;
        this.messageService.add({ severity: 'success', summary: 'Material', detail: item.description + ' salvo com sucesso', icon: 'pi pi-check' });
        //Remover os materiais salvo
        this.tempMaterialSelected = this.tempMaterialSelected.filter(mat => mat.id != matMec.materialId);
        this.formPegar.patchValue({ material: this.tempMaterialSelected });
        index--;
      }
    }
    //muda o status da solicitação para entregue caso tenha sido entregue algum material
    if (this.isDeliveryMaterial) {
      this.request.status = StatusTollControlRequestEnum.DELIVERED;
      const resultStatus = await this.updateRequest(this.request);
      if (resultStatus.status == 200) {
        this.messageService.add({ severity: 'success', summary: 'Solicitação', detail: 'Atualizada com sucesso', icon: 'pi pi-check' });
      }
    }
    if (this.tempMaterialSelected.length == 0) {
      if (this.formPegar.get('deliveryCompleted')?.value == '') {
        this.request.status = StatusTollControlRequestEnum.DELIVERY_COMPLETED;
        const resultStatus = await this.updateRequest(this.request);
        if (resultStatus.status == 200) {
          this.messageService.add({ severity: 'success', summary: 'Solicitação', detail: 'Atualizada com sucesso', icon: 'pi pi-check' });
        }
      }
      this.hideDialogDeliveryMat();
    }
  }
  private async saveMatMec(matMec: ToolControlMatMec): Promise<HttpResponse<ToolControlMatMec>> {
    try {
      return await lastValueFrom(this.matMecService.saveMaterial(matMec));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async returnMatMec(matMec: ToolControlMatMec): Promise<HttpResponse<ToolControlMatMec>> {
    try {
      return await lastValueFrom(this.matMecService.returnMaterial(matMec));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  //Editar quantidade de material no empréstimo
  onRowEditInit(mat: ToolControlMaterial) {
    this.clonedMaterial[mat.id as number] = { ...mat };
  }
  onRowEditSave(mat: ToolControlMaterial, index: number) {
    const category = this.listCat().find(cat => cat.id == mat.categoryId);
    if (!category) {
      return;
    }
    //EPI
    //Verifica se o EPI tem C.A informado caso não cancelar
    if (category.type == TypeCategoryEnum.EPI) {
      if (mat.numberCA == null || mat.numberCA <= 0) {
        this.tempMaterialSelected[index].numberCA = this.clonedMaterial[mat.id as number].numberCA;
        delete this.clonedMaterial[mat.id as number];
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Número do C.A obrigatório.' });
        return;
      }
      delete this.clonedMaterial[mat.id as number];
      this.messageService.add({ severity: 'success', summary: 'C.A', detail: 'Alterado com sucesso.' });
    }
    //UNIFORME
    //Verifica a quantidade informada
    if (category.type == TypeCategoryEnum.UNIFORM) {
      //Quatidade informada maior que disponível
      if (mat.quantityLoan > this.clonedMaterial[mat.id as number].quantityAvailableLoan) {
        this.tempMaterialSelected[index].quantityLoan = this.clonedMaterial[mat.id as number].quantityLoan;
        delete this.clonedMaterial[mat.id as number];
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Quantidade inválida.' });
        return;
      } else if (mat.quantityLoan <= 0) {
        this.tempMaterialSelected[index].quantityLoan = this.clonedMaterial[mat.id as number].quantityLoan;
        delete this.clonedMaterial[mat.id as number];
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Quantidade inválida.' });
        return;
      }
      delete this.clonedMaterial[mat.id as number];
      this.messageService.add({ severity: 'success', summary: 'Quantidade', detail: 'Alterada com sucesso.' });
    }
  }
  onRowEditCancel(mat: ToolControlMaterial, index: number) {
    const category = this.listCat().find(cat => cat.id == mat.categoryId);
    if (!category) {
      return;
    }
    if (category.type == TypeCategoryEnum.EPI) {
      this.tempMaterialSelected[index].numberCA = this.clonedMaterial[mat.id as number].numberCA;
      delete this.clonedMaterial[mat.id as number];
      return;
    }
    if (category.type == TypeCategoryEnum.UNIFORM) {
      this.tempMaterialSelected[index].quantityLoan = this.clonedMaterial[mat.id as number].quantityLoan;
      delete this.clonedMaterial[mat.id as number];
      return;
    }
    this.tempMaterialSelected[index] = this.clonedMaterial[mat.id as number];
    delete this.clonedMaterial[mat.id as number];
  }
  //Detalhe requisição
  async showDialogDetails(requesId: number) {
    this.loadingService.show();
    const resultRequest = await this.filterRequestId(requesId);
    if (resultRequest.status == 200) {
      this.listMaterialDetailsRequest.set(await this.filterMatMecRequesId(requesId));
      const mec = this.listMec().find(mec => mec.id === resultRequest.body?.mechanicId!);
      const dep = this.listMecDepartment().find(d => d.id === mec?.departmentId);

      this.formDetailsRequest.patchValue({
        id: resultRequest.body?.id,
        status: this.getStatusDeliver(resultRequest.body?.status!),
        categoryType: resultRequest.body?.categoryType,
        requestType: resultRequest.body?.requestType,
        requestDate: new Date(resultRequest.body?.requestDate!),
        requestUserId: resultRequest.body?.requestUserId,
        requestUserName: resultRequest.body?.requestUserName,
        requestInformation: resultRequest.body?.requestInformation,
        mechanicName: mec?.name,
        mechanicDepartment: dep?.description
      });
      //Mostra o dialog
      this.visibleDialogDetailsRequest = true;
      //Limpa lista de epi
      this.printEPIList.set([]);
      //desabilita a impressão dos EPIs
      this.isPrintDetailsEPI = true;
      //Verifica se na lista de materiais tem EPI
      for (const item of this.listMaterialDetailsRequest()) {
        const catId = this.listMat().find(m => m.id === item.materialId)?.categoryId;
        const category = this.listCat().find(c => c.id === catId);
        if (category?.type == TypeCategoryEnum.EPI) {
          //habilita a impressão dos EPIs
          this.isPrintDetailsEPI = false;
          //Lista de EPIs
          this.printEPIList.set([... this.printEPIList(), item]);
        }
      }
      if (!this.isPrintDetailsEPI) {
        //print EPI
        this.printEPIRequestId = resultRequest.body?.id!;
        this.printEPIMechanicName = mec?.name!;
        this.printEPIMechanicDep = dep?.description!;
      }
    }
    this.loadingService.hide();
  }

  getStatusDeliver(s: StatusTollControlRequestEnum): string {
    switch (s) {
      case StatusTollControlRequestEnum.DELIVERED:
        return 'Aberto para Entrega';
        break;
      case StatusTollControlRequestEnum.DELIVERY_COMPLETED:
        return 'Fechado para Entrega';
        break;
    }
    return '';
  }

  private async listAllEnabledDepartment(): Promise<MechanicDepartment[]> {
    try {
      return await lastValueFrom(this.departmentService.listAllEnabled());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  hideDialogDetails() {
    this.visibleDialogDetailsRequest = false;
    //Limpa lista de epi
    this.printEPIList.set([]);
    //desabilita a impressão dos EPIs
    this.isPrintDetailsEPI = true;
    //Limpa a lista de materiais
    this.listMaterialDetailsRequest.set([]);
  }
  //print EPI
  printEPI() {
    this.printEPIComponent.print(this.printEPIRequestId, this.printEPIMechanicName, this.printEPIMechanicDep, this.printEPIList());
  }
}
