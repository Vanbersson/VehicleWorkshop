import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ATTENDANCE_STAGES, AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';

import { CustomerAttendanceService } from '@/app/services/crm/customer.attendance.service';

import { InputNumberModule } from 'primeng/inputnumber';
import { AttendanceQueryMode } from '@/app/models/crm/customer.attendance';

@Component({
    selector: 'p-customer-attendance',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, ButtonModule, TagModule, SelectModule, DialogModule, InputTextModule, TextareaModule, PaginatorModule, SkeletonModule, ToastModule, InputNumberModule],
    templateUrl: './new.customer.component.html',
    styleUrl: './new.customer.component.scss',
    providers: [MessageService]
})
export default class NewCustomerComponent implements OnInit {
    readonly stages = ATTENDANCE_STAGES;

    readonly CANCELLED = AttendanceStatus.CANCELLED;

    readonly cancelling = signal<CustomerAttendance | null>(null);

    readonly cancelError = signal('');

    cancellationVisible = false;

    readonly cancelForm = new FormGroup({ reason: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(2000)] }) });

    readonly items = signal<CustomerAttendance[]>([]);

    readonly loading = signal(false);

    readonly saving = signal(false);

    readonly loadError = signal('');

    readonly queryMode = signal<AttendanceQueryMode>('ACTIVE');

    readonly queryError = signal('');

    private queryRequest = 0;

    readonly queryForm = new FormGroup({
        id: new FormControl<number | null>(null, Validators.min(1)),
        clientName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
        salespersonName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] })
    });

    readonly queryStages = computed(() =>
        this.stages.filter(
            (stage) =>
                (stage.value !== AttendanceStatus.PAYMENT_PENDING || this.items().some((item) => item.status === AttendanceStatus.PAYMENT_PENDING)) &&
                (this.queryMode() === 'CANCELLED' ? stage.value === this.CANCELLED : stage.value !== this.CANCELLED)
        )
    );

    readonly statusFilter = signal<AttendanceStatus | null>(null);

    readonly first = signal(0);

    readonly highlightedVisitId: number;
    readonly createdAttendanceId: number;

    readonly filteredItems = computed(() => {
        return this.items()
            .filter((item) => (this.queryMode() === 'CANCELLED' ? item.status === this.CANCELLED : item.status !== this.CANCELLED) && (!this.statusFilter() || item.status === this.statusFilter()))
            .sort((a, b) => Number(b.visitId === this.highlightedVisitId) - Number(a.visitId === this.highlightedVisitId) || new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());
    });

    readonly pageItems = computed(() => this.filteredItems().slice(this.first(), this.first() + 12));

    readonly counts = computed(() => this.queryStages().map((stage) => ({ ...stage, count: this.items().filter((item) => item.status === stage.value).length })));

    async load(): Promise<void> {
        if (this.saving()) return;
        const request = ++this.queryRequest;
        this.loading.set(false);
        this.queryError.set('');
        const filters = this.queryForm.getRawValue();
        filters.clientName = filters.clientName.trim();
        filters.salespersonName = filters.salespersonName.trim();
        if (this.queryForm.invalid) {
            this.queryError.set('Revise o código e os nomes informados.');
            return;
        }
        const hasFilters = filters.id !== null || !!filters.clientName || !!filters.salespersonName;
        const mode = this.queryMode();
        if (mode === 'CANCELLED' && !hasFilters) {
            this.items.set([]);
            this.queryError.set('Informe o código do atendimento, cliente ou vendedor para consultar cancelados.');
            return;
        }
        this.loading.set(true);
        this.loadError.set('');
        try {
            const result = await lastValueFrom(hasFilters ? this.service.search(mode, filters) : this.service.list());
            if (request === this.queryRequest) {
                this.items.set(result);
                this.first.set(0);
            }
        } catch (error: unknown) {
            if (request === this.queryRequest) this.loadError.set(this.errorMessage(error, 'Não foi possível carregar os atendimentos.'));
        } finally {
            if (request === this.queryRequest) this.loading.set(false);
        }
    }

    changeQueryMode(mode: AttendanceQueryMode): void {
        if (this.saving() || mode === this.queryMode()) return;
        ++this.queryRequest;
        this.queryMode.set(mode);
        this.loading.set(false);
        this.items.set([]);
        this.loadError.set('');
        this.queryError.set('');
        this.statusFilter.set(null);
        this.first.set(0);
        this.queryForm.reset({ id: null, clientName: '', salespersonName: '' });
        if (mode === 'ACTIVE') void this.load();
    }

    clearQuery(): void {
        ++this.queryRequest;
        this.loading.set(false);
        this.items.set([]);
        this.loadError.set('');
        this.queryError.set('');
        this.statusFilter.set(null);
        this.first.set(0);
        this.queryForm.reset({ id: null, clientName: '', salespersonName: '' });
        if (this.queryMode() === 'ACTIVE') void this.load();
    }

    changeStatus(value: AttendanceStatus | null): void {
        this.statusFilter.set(value);
        this.first.set(0);
    }

    stageFor(status: AttendanceStatus) {
        return this.stages.find((stage) => stage.value === status) ?? this.stages[0];
    }

    openCancellation(item: CustomerAttendance): void {
        if (this.saving() || item.status === this.CANCELLED) return;
        this.cancelling.set(item);
        this.cancelForm.reset({ reason: '' });
        this.cancelError.set('');
        this.cancellationVisible = true;
    }

    async cancel(): Promise<void> {
        const item = this.cancelling();
        if (!item || this.saving() || item.status === this.CANCELLED) return;
        this.cancelForm.markAllAsTouched();
        this.cancelError.set('');
        const reason = this.cancelForm.controls.reason.value.trim();
        if (this.cancelForm.invalid || !reason) {
            this.cancelError.set('Informe o motivo do cancelamento, com até 2000 caracteres.');
            return;
        }
        this.saving.set(true);
        try {
            const result = await lastValueFrom(this.service.cancel({ id: item.id, version: item.version, reason }));
            if (!result?.id || result.status !== this.CANCELLED) throw new Error('O servidor não confirmou o cancelamento.');
            this.items.update((items) => items.map((current) => (current.id === result.id ? result : current)));
            if (this.first() >= this.filteredItems().length) this.first.set(0);
            this.cancellationVisible = false;
            this.cancelling.set(null);
            this.messages.add({ severity: 'success', summary: 'Atendimento cancelado', detail: 'O motivo do cancelamento foi registrado.' });
        } catch (error: unknown) {
            this.cancelError.set(this.errorMessage(error, 'Não foi possível cancelar o atendimento.'));
        } finally {
            this.saving.set(false);
        }
    }

    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
    constructor(
        private service: CustomerAttendanceService,
        private route: ActivatedRoute,
        private messages: MessageService
    ) {
        this.highlightedVisitId = Number(this.route.snapshot.queryParamMap.get('visitId')) || 0;
        this.createdAttendanceId = Number(this.route.snapshot.queryParamMap.get('createdAttendanceId')) || 0;
    }
    ngOnInit(): void {
        void this.load();
    }
}
