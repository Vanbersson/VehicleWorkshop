import { Component, EventEmitter, Input, model, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
//PrimeNG
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { IPartFilter } from '@/app/interfaces/i.part.filter';
import { PartService } from '@/app/services/parts/part.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';

@Component({
  selector: 'app-filter-parts',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, InputTextModule,
    InputGroupModule, DialogModule, ReactiveFormsModule, ToastModule, InputNumberModule],
  templateUrl: './filter.parts.component.html',
  styleUrl: './filter.parts.component.scss',
  providers: [MessageService]
})
export class FilterPartsComponent {
  visiblePart: boolean = false;
  @Output() public outputPart = new EventEmitter<IPartFilter[]>();
  inputParts = model<IPartFilter[]>([]);

  disabledButtonSelected = true;
  disabledButtonDelete = true;


  listParts = signal<IPartFilter[]>([]);
  listPartsSelected = signal<IPartFilter[]>([]);
  selectedPart!: IPartFilter;
  deleteSelectPart!: IPartFilter;
  isUpdatePart: boolean = false;
  totalParts = signal<number>(0.0);
  totalPartsDiscount = signal<number>(0.0);

  formFilterParts = new FormGroup({
    filterCode: new FormControl<string>(''),
    filterDesc: new FormControl<string>(''),
  });

  //Select parts
  visibleSelected: boolean = false;
  descriptionPart: string = "";

  formSelectPart = new FormGroup({
    price: new FormControl<number>(0, Validators.required),
    discount: new FormControl<number>(0, Validators.required),
    quantity: new FormControl<number>(0, Validators.required)
  });

  constructor(private partService: PartService,
    private loadingService: LoadingService,
    private messageService: MessageService) { }

  async showDialogParts() {
    this.listParts.set([]);
    this.listPartsSelected.set([]);
    this.selectedPart = null!;
    this.deleteSelectPart = null!;
    this.totalParts.set(0);
    this.totalPartsDiscount.set(0);
    this.clearFormFilter();
    this.cleanSelected();
    this.visiblePart = true;

    if (this.inputParts().length > 0) {
      for (let i of this.inputParts()) {
        const partsResult = await this.filterCode(i.code);
        if (partsResult.status == 200 && partsResult.body?.status == StatusSuccessError.succes) {
          const part = partsResult.body.data;
          i.unit = part.at(0).unit;
          i.brand = part.at(0).brand;
          i.group = part.at(0).group;
          i.category = part.at(0).category;
        }
      }
      this.listPartsSelected.set([...this.inputParts()]);
      this.updateTotal();
    }
  }

  hideDialogParts() {
    this.visiblePart = false;
    this.outputPart.emit(this.listPartsSelected());
  }

  private showDialogSelectPart() {
    this.visibleSelected = true;
  }
  private hideDialogSelectPart() {
    this.visibleSelected = false;
  }

  selectPartsConfirme() {
    // Verifica se já existe antes de processar
    const alreadyExists = this.listPartsSelected().some(
      p => p.id === this.selectedPart.id
    );

    if (alreadyExists) {
      this.messageService.add({
        severity: 'info',
        summary: 'Peça',
        detail: 'Já adicionada',
        icon: 'pi pi-info-circle'
      });
      return;
    }

    // Reset
    this.formSelectPart.reset({
      price: 0,
      discount: 0,
      quantity: 0
    });
    this.descriptionPart = this.selectedPart.description;
    this.formSelectPart.get('price')?.setValue(this.selectedPart.price);
    this.isUpdatePart = false;
    this.showDialogSelectPart();
  }

  editSelectPart() {
    this.descriptionPart = this.deleteSelectPart.description;
    this.formSelectPart.patchValue({
      price: this.deleteSelectPart.selectPrice,
      discount: this.deleteSelectPart.selectDiscount,
      quantity: this.deleteSelectPart.selectQuantity
    });
    this.isUpdatePart = true;
    this.showDialogSelectPart();
  }

  confirmSelectPart() {
    if (this.isUpdatePart) {
      const { price, quantity, discount } = this.formSelectPart.value;
      // Validação
      if (price! <= 0 || quantity! <= 0 || discount! < 0) return;
      // Desconto maior que o total
      if (discount! > (price! * quantity!)) return;

      if (price == null || quantity == null || discount == null) return;

      this.listPartsSelected().map(i => {
        if (i.code == this.deleteSelectPart.code) {
          i.selectPrice = price;
          i.selectDiscount = discount;
          i.selectQuantity = quantity;
        }
      });
      this.isUpdatePart = false;
      this.deleteSelectPart = null!;
      this.disabledButtonDelete = true;
      // Atualiza totais
      this.updateTotal();
    } else {

      if (this.disabledButtonSelected || !this.selectedPart) return;

      const { price, quantity, discount } = this.formSelectPart.value;

      // Validação
      if (price! <= 0 || quantity! <= 0 || discount! < 0) return;
      // Desconto maior que o total
      if (discount! > (price! * quantity!)) return;

      if (price == null || quantity == null || discount == null) return;

      // Monta objeto (evita mutar diretamente o selectedPart)
      const part = {
        ...this.selectedPart,
        selectPrice: price,
        selectQuantity: quantity,
        selectDiscount: discount
      };
      // Adiciona na lista
      this.listPartsSelected.set([...this.listPartsSelected(), part]);
      // Atualiza totais
      this.updateTotal();
      // Reset
      this.formSelectPart.reset({
        price: 0,
        discount: 0,
        quantity: 0
      });
      this.selectedPart = null!;
      this.disabledButtonSelected = true;
    }
    this.hideDialogSelectPart();
  }

  updateTotal() {
    let tempDiscount = 0;
    let tempPrice = 0;
    for (const i of this.listPartsSelected()) {
      tempDiscount += i.selectDiscount;
      tempPrice += (i.selectPrice * i.selectQuantity) - i.selectDiscount;
    }
    this.totalPartsDiscount.set(tempDiscount);
    this.totalParts.set(tempPrice);
  }

  removerSelectPart() {
    if (!this.disabledButtonDelete && this.deleteSelectPart) {
      this.listPartsSelected.set(this.listPartsSelected().filter(
        p => p.id !== this.deleteSelectPart.id
      ))
      this.disabledButtonDelete = true;
      //Atualiza totais
      this.updateTotal();
    }
  }

  async filterPart() {
    this.loadingService.show();
    //clean selection
    this.cleanSelected();
    //clean parts list
    this.listParts.set([]);
    const { value } = this.formFilterParts;

    if (value.filterCode != '') {
      this.formFilterParts.get('filterDesc')?.setValue("");
      const partsResult = await this.filterCode(value.filterCode!);
      if (partsResult.status == 200 && partsResult.body?.status == StatusSuccessError.succes) {
        this.listParts.set(partsResult.body.data);
      }

    } else if (value.filterDesc != '') {
      const partsResult = await this.filterDesc(value.filterDesc!);
      if (partsResult.status == 200 && partsResult.body?.status == StatusSuccessError.succes) {
        this.listParts.set(partsResult.body.data);
      }
    }
    this.loadingService.hide();
  }
  private async filterCode(code: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.filterCode(code));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async filterDesc(desc: string): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.partService.filterDesc(desc));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  onSelectEventParts(event: any) {
    this.disabledButtonSelected = false;
    this.deleteSelectPart = null!;
    this.disabledButtonDelete = true;
  }

  onUnSelectEventParts(event: any) {
    this.disabledButtonSelected = true;
  }

  onSelectDeleteEventParts(event: any) {
    this.disabledButtonSelected = true;
    this.selectedPart = null!;
    this.disabledButtonDelete = false;
  }
  onUnSelectDeleteEventParts(event: any) {
    this.disabledButtonDelete = true;
  }

  clearFormFilter() {
    this.formFilterParts.patchValue({
      filterCode: "",
      filterDesc: ""
    });
  }
  cleanSelected() {
    this.disabledButtonSelected = true;
    this.disabledButtonDelete = true;
    this.selectedPart = null!;
  }
}
