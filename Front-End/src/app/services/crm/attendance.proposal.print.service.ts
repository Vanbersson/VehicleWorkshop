import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import printJS from 'print-js';
import { CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { Visit } from '@/app/models/crm/visit/visit';
import { ClientCompany } from '@/app/models/client.company';
import { CompanyService } from '@/app/services/company.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';

const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const field = (label: string, value: unknown): string => `<div class="field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value || 'Não informado')}</dd></div>`;
const document = (value: string | null | undefined): string => {
    const digits = (value ?? '').replace(/\D/g, '');
    if (digits.length === 14) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    return value ?? '';
};
const phone = (value: string | null | undefined, ddd = ''): string => {
    if (!value) return '';
    const digits = `${ddd}${value}`.replace(/\D/g, '');
    if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    return [ddd, value].filter(Boolean).join(' ');
};
interface PostalAddress {
    address?: string;
    addressNumber?: string;
    addressComplement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}
const address = (data: PostalAddress | null): string => {
    if (!data) return '';
    return [[data.address, data.addressNumber].filter(Boolean).join(', '), data.addressComplement, data.neighborhood, [data.city, data.state].filter(Boolean).join(' / '), data.zipCode ? `CEP ${data.zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}` : '']
        .filter(Boolean)
        .join(' · ');
};

@Injectable({ providedIn: 'root' })
export class AttendanceProposalPrintService {
    private readonly companies = inject(CompanyService);
    private readonly salespersons = inject(SalespersonService);
    private readonly clients = inject(ClientCompanyService);

    async print(attendance: CustomerAttendance, visit: Visit, onError: (error: unknown) => void): Promise<void> {
        if (!visit.companyId || !visit.resaleId) throw new Error('Não foi possível identificar a revenda da visita.');
        const [resales, salespersonResponse, clientResponse] = await Promise.all([
            lastValueFrom(this.companies.resales(visit.companyId)),
            lastValueFrom(this.salespersons.filterId(attendance.salespersonId)),
            attendance.clientId ? lastValueFrom(this.clients.filterId(attendance.clientId)) : Promise.resolve(null)
        ]);
        const resale = resales.find((item) => item.id === visit.resaleId && item.companyId === visit.companyId);
        if (!resale) throw new Error('Não foi possível localizar os dados da revenda da visita.');
        const salesperson = salespersonResponse.body;
        if (!salesperson) throw new Error('Não foi possível carregar os dados do vendedor.');
        if (clientResponse && (clientResponse.body?.status !== StatusSuccessError.succes || !clientResponse.body.data)) throw new Error('Não foi possível carregar os dados do cliente.');
        const client: ClientCompany | null = clientResponse?.body?.data ?? null;
        const clientDocument = client ? client.cnpj || client.cpf : visit.clientCNPJ || visit.clientCPF;
        const printable = `<main>
            <header><p class="eyebrow">${escapeHtml(resale.name)}</p><h1>Proposta comercial</h1><p class="reference">Atendimento #${attendance.id} · Visita #${attendance.visitId}</p></header>
            <section><h2>Revenda</h2><dl>
                ${field('Razão social / Nome', resale.name)}${field('CNPJ', document(resale.cnpj))}
                ${field('Endereço', address(resale))}${field('Telefone', phone(resale.phone))}${field('Celular', phone(resale.cellphone))}${field('E-mail', resale.email)}
            </dl></section>
            <section><h2>Vendedor</h2><dl>
                ${field('Nome', salesperson.name || attendance.salespersonName)}${field('Código', salesperson.id)}${field('Celular', phone(salesperson.cellphone, salesperson.dddCellphone))}
            </dl></section>
            <section><h2>Cliente</h2><dl>
                ${field('Nome / Razão social', client?.name || attendance.clientName)}${client?.fantasia ? field('Apelido / Nome fantasia', client.fantasia) : ''}
                ${field('CPF / CNPJ', document(clientDocument))}${field('Endereço', address(client))}
                ${field('Telefone', phone(client?.phone, client?.dddPhone))}${field('Celular', phone(client?.cellphone, client?.dddCellphone))}
                ${field('E-mail', [client?.emailWork, client?.emailHome].filter(Boolean).join(' / '))}
                ${client?.contactName ? field('Pessoa de contato', client.contactName) : ''}
                ${!client && visit.contact ? field('Contato informado na visita', visit.contact) : ''}
            </dl></section>
            <section class="proposal-section"><h2>Descrição da proposta</h2><div class="proposal">${escapeHtml(attendance.proposalNotes)}</div></section>
        </main>`;
        this.openPrintDialog(attendance.id, printable, onError);
    }

    private openPrintDialog(id: number, printable: string, onError: (error: unknown) => void): void {
        printJS({
            type: 'raw-html',
            documentTitle: `Proposta comercial - Atendimento ${id}`,
            printable,
            style: '@page { size: A4; margin: 15mm; } body { font-family: Arial, sans-serif; color: #172033; font-size: 10pt; } header { border-bottom: 2px solid #172033; padding-bottom: 12px; } .eyebrow { font-size: 11pt; font-weight: bold; margin: 0; } h1 { font-size: 22pt; margin: 8px 0; } .reference { color: #555; margin: 0; } section { margin-top: 18px; break-inside: avoid; } h2 { font-size: 12pt; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid #ddd; } dl { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; margin: 0; } .field { break-inside: avoid; } dt { color: #555; font-size: 9pt; } dd { margin: 3px 0 0; overflow-wrap: anywhere; } .proposal-section { break-inside: auto; } .proposal { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }',
            onError
        });
    }
}
