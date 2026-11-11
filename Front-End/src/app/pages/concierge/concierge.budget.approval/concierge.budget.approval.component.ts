import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { ConciergeBudgetApprovalData } from '@/app/models/concierge.budget.approval';
import { ConciergeBudgetApprovalService } from '@/app/services/concierge/concierge.budget.approval.service';
@Component({
    selector: 'p-concierge-budget-approval',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, CheckboxModule, TagModule],
    templateUrl: './concierge.budget.approval.component.html',
    styleUrl: './concierge.budget.approval.component.scss'
})
export class ConciergeBudgetApprovalComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly service = inject(ConciergeBudgetApprovalService);
    private readonly destroyRef = inject(DestroyRef);
    readonly page = signal<ConciergeBudgetApprovalData | null>(null);
    readonly loading = signal(true);
    readonly busy = signal(false);
    readonly error = signal('');
    readonly identity = new FormGroup({ taxId: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(32)] }) });
    readonly confirmation = new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue });
    private token = '';
    private epoch = 0;
    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            ++this.epoch;
            this.token = params.get('token') ?? '';
            this.page.set(null);
            this.error.set('');
            this.busy.set(false);
            this.identity.reset();
            this.confirmation.reset();
            void this.load();
        });
    }
    private current(epoch: number): boolean {
        return epoch === this.epoch && !this.destroyRef.destroyed;
    }
    private handle(error: unknown): void {
        if (error instanceof HttpErrorResponse && error.status === 403 && this.page() && !this.page()!.accessRequired) {
            this.page.set({ ...this.page()!, accessRequired: true, budgetId: null, clientName: null, vehiclePlate: null, fileName: null, size: null, total: null, items: [], approvedAt: null, dateValidation: null });
            this.confirmation.reset();
            this.error.set('Confirme novamente o CPF ou CNPJ para continuar.');
            return;
        }
        this.error.set(error instanceof HttpErrorResponse ? error.error?.message || error.error?.emessage || 'Link indisponível ou expirado. Solicite um novo link ao atendente.' : 'Não foi possível concluir. Tente novamente.');
    }
    async load(): Promise<void> {
        const epoch = this.epoch;
        this.loading.set(true);
        this.error.set('');
        try {
            if (!/^[A-Za-z0-9_-]{43}$/.test(this.token)) {
                this.page.set(null);
                this.error.set('Link inválido. Solicite um novo link ao atendente.');
                return;
            }
            const data = await lastValueFrom(this.service.load(this.token));
            if (this.current(epoch)) this.page.set(data);
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.loading.set(false);
        }
    }
    async verify(): Promise<void> {
        this.identity.markAllAsTouched();
        if (this.identity.invalid || this.busy()) return;
        const epoch = this.epoch;
        this.busy.set(true);
        this.error.set('');
        try {
            const data = await lastValueFrom(this.service.verify(this.token, this.identity.controls.taxId.value));
            if (this.current(epoch)) {
                this.page.set(data);
                this.identity.reset();
            }
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
    async approve(): Promise<void> {
        this.confirmation.markAsTouched();
        const page = this.page();
        if (!page || page.accessRequired || page.approvedAt || this.confirmation.invalid || this.busy()) return;
        const epoch = this.epoch;
        this.busy.set(true);
        this.error.set('');
        try {
            const data = await lastValueFrom(this.service.approve(this.token));
            if (this.current(epoch)) this.page.set(data);
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
    async download(): Promise<void> {
        const page = this.page();
        if (!page || page.accessRequired || !page.fileName || this.busy()) return;
        const epoch = this.epoch;
        this.busy.set(true);
        this.error.set('');
        try {
            const blob = await lastValueFrom(this.service.download(this.token));
            if (!this.current(epoch)) return;
            const url = URL.createObjectURL(blob),
                link = document.createElement('a');
            link.href = url;
            link.download = page.fileName;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
}
