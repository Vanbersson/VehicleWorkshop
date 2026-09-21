import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms'

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PartApolloService } from '@/app/services/parts/part.apollo.service';
import { HttpResponse } from '@angular/common/http';
import { IPartApollo } from '@/app/interfaces/i.part.apollo';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-filter-parts-apollo',
  imports: [CommonModule, ButtonModule, TableModule, DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule, ReactiveFormsModule, IconFieldModule, InputIconModule],
  templateUrl: './filter.parts.apollo.component.html',
  styleUrl: './filter.parts.apollo.component.scss',
})
export class FilterPartsApollo {
  @Output() public outPart = new EventEmitter<IPartApollo>();

  dialogVisible: boolean = false;
  selectPart!: IPartApollo;
  listParts = signal<IPartApollo[]>([])

  formFilter = new FormGroup({
    code: new FormControl<string>(''),
    description: new FormControl<string>(''),
  });
  constructor(private partApolloService: PartApolloService) { }

  showDialog() {
    this.clearForm();
    this.dialogVisible = true;
  }

  hideDialog() {
    this.dialogVisible = false;
  }

  clearForm() {
    this.listParts.set([]);
    this.selectPart = null!;
    this.formFilter.patchValue({ code: '', description: '' });
  }

  async filter(): Promise<void> {
    const { value } = this.formFilter;

    if (value.code?.trim() != '') {
      const result = await this.filterCode(value.code!);
      if (result.status == 200) {
        this.listParts.set(result.body!);
      }
    } else if (value.description?.trim() != '') {
      const result = await this.filterDesc(value.description!);
      if (result.status == 200) {
        this.listParts.set(result.body!);
      }
    }

  }

  selectPartApollo() {
    if (this.selectPart) {
      this.outPart.emit(this.selectPart);
      this.hideDialog();
    }
  }

  private async filterCode(code: string): Promise<HttpResponse<IPartApollo[]>> {
    try {
      return await lastValueFrom(this.partApolloService.filterCode(code));
    } catch (error: any) {
      return error;
    }
  }

  private async filterDesc(desc: string): Promise<HttpResponse<IPartApollo[]>> {
    try {
      return await lastValueFrom(this.partApolloService.filterDesc(desc));
    } catch (error: any) {
      return error;
    }
  }

}
