import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom, forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ToolControlRequestService } from '@/app/services/workshop/tool.control/tool.control.request.service';
import { ToolControlMatMecService } from '@/app/services/workshop/tool.control/tool.control.matmec.service';
import { MechanicService } from '@/app/services/workshop/mechanic.service';
import { ToolControlRequest } from '@/app/models/workshop/tool.control/tool.control.request';
import { ToolControlMatMec } from '@/app/models/workshop/tool.control/tool.control.mat.mec';
import { Mechanic } from '@/app/models/workshop/mechanic';
import { StatusTollControlRequestEnum as RequestStatus } from '@/app/models/workshop/status.tool.control.request.enum';
import { TypeMaterialEnum } from '@/app/models/workshop/type.material.enum';
import { TypeCategoryEnum } from '@/app/models/workshop/type.category.enum';

export interface RequestReportRow extends ToolControlRequest {
    mechanicName: string;
}
export function csvCell(value: unknown): string {
    let text = String(value ?? '');
    if (/^\s*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
}

@Component({
    selector: 'app-request.equipment.report',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, TableModule, SelectModule, DatePickerModule, InputNumberModule, InputTextModule, TagModule, DialogModule],
    templateUrl: './request.equipment.report.component.html',
    styleUrl: './request.equipment.report.component.scss'
})
export default class RequestEquipmentReportComponent implements OnInit {
    private readonly requests = inject(ToolControlRequestService);
    private readonly mechanicService = inject(MechanicService);
    private readonly materials = inject(ToolControlMatMecService);
    readonly loading = signal(false);
    readonly searched = signal(false);
    readonly error = signal('');
    readonly rows = signal<RequestReportRow[]>([]);
    readonly mechanics = signal<Mechanic[]>([]);
    readonly mechanicError = signal('');
    readonly search = signal('');
    readonly selected = signal<RequestReportRow | null>(null);
    readonly detailRows = signal<ToolControlMatMec[]>([]);
    readonly detailLoading = signal(false);
    readonly detailError = signal('');
    detailVisible = false;
    private detailVersion = 0;
    readonly statuses = [
        { label: 'Aberta', value: RequestStatus.OPEN },
        { label: 'Entregue', value: RequestStatus.DELIVERED },
        { label: 'Entrega concluída', value: RequestStatus.DELIVERY_COMPLETED },
        { label: 'Devolvida', value: RequestStatus.RETURNED }
    ];
    readonly types = [
        { label: 'Empréstimo', value: TypeMaterialEnum.LOAN },
        { label: 'Kit', value: TypeMaterialEnum.KIT }
    ];
    readonly categories = Object.values(TypeCategoryEnum);
    readonly form = new FormGroup({
        start: new FormControl<Date | null>(null),
        end: new FormControl<Date | null>(null),
        mechanicId: new FormControl<number | null>(null),
        status: new FormControl<RequestStatus | null>(null),
        type: new FormControl<TypeMaterialEnum | null>(null),
        category: new FormControl<TypeCategoryEnum | null>(null),
        id: new FormControl<number | null>(null)
    });
    readonly visibleRows = computed(() => {
        const normalize = (value: string) =>
            value
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase('pt-BR');
        const query = normalize(this.search().trim());
        return this.rows().filter((row) => normalize([row.id, row.mechanicName, this.statusLabel(row.status), this.typeLabel(row.requestType), row.categoryType, row.requestUserName, row.requestInformation].join(' ')).includes(query));
    });
    readonly summary = computed(() => {
        const rows = this.visibleRows();
        return {
            total: rows.length,
            open: rows.filter((row) => row.status === RequestStatus.OPEN).length,
            delivered: rows.filter((row) => row.status === RequestStatus.DELIVERED || row.status === RequestStatus.DELIVERY_COMPLETED).length,
            returned: rows.filter((row) => row.status === RequestStatus.RETURNED).length
        };
    });
    ngOnInit(): void {
        void this.loadMechanics();
    }
    async loadMechanics(): Promise<void> {
        this.mechanicError.set('');
        try {
            this.mechanics.set(await firstValueFrom(this.mechanicService.listAll()));
        } catch {
            this.mechanicError.set('Não foi possível carregar os mecânicos. Tente novamente.');
        }
    }
    statusLabel(status: RequestStatus): string {
        return this.statuses.find((item) => item.value === status)?.label ?? status;
    }
    typeLabel(type: TypeMaterialEnum): string {
        return this.types.find((item) => item.value === type)?.label ?? type;
    }
    severity(status: RequestStatus): 'info' | 'success' | 'secondary' {
        return status === RequestStatus.OPEN ? 'info' : status === RequestStatus.RETURNED ? 'secondary' : 'success';
    }
    async consult(): Promise<void> {
        if (this.loading()) return;
        this.error.set('');
        const filters = this.form.getRawValue();
        const start = filters.start ? new Date(filters.start).setHours(0, 0, 0, 0) : null;
        const end = filters.end ? new Date(filters.end).setHours(23, 59, 59, 999) : null;
        if (start !== null && end !== null && start > end) {
            this.error.set('A data inicial deve ser anterior ou igual à data final.');
            return;
        }
        this.loading.set(true);
        this.rows.set([]);
        this.search.set('');
        try {
            // The mechanic endpoint returns only open/delivered requests, omitting history.
            const calls = (filters.status ? [filters.status] : this.statuses.map((item) => item.value)).map((status) => this.requests.listRequestStatus(status));
            const results = await firstValueFrom(forkJoin(calls));
            const unique = new Map<number, ToolControlRequest>();
            results.flat().forEach((row) => {
                if (row.id !== null) unique.set(row.id, row);
            });
            const rows = [...unique.values()]
                .filter((row) => {
                    const date = row.requestDate ? new Date(row.requestDate).getTime() : NaN;
                    return (
                        (filters.mechanicId === null || row.mechanicId === filters.mechanicId) &&
                        (filters.status === null || row.status === filters.status) &&
                        (filters.type === null || row.requestType === filters.type) &&
                        (filters.category === null || row.categoryType === filters.category) &&
                        (filters.id === null || row.id === filters.id) &&
                        (start === null || date >= start) &&
                        (end === null || date <= end)
                    );
                })
                .map((row) => ({ ...row, mechanicName: this.mechanics().find((mechanic) => mechanic.id === row.mechanicId)?.name || `Mecânico #${row.mechanicId ?? '—'}` }));
            this.rows.set(rows.sort((a, b) => (b.id ?? 0) - (a.id ?? 0)));
        } catch {
            this.error.set('Não foi possível consultar as requisições. Tente novamente.');
        } finally {
            this.searched.set(true);
            this.loading.set(false);
        }
    }
    clear(): void {
        if (this.loading()) return;
        this.form.reset();
        this.rows.set([]);
        this.search.set('');
        this.error.set('');
        this.searched.set(false);
    }
    async openDetails(row: RequestReportRow): Promise<void> {
        const version = ++this.detailVersion;
        this.selected.set(row);
        this.detailVisible = true;
        this.detailRows.set([]);
        this.detailError.set('');
        this.detailLoading.set(true);
        try {
            const rows = await firstValueFrom(this.materials.filterRequesId(row.id!));
            if (version === this.detailVersion) this.detailRows.set(rows);
        } catch {
            if (version === this.detailVersion) this.detailError.set('Não foi possível carregar os materiais desta requisição.');
        } finally {
            if (version === this.detailVersion) this.detailLoading.set(false);
        }
    }
    private exportRows(): unknown[][] {
        return [
            ['Requisição', 'Data da requisição', 'Mecânico', 'Tipo', 'Categoria', 'Status', 'Solicitante', 'Observações'],
            ...this.visibleRows().map((row) => [row.id, this.formatDate(row.requestDate), row.mechanicName, this.typeLabel(row.requestType), row.categoryType, this.statusLabel(row.status), row.requestUserName, row.requestInformation])
        ];
    }
    private formatDate(value: string | Date): string {
        const date = new Date(value);
        return value && !isNaN(date.getTime()) ? date.toLocaleString('pt-BR') : '—';
    }
    exportCsv(): void {
        if (!this.visibleRows().length) return;
        const blob = new Blob(
            [
                '\ufeff' +
                    this.exportRows()
                        .map((row) => row.map(csvCell).join(';'))
                        .join('\r\n')
            ],
            { type: 'text/csv;charset=utf-8;' }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'relatorio-requisicoes.csv';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    print(): void {
        if (!this.visibleRows().length) return;
        const popup = window.open('', '_blank');
        if (!popup) {
            this.error.set('Permita a abertura da janela de impressão no navegador.');
            return;
        }
        const escape = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
        const [headers, ...rows] = this.exportRows();
        popup.document.write(
            `<html lang="pt-BR"><head><title>Relatório de requisições</title><style>@page{size:A4 landscape;margin:12mm}body{font:11px Arial;color:#111}table{border-collapse:collapse;width:100%}th,td{padding:7px;border:1px solid #bbb;text-align:left;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}h1{font-size:20px}</style></head><body><h1>Requisições de equipamentos</h1><p>Gerado em ${escape(new Date().toLocaleString('pt-BR'))} · ${rows.length} requisição(ões) · Resultados da consulta e busca atuais</p><table><thead><tr>${headers.map((value) => `<th>${escape(value)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((value) => `<td>${escape(value)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`
        );
        popup.document.close();
        popup.focus();
        popup.print();
    }
}
