import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Route, Router, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { Visit } from '@/app/models/crm/visit/visit';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { LoadingService } from '@/app/services/loading/loading.service';

@Component({
  selector: 'app-visit',
  standalone: true,
  imports: [CommonModule, ToastModule, ButtonModule, RouterModule, TableModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './visit.component.html',
  styleUrl: './visit.component.scss',
  providers: [MessageService]
})
export default class VisitComponent implements OnInit {

  visits = signal<Visit[]>([]);

  AGENDA = StatusVisitEnum.AGENDA;
  OPEN = StatusVisitEnum.OPEN;
  CLOSE = StatusVisitEnum.CLOSE;

  constructor(private visitService: VisitService,
    private messageService: MessageService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  private async init() {
    this.visits.set(await this.visitAll());
  }

  async completeScheduling(id: number) {

    this.loadingService.show();
    const result = await this.filterVisit(id);
    this.loadingService.hide();
    if (result.status === 200) {
      this.router.navigate([`/crm/visit/maintenance`], { state: { visit: result.body } });
    } else {

    }

  }

  private async visitAll(): Promise<Visit[]> {
    try {
      return await lastValueFrom(this.visitService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async filterVisit(id: number): Promise<HttpResponse<Visit>> {
    try {
      return await lastValueFrom(this.visitService.visitFilterId(id));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

}
