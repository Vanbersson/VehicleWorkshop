import { Injectable } from '@angular/core';
import printJS from 'print-js';
import { CustomerAttendance } from '@/app/models/crm/customer.attendance';

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);

@Injectable({ providedIn: 'root' })
export class AttendanceProposalPrintService {
    print(attendance: CustomerAttendance, onError: (error: unknown) => void): void {
        printJS({
            type: 'raw-html',
            documentTitle: `Proposta comercial - Atendimento ${attendance.id}`,
            printable: `<main>
                <h1>Proposta comercial</h1>
                <p>Atendimento #${attendance.id} · Visita #${attendance.visitId}</p>
                <dl><dt>Cliente</dt><dd>${escapeHtml(attendance.clientName)}</dd>
                <dt>Vendedor</dt><dd>${escapeHtml(attendance.salespersonName)}</dd></dl>
                <h2>Descrição da proposta</h2>
                <div class="proposal">${escapeHtml(attendance.proposalNotes ?? '')}</div>
            </main>`,
            style: '@page { size: A4; margin: 18mm; } body { font-family: Arial, sans-serif; color: #172033; font-size: 11pt; } h1 { font-size: 22pt; margin-bottom: 6px; } h2 { font-size: 14pt; margin-top: 28px; } dt { color: #555; margin-top: 16px; font-size: 10pt; } dd { margin: 4px 0 0; font-weight: bold; overflow-wrap: anywhere; } .proposal { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }',
            onError
        });
    }
}
