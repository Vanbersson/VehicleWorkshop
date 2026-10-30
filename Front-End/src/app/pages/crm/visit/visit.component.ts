import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

import { Visit } from '@/app/models/crm/visit/visit';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';
import { lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '@/app/services/loading/loading.service';

@Component({
    selector: 'app-visit',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, ButtonModule, RouterModule, TableModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, TagModule],
    templateUrl: './visit.component.html',
    styleUrl: './visit.component.scss',
    providers: [MessageService]
})
export default class VisitComponent implements OnInit {
    visits = signal<Visit[]>([]);
    loading = signal(false);
    loadError = signal('');
    openingId = signal<number | null>(null);
    selectedStatus: StatusVisitEnum | null = null;
    readonly statusOptions = [
        { label: 'Agendada', value: StatusVisitEnum.AGENDA },
        { label: 'Em andamento', value: StatusVisitEnum.OPEN },
        { label: 'Concluída', value: StatusVisitEnum.CLOSE }
    ];

    AGENDA = StatusVisitEnum.AGENDA;
    OPEN = StatusVisitEnum.OPEN;
    CLOSE = StatusVisitEnum.CLOSE;

    constructor(
        private visitService: VisitService,
        private messageService: MessageService,
        private router: Router,
        private loadingService: LoadingService
    ) {}

    ngOnInit(): void {
        void this.loadVisits();
    }

    clearFilters(table: Table, search: HTMLInputElement): void {
        table.clear();
        search.value = '';
        this.selectedStatus = null;
    }

    async loadVisits(): Promise<void> {
        if (this.loading()) return;
        this.loading.set(true);
        this.loadError.set('');
        try {
            this.visits.set(await lastValueFrom(this.visitService.listAll()));
        } catch (error: unknown) {
            this.loadError.set(this.errorMessage(error, 'Não foi possível carregar as visitas. Tente atualizar a lista.'));
        } finally {
            this.loading.set(false);
        }
    }

    async completeScheduling(id: number): Promise<void> {
        if (this.openingId() !== null) return;
        this.openingId.set(id);
        this.loadingService.show();
        try {
            const result = await lastValueFrom(this.visitService.visitFilterId(id));
            if (!result.body) throw new Error('O servidor não retornou os dados da visita.');
            await this.router.navigate(['/crm/visit/maintenance'], { state: { visit: result.body } });
        } catch (error: unknown) {
            this.messageService.add({ severity: 'error', summary: 'Erro ao abrir visita', detail: this.errorMessage(error, 'Não foi possível abrir a visita. Tente novamente.') });
        } finally {
            this.loadingService.hide();
            this.openingId.set(null);
        }
    }

    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
}
