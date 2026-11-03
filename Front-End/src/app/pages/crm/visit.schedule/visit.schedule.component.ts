import { Component, OnInit, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { interval, lastValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { Salesperson } from '@/app/models/crm/salesperson';
import { ClientCompany } from '@/app/models/client.company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { VisitAgenda } from '@/app/models/crm/visit/visit.agenda';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';

@Component({
    selector: 'app-visit-schedule',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePickerModule, ToastModule, ButtonModule, SelectModule, InputTextModule, TextareaModule, TableModule, DialogModule, FilterClientComponent],
    templateUrl: './visit.schedule.component.html',
    styleUrl: './visit.schedule.component.scss',
    providers: [MessageService]
})
export default class VisitScheduleComponent implements OnInit {
    selectedDay = signal(new Date());
    appointments = signal<VisitAgenda[]>([]);
    overdueAppointments = signal<VisitAgenda[]>([]);
    loadingOverdue = signal(false);
    overdueError = signal('');
    visibleOverdue = false;
    private dayRequest = 0;
    private readonly now = signal(Date.now());
    readonly overdueVisits = computed(() =>
        this.overdueAppointments()
            .filter((visit) => new Date(visit.dateVisit).getTime() < this.now())
            .sort((a, b) => new Date(a.dateVisit).getTime() - new Date(b.dateVisit).getTime())
    );
    salespersons = signal<Salesperson[]>([]);
    loading = signal(false);
    loadingSalespersons = signal(false);
    saving = signal(false);
    readonly editingId = signal<number | null>(null);
    readonly openingId = signal<number | null>(null);
    submitted = signal(false);
    loadError = signal('');
    saveError = signal('');
    salespersonError = signal('');
    readonly form = new FormGroup({
        date: new FormControl<Date | null>(new Date(), Validators.required),
        time: new FormControl<Date | null>(null, Validators.required),
        client: new FormControl<ClientCompany | null>(null, Validators.required),
        salesperson: new FormControl<Salesperson | null>(null, Validators.required),
        information: new FormControl('', { nonNullable: true })
    });
    readonly dayAppointments = computed(() =>
        this.appointments()
            .filter((visit) => visit.dateVisit && this.sameDay(new Date(visit.dateVisit), this.selectedDay()))
            .sort((a, b) => new Date(a.dateVisit!).getTime() - new Date(b.dateVisit!).getTime())
    );

    constructor(
        private visitService: VisitService,
        private messageService: MessageService,
        private location: Location
    ) {
        this.form.controls.date.valueChanges.pipe(takeUntilDestroyed()).subscribe((date) => this.selectDay(date));
        interval(60_000)
            .pipe(takeUntilDestroyed())
            .subscribe(() => void this.loadOverdueAppointments());
    }

    ngOnInit(): void {
        void this.loadAppointments();
        void this.loadOverdueAppointments();
        void this.initializeEditing();
    }

    private async initializeEditing(): Promise<void> {
        await this.loadSalespersons();
        const state = this.location.getState() as { editAgendaId?: number };
        if (state?.editAgendaId) await this.editAppointment(state.editAgendaId);
    }

    async editAppointment(id: number): Promise<void> {
        if (this.saving() || this.openingId() !== null || this.loadingSalespersons()) return;
        this.openingId.set(id);
        this.saveError.set('');
        try {
            const response = await lastValueFrom(this.visitService.visitFilterId(id));
            const visit = response.body;
            if (!visit || visit.id !== id) throw new Error('Não foi possível carregar o agendamento.');
            if (visit.status !== StatusVisitEnum.AGENDA) throw new Error('Esta visita não está mais agendada. Atualize a lista.');
            const date = visit.agendaDate ? new Date(visit.agendaDate) : null;
            if (!date || Number.isNaN(date.getTime())) throw new Error('O agendamento não possui uma data válida.');
            const client = Object.assign(new ClientCompany(), { id: visit.clientId, name: visit.clientName, cnpj: visit.clientCNPJ, cpf: visit.clientCPF });
            const salesperson = this.salespersons().find((person) => person.id === visit.salespersonId) ?? null;
            this.editingId.set(id);
            this.selectedDay.set(date);
            this.form.reset({ date, time: new Date(date), client, salesperson, information: visit.agendaInfo ?? '' }, { emitEvent: false });
            this.submitted.set(false);
            this.visibleOverdue = false;
            if (!salesperson) this.saveError.set('Selecione um vendedor habilitado para salvar este agendamento.');
            await this.loadAppointments();
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível abrir o agendamento.'));
        } finally {
            this.openingId.set(null);
        }
    }

    cancelEditing(): void {
        if (this.saving() || this.openingId() !== null) return;
        this.editingId.set(null);
        this.form.reset({ date: this.selectedDay(), time: null, client: null, salesperson: null, information: '' }, { emitEvent: false });
        this.submitted.set(false);
        this.saveError.set('');
    }

    goToToday(): void {
        this.selectDay(new Date());
    }

    selectDay(date: Date | null): void {
        if (!(date instanceof Date) || Number.isNaN(date.getTime()) || this.saving()) return;
        this.selectedDay.set(date);
        if (this.form.controls.date.value !== date) this.form.controls.date.setValue(date, { emitEvent: false });
        void this.loadAppointments();
    }

    selectClient(client: ClientCompany): void {
        if (this.saving()) return;
        this.form.controls.client.setValue(client);
        this.form.controls.client.markAsDirty();
    }

    async loadAppointments(): Promise<void> {
        const request = ++this.dayRequest;
        this.loading.set(true);
        this.loadError.set('');
        try {
            const appointments = await lastValueFrom(this.visitService.listAllAgenda(this.formatDateTime(this.selectedDay())));
            if (!Array.isArray(appointments) || appointments.some((visit) => !visit.dateVisit || Number.isNaN(new Date(visit.dateVisit).getTime()))) {
                throw new Error('O servidor retornou uma agenda com datas inválidas.');
            }
            if (request === this.dayRequest) this.appointments.set(appointments);
        } catch (error: unknown) {
            if (request === this.dayRequest) this.loadError.set(this.errorMessage(error, 'Não foi possível carregar a agenda.'));
        } finally {
            if (request === this.dayRequest) this.loading.set(false);
        }
    }

    formatDateTime(date: Date): string {
        return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    }

    async loadOverdueAppointments(): Promise<void> {
        if (this.loadingOverdue()) return;
        this.loadingOverdue.set(true);
        this.overdueError.set('');
        this.now.set(Date.now());
        try {
            const visits = await lastValueFrom(this.visitService.listOverdueAgenda());
            if (!Array.isArray(visits) || visits.some((visit) => !visit.dateVisit || Number.isNaN(new Date(visit.dateVisit).getTime()))) {
                throw new Error('O servidor retornou visitas atrasadas com datas inválidas.');
            }
            this.now.set(Date.now());
            this.overdueAppointments.set(visits);
        } catch (error: unknown) {
            this.overdueError.set(this.errorMessage(error, 'Não foi possível carregar as visitas atrasadas.'));
        } finally {
            this.loadingOverdue.set(false);
        }
    }

    delayLabel(date: string): string {
        const minutes = Math.floor((this.now() - new Date(date).getTime()) / 60_000);
        if (minutes < 1) return 'Menos de 1 min';
        if (minutes < 60) return minutes + ' min';
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return hours + ' h ' + (minutes % 60) + ' min';
        return Math.floor(hours / 24) + ' d ' + (hours % 24) + ' h';
    }

    async loadSalespersons(): Promise<void> {
        if (this.loadingSalespersons()) return;
        this.loadingSalespersons.set(true);
        this.salespersonError.set('');
        try {
            const people = await lastValueFrom(this.visitService.agendaSalespersons());
            this.salespersons.set(people.filter((person) => person.status === StatusEnabDisabEnum.ENABLED));
            if (!this.form.controls.salesperson.value && this.salespersons().length === 1) this.form.controls.salesperson.setValue(this.salespersons()[0]);
        } catch (error: unknown) {
            this.salespersonError.set(this.errorMessage(error, 'Não foi possível carregar os vendedores.'));
        } finally {
            this.loadingSalespersons.set(false);
        }
    }

    async save(): Promise<void> {
        if (this.saving() || this.openingId() !== null || this.loadingSalespersons()) return;
        this.submitted.set(true);
        this.saveError.set('');
        this.form.markAllAsTouched();
        const { date, time, client, salesperson, information } = this.form.getRawValue();
        if (this.form.invalid || !client?.id || !salesperson?.id) return;
        if (!(date instanceof Date) || Number.isNaN(date.getTime()) || !(time instanceof Date) || Number.isNaN(time.getTime())) {
            this.saveError.set('Informe uma data e um horário válidos.');
            return;
        }
        const scheduled = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes());
        const editingId = this.editingId();
        this.saving.set(true);
        try {
            const data = {
                dateVisit: scheduled.toISOString(),
                clientId: client.id,
                clientName: client.name,
                clientCNPJ: client?.cnpj ?? '',
                clientCPF: client?.cpf ?? '',
                salespersonId: salesperson.id,
                salespersonName: salesperson.name,
                informationAgenda: information.trim()
            };
            const response = await lastValueFrom(editingId ? this.visitService.agendaUpdate({ ...data, id: editingId }) : this.visitService.agendaNew(data));
            if (response.body?.status !== StatusSuccessError.succes) {
                throw new Error(response.body?.message || 'O servidor não confirmou o agendamento. Os dados foram mantidos para tentar novamente.');
            }
            this.selectedDay.set(date);
            this.editingId.set(null);
            this.form.reset({ date, time: null, client: null, salesperson, information: '' });
            this.submitted.set(false);
            this.messageService.add({ severity: 'success', summary: 'Agenda', detail: editingId ? 'Agendamento atualizado com sucesso.' : 'Visita agendada com sucesso.' });
            await this.loadAppointments();
            await this.loadOverdueAppointments();
        } catch (error: unknown) {
            this.saveError.set(this.errorMessage(error, 'Não foi possível agendar a visita. Tente novamente.'));
        } finally {
            this.saving.set(false);
        }
    }

    private sameDay(a: Date, b: Date): boolean {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    private errorMessage(error: unknown, fallback: string): string {
        if (error instanceof HttpErrorResponse) return error.error?.emessage || error.error?.message || fallback;
        return error instanceof Error ? error.message : fallback;
    }
}
