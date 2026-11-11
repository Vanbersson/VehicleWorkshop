import { Injectable, InjectionToken, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import printJS from 'print-js';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { IResale } from '@/app/interfaces/conf-company/i.resale';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { CompanyService } from '@/app/services/company.service';

export const VEHICLE_PRINTER = new InjectionToken<typeof printJS>('Vehicle printer', { providedIn: 'root', factory: () => printJS });

export interface VehiclePrintData {
    vehicle: VehicleEntry;
    client: ClientCompany | null;
    driverEntry: Driver | null;
    driverExit: Driver | null;
}
interface PrintPhoto {
    label: string;
    source: string;
}
const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const field = (label: string, value: unknown): string => `<div class="field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value === null || value === undefined || value === '' ? 'Não informado' : value)}</dd></div>`;
const documentNumber = (value: string): string => {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    if (digits.length === 14) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    return value;
};
const section = (title: string, content: string, kind: string): string => `<section class="document-block ${kind}"><h2>${escapeHtml(title)}</h2><dl>${content}</dl></section>`;
export function vehiclePrintPhotos(data: VehiclePrintData): PrintPhoto[] {
    return ([1, 2, 3, 4] as const).flatMap((index) => {
        const source = data.vehicle[`attendantPhoto${index}Url`];
        return source ? [{ label: `Consultor · Foto ${index}`, source }] : [];
    });
}
export function buildVehiclePrintHtml(data: VehiclePrintData, resale: IResale, photos: PrintPhoto[]): string {
    const v = data.vehicle;
    let html = '<main><header><h1>Dados do veículo</h1></header>';
    html += section('Revenda', field('Nome', resale.name) + field('CNPJ', documentNumber(resale.cnpj)), 'resale-block');
    html += section(
        'Veículo',
        field('Consultor', v.salespersonName) +
            field('Modelo', v.modelDescription) +
            field('Placa', v.vehicleNew === YesNotEnum.YES ? 'Sem placa' : v.vehiclePlate) +
            field('Cor', v.vehicleColor) +
            field('Frota', v.vehicleFleet) +
            field('Saída autorizada', v.authExitStatus === 'Authorized' ? 'Sim' : 'Não') +
            field('Número da O.S.', v.numServiceOrder) +
            field('NF-e', v.numNfe) +
            field('NFS-e', v.numNfse),
        'vehicle-block'
    );
    html += section('Proprietário', field('Código', data.client?.id ?? v.clientCompanyId) + field('Nome / Razão social', data.client?.name || v.clientCompanyName) + field('CNPJ', documentNumber(data.client?.cnpj || '')), 'owner-block');
    html += section('Motorista de entrada', field('Código', data.driverEntry?.id ?? v.driverEntryId) + field('Nome', data.driverEntry?.name || v.driverEntryName), 'driver-block');
    html += section('Motorista de saída', field('Código', data.driverExit?.id ?? v.driverExitId) + field('Nome', data.driverExit?.name || v.driverExitName), 'driver-block');
    html +=
        '<section class="document-block photos-block"><h2>Fotos do consultor</h2>' +
        (photos.length
            ? `<div class="photos">${photos.map((photo) => `<figure>${/^data:image\/(png|jpeg|webp|gif);base64,/i.test(photo.source) ? `<img src="${escapeHtml(photo.source)}" alt="${escapeHtml(photo.label)}" />` : '<div class="missing-photo">Imagem indisponível para impressão</div>'}<figcaption>${escapeHtml(photo.label)}</figcaption></figure>`).join('')}</div>`
            : '<p>Nenhuma foto do consultor cadastrada.</p>') +
        '</section>';
    return html + '</main>';
}
export const VEHICLE_PRINT_STYLES =
    '@page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#000;background:#fff;font-size:9pt;margin:0}main{width:100%;max-width:190mm;margin:0 auto}header{border:1px solid #000;border-bottom:3px solid #000;padding:3mm 2mm;text-align:center}h1{font-size:14pt;font-weight:700;text-transform:uppercase;letter-spacing:.5pt;margin:0}.document-block{margin-top:2mm;break-inside:avoid;page-break-inside:avoid}.document-block h2{font-size:7pt;font-weight:700;line-height:1.2;text-transform:uppercase;letter-spacing:.2pt;margin:0;padding:1mm 1.5mm;border:1px solid #000;background:#eee;break-after:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}dl{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));margin:0;border-left:1px solid #000;border-top:0}.field{min-width:0;border-right:1px solid #000;border-bottom:1px solid #000;padding:1.2mm 1.5mm;min-height:10mm;break-inside:avoid}dt{font-size:6pt;line-height:1.2;text-transform:uppercase;margin:0 0 1mm;font-weight:400}dd{font-size:9pt;font-weight:700;line-height:1.25;margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.resale-block dl{grid-template-columns:minmax(0,1fr) 45mm}.resale-block dd{font-size:10pt}.vehicle-block .field:nth-child(-n+2){grid-column:span 6}.vehicle-block .field:nth-child(n+3):nth-child(-n+6){grid-column:span 3}.vehicle-block .field:nth-child(n+7){grid-column:span 4}.owner-block dl{grid-template-columns:22mm minmax(0,1fr) 45mm}.driver-block dl{grid-template-columns:22mm minmax(0,1fr)}.photos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:2mm;border:1px solid #000;border-top:0;padding:2mm;break-inside:avoid;page-break-inside:avoid}figure{margin:0;border:1px solid #888;padding:1mm;min-width:0;break-inside:avoid}figure img{display:block;width:100%;height:30mm;object-fit:contain}figcaption{font-size:6pt;line-height:1.2;text-align:center;margin-top:1mm}.missing-photo{height:30mm;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7pt;color:#555}.photos-block>p{border:1px solid #000;border-top:0;margin:0;padding:2mm;font-size:8pt}';

@Injectable({ providedIn: 'root' })
export class VehiclePrintService {
    private readonly companies = inject(CompanyService);
    private readonly printer = inject(VEHICLE_PRINTER);
    async print(data: VehiclePrintData, warn: (message: string) => void): Promise<void> {
        const v = data.vehicle;
        const resales = await lastValueFrom(this.companies.resales(v.companyId!));
        const resale = resales.find((r) => r.id === v.resaleId && r.companyId === v.companyId);
        if (!resale) throw new Error('Não foi possível carregar os dados da revenda para a impressão.');
        const photos = await Promise.all(vehiclePrintPhotos(data).map(async (photo) => ({ ...photo, source: await this.loadPhoto(photo.source) })));
        const missing = photos.filter((p) => !p.source).length;
        if (missing) warn(`${missing} imagem(ns) não puderam ser carregadas. Elas serão identificadas como indisponíveis no relatório.`);
        await this.openPrintDialog(v.id!, buildVehiclePrintHtml(data, resale, photos));
    }
    private async loadPhoto(source: string): Promise<string> {
        try {
            let data = source;
            if (!/^data:image\/(png|jpeg|webp|gif);base64,/i.test(source)) {
                const url = new URL(source, window.location.href);
                if (!['http:', 'https:'].includes(url.protocol)) return '';
                const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
                if (!response.ok) return '';
                const blob = await response.blob();
                if (!/^image\/(png|jpeg|webp|gif)$/i.test(blob.type)) return '';
                data = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(String(reader.result));
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }
            const image = new Image();
            image.src = data;
            await image.decode();
            return data;
        } catch {
            return '';
        }
    }
    private openPrintDialog(id: number, printable: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.printer({
                type: 'raw-html',
                documentTitle: `Veículo - Atendimento ${id}`,
                printable,
                style: VEHICLE_PRINT_STYLES,
                onError: reject,
                onLoadingEnd: resolve,
                onPrintDialogClose: resolve
            });
        });
    }
}
