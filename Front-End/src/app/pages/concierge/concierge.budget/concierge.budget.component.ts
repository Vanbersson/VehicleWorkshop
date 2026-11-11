import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { finalize } from 'rxjs';
import { ConciergeBudget, CONCIERGE_BUDGET_STATUSES, hasConciergeBudgetApproval } from '@/app/models/concierge.budget';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
@Component({
    selector: 'p-concierge-budget',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TableModule, InputTextModule, TagModule],
    templateUrl: './concierge.budget.component.html',
    styleUrl: './concierge.budget.component.scss'
})
export default class ConciergeBudgetComponent implements OnInit {
    readonly budgets = signal<ConciergeBudget[]>([]);
    readonly statusFilter = signal('OpenBudget');
    readonly filters = [
        { value: 'OpenBudget', label: 'Em aberto' },
        { value: 'Approved', label: 'Aprovados' },
        { value: 'CompleteBudget', label: 'Concluídos' },
        { value: 'CancelledBudget', label: 'Cancelados' }
    ];
    readonly filteredBudgets = computed(() => this.budgets().filter((item) => item.status === this.statusFilter()));
    readonly summary = computed(() => ({
        total: this.budgets().length,
        open: this.budgets().filter((item) => item.status === 'OpenBudget').length,
        approved: this.budgets().filter((item) => item.status === 'Approved').length,
        closed: this.budgets().filter((item) => ['CompleteBudget', 'CancelledBudget'].includes(item.status)).length
    }));
    severity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
        return status === 'Approved' ? 'success' : status === 'CancelledBudget' ? 'danger' : status === 'CompleteBudget' ? 'secondary' : status === 'OpenBudget' ? 'info' : 'warn';
    }
    readonly hasApproval = hasConciergeBudgetApproval;
    readonly loading = signal(false);
    readonly error = signal('');
    readonly statuses = CONCIERGE_BUDGET_STATUSES;
    private readonly service = inject(ConciergeBudgetService);
    private readonly destroyRef = inject(DestroyRef);
    ngOnInit(): void {
        this.load();
    }
    selectStatus(status: string): void {
        if (this.loading() || this.statusFilter() === status) return;
        this.statusFilter.set(status);
        this.budgets.set([]);
        this.load();
    }
    load(): void {
        if (this.loading()) return;
        this.loading.set(true);
        this.error.set('');
        this.service
            .list(this.statusFilter())
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (items) => this.budgets.set(items),
                error: (error: unknown) => this.error.set(error instanceof HttpErrorResponse ? error.error?.message || error.error?.emessage || 'Falha ao carregar os orçamentos.' : 'Falha ao carregar os orçamentos.')
            });
    }
}
