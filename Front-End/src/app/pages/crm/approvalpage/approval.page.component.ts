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
import { ApprovalKind, ApprovalPageData } from '@/app/models/crm/approval.page';
import { ApprovalPageService } from '@/app/services/crm/approval.page.service';

@Component({
    selector: 'p-approval-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, CheckboxModule, TagModule],
    templateUrl: './approval.page.component.html',
    styleUrl: './approval.page.component.scss'
})
export default class ApprovalPageComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly service = inject(ApprovalPageService);
    private readonly destroyRef = inject(DestroyRef);
    readonly kind = signal<ApprovalKind>('proposals');
    readonly page = signal<ApprovalPageData | null>(null);
    readonly loading = signal(true);
    readonly busy = signal(false);
    readonly error = signal('');
    readonly file = signal<File | null>(null);
    readonly identity = new FormGroup({ taxId: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(32)] }) });
    readonly confirmation = new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] });
    private token = '';
    private epoch = 0;
    get title() {
        return this.kind() === 'orders' ? 'Pedido' : 'Proposta';
    }
    get relation() {
        return this.kind() === 'orders' ? 'do pedido' : 'da proposta';
    }
    ngOnInit(): void {
        this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            this.epoch++;
            this.token = params.get('token') ?? '';
            this.kind.set(this.route.snapshot.data['kind'] === 'orders' ? 'orders' : 'proposals');
            this.page.set(null);
            this.file.set(null);
            this.error.set('');
            this.busy.set(false);
            this.identity.reset();
            this.confirmation.reset();
            void this.load();
        });
    }
    private current(epoch: number) {
        return epoch === this.epoch && !this.destroyRef.destroyed;
    }
    private handle(error: unknown): void {
        if (error instanceof HttpErrorResponse && error.status === 403 && this.page() && !this.page()!.accessRequired) {
            this.page.set({ accessRequired: true, fileName: null, contentType: null, size: null, signedFileName: null, signedUploadedAt: null, approvedAt: null });
            this.confirmation.reset();
            this.file.set(null);
            this.error.set('Sua confirmação de acesso expirou. Informe novamente o CNPJ ou CPF.');
            return;
        }
        this.error.set(
            error instanceof HttpErrorResponse
                ? error.error?.message || error.error?.emessage || (error.status === 0 ? 'Não foi possível conectar. Tente novamente.' : 'Link indisponível ou expirado. Solicite um novo link ao vendedor.')
                : 'Não foi possível concluir. Tente novamente.'
        );
    }
    async load(): Promise<void> {
        const epoch = this.epoch;
        this.loading.set(true);
        this.error.set('');
        try {
            if (!/^[A-Za-z0-9_-]{43}$/.test(this.token)) {
                this.page.set(null);
                this.error.set('Link inválido. Solicite um novo link ao vendedor.');
                return;
            }
            const result = await lastValueFrom(this.service.load(this.kind(), this.token));
            if (this.current(epoch)) this.page.set(result);
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
            const result = await lastValueFrom(this.service.verify(this.kind(), this.token, this.identity.controls.taxId.value));
            if (this.current(epoch)) {
                this.page.set(result);
                this.identity.reset();
            }
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
    selectFile(event: Event): void {
        const input = event.target as HTMLInputElement,
            file = input.files?.[0] ?? null;
        this.file.set(null);
        this.error.set('');
        if (file && (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf') || !file.size || file.size > 5 * 1024 * 1024)) {
            input.value = '';
            this.error.set('Envie um PDF de até 5 MB.');
            return;
        }
        this.file.set(file);
    }
    async upload(): Promise<void> {
        const file = this.file();
        if (!file || this.busy()) return;
        const epoch = this.epoch;
        this.busy.set(true);
        this.error.set('');
        try {
            await lastValueFrom(this.service.upload(this.kind(), this.token, file));
            const result = await lastValueFrom(this.service.load(this.kind(), this.token));
            if (this.current(epoch)) {
                this.page.set(result);
                this.file.set(null);
            }
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
    async approve(): Promise<void> {
        this.confirmation.markAsTouched();
        if (this.confirmation.invalid || !this.page()?.signedFileName || this.busy()) return;
        const epoch = this.epoch;
        this.busy.set(true);
        this.error.set('');
        try {
            const result = await lastValueFrom(this.service.approve(this.kind(), this.token));
            if (this.current(epoch)) this.page.set(result);
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
    async download(signed = false): Promise<void> {
        if (this.busy()) return;
        const epoch = this.epoch,
            filename = signed ? this.page()?.signedFileName : this.page()?.fileName;
        this.busy.set(true);
        this.error.set('');
        try {
            const blob = await lastValueFrom(this.service.download(this.kind(), this.token, signed));
            if (!this.current(epoch)) return;
            const url = URL.createObjectURL(blob),
                anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = filename ?? 'documento.pdf';
            anchor.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            if (this.current(epoch)) this.handle(error);
        } finally {
            if (this.current(epoch)) this.busy.set(false);
        }
    }
}
