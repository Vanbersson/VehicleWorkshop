import { Injectable, InjectionToken, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import printJS from 'print-js';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { IResale } from '@/app/interfaces/conf-company/i.resale';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { CompanyService } from '@/app/services/company.service';
import { BrandService } from '@/app/services/brand/brand.service';
import { StatusVehicleAuthEnum } from '@/app/models/status.vehicle.auth.enum';
import { environment } from '@/environments/environment';

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
interface PrintBranding {
    resaleLogo?: string;
    brandLogo?: string;
    brandName?: string;
}
const isEmbeddedImage = (value: string): boolean => /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value);
const escapeHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
const field = (label: string, value: unknown): string => `<div class="field"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value === null || value === undefined || value === '' ? 'Não informado' : value)}</dd></div>`;
const documentNumber = (value: string): string => {
    const digits = (value || '').replace(/\D/g, '');
    if (digits.length === 11) return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    if (digits.length === 14) return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    return value;
};
const section = (title: string, content: string, kind: string): string => `<section class="document-block ${kind}"><h2>${escapeHtml(title)}</h2><dl>${content}</dl></section>`;
function printHeader(resale: IResale, branding: PrintBranding, vehicle: VehicleEntry): string {
    const address = [
        [resale.address, resale.addressNumber, resale.addressComplement].filter(Boolean).join(', '),
        resale.neighborhood,
        [resale.city, resale.state].filter(Boolean).join(' / '),
        resale.zipCode ? `CEP ${resale.zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}` : ''
    ]
        .filter(Boolean)
        .join(' · ');
    const phone = resale.phone?.trim() || resale.cellphone?.trim() || '';
    const digits = phone.replace(/\D/g, '');
    const formattedPhone = /^(\d{10}|\d{11})$/.test(digits) ? digits.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3') : phone;
    const contact = [resale.cnpj ? `CNPJ ${documentNumber(resale.cnpj)}` : '', formattedPhone ? `Telefone ${formattedPhone}` : ''].filter(Boolean).join(' · ');
    const logo = (source: string | undefined, label: string): string => (source && isEmbeddedImage(source) ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(label)}" />` : '');
    const logos = logo(branding.resaleLogo, `Logo da revenda ${resale.name}`) + logo(branding.brandLogo, branding.brandName ? `Logo da marca ${branding.brandName}` : 'Logo da marca');
    return `<header class="print-header">
        <div class="resale-details">
            ${logos ? `<div class="print-logos">${logos}</div>` : ''}
            <p class="resale-name">${escapeHtml(resale.name)}</p>
            ${address ? `<p>${escapeHtml(address)}</p>` : ''}
            ${contact ? `<p>${escapeHtml(contact)}</p>` : ''}
        </div>
        <div class="record-details">
            <h1>Dados do veículo</h1>
            ${vehicle.id != null ? `<p class="record-number">Nº ${escapeHtml(vehicle.id)}</p>` : ''}
        </div>
    </header>`;
}
export function vehiclePrintPhotos(data: VehiclePrintData): PrintPhoto[] {
    return ([1, 2, 3, 4] as const).flatMap((index) => {
        const source = data.vehicle[`attendantPhoto${index}Url`];
        return source ? [{ label: `Consultor · Foto ${index}`, source }] : [];
    });
}
export function buildVehiclePrintHtml(data: VehiclePrintData, resale: IResale, photos: PrintPhoto[], branding: PrintBranding = {}): string {
    const v = data.vehicle;
    let html = `<main>${printHeader(resale, branding, v)}`;
    html += section(
        'Veículo',
        field('Modelo', v.modelDescription) +
            field('Placa', v.vehicleNew === YesNotEnum.YES ? 'Sem placa' : v.vehiclePlate) +
            field('Cor', v.vehicleColor) +
            field('Frota', v.vehicleFleet) +
            field('Saída autorizada', v.authExitStatus === StatusVehicleAuthEnum.AUTH ? 'Sim' : 'Não'),
        'vehicle-block'
    );
    html += section('Atendimento e documentos', field('Consultor', v.salespersonName) + field('Número da O.S.', v.numServiceOrder) + field('NF-e', v.numNfe) + field('NFS-e', v.numNfse), 'service-block');
    html += section('Proprietário', field('Código', data.client?.id ?? v.clientCompanyId) + field('Nome / Razão social', data.client?.name || v.clientCompanyName) + field('CNPJ', documentNumber(data.client?.cnpj || '')), 'owner-block');
    html += '<div class="drivers">';
    html += section('Motorista de entrada', field('Código', data.driverEntry?.id ?? v.driverEntryId) + field('Nome', data.driverEntry?.name || v.driverEntryName), 'driver-block');
    html += section('Motorista de saída', field('Código', data.driverExit?.id ?? v.driverExitId) + field('Nome', data.driverExit?.name || v.driverExitName), 'driver-block');
    html += '</div>';
    html +=
        '<section class="document-block photos-block"><h2>Fotos do consultor</h2>' +
        (photos.length
            ? `<div class="photos">${photos.map((photo) => `<figure>${isEmbeddedImage(photo.source) ? `<img src="${escapeHtml(photo.source)}" alt="${escapeHtml(photo.label)}" />` : '<div class="missing-photo">Imagem indisponível para impressão</div>'}<figcaption>${escapeHtml(photo.label)}</figcaption></figure>`).join('')}</div>`
            : '<p>Nenhuma foto do consultor cadastrada.</p>') +
        '</section>';
    return html + '</main>';
}
export const VEHICLE_PRINT_STYLES = `
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font: 10px/1.45 Arial, sans-serif; color: #202833; background: #fff; margin: 0; }
    main { width: 100%; }
    .print-header {
        display: flex;
        align-items: stretch;
        padding-bottom: 16px;
        border-bottom: 3px solid #26384b;
        break-inside: avoid;
    }
    .resale-details { flex: 1; min-width: 0; padding-right: 20px; overflow-wrap: anywhere; }
    .print-logos { display: flex; align-items: center; gap: 24px; margin-bottom: 14px; }
    .print-logos img { display: block; width: 110px; max-width: 45%; height: 48px; object-fit: contain; object-position: left center; }
    .resale-details p { margin: 3px 0; font-size: 9px; color: #48515c; }
    .resale-details .resale-name { font-size: 15px; font-weight: 700; line-height: 1.3; margin: 0 0 8px; text-transform: uppercase; color: inherit; }
    .record-details { width: 176px; flex-shrink: 0; border-left: 1px solid #cbd1d8; padding: 4px 0 4px 18px; overflow-wrap: anywhere; }
    .record-details h1 { font-size: 10px; margin: 0; letter-spacing: 1px; text-transform: uppercase; }
    .record-number { font-size: 27px; font-weight: 700; line-height: 1.2; margin: 8px 0 0; }
    .document-block { min-width: 0; margin-top: 20px; break-inside: avoid; }
    .document-block h2 {
        font-size: 10px;
        margin: 0;
        padding: 7px 9px;
        border-bottom: 1px solid #cbd1d8;
        background: #eef1f4;
        text-transform: uppercase;
        letter-spacing: 0.7px;
        break-after: avoid;
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
    dl { display: grid; margin: 0; border-left: 1px solid #d8dde3; }
    .field { min-width: 0; padding: 9px; border-right: 1px solid #d8dde3; border-bottom: 1px solid #d8dde3; }
    dt { font-size: 8px; margin-bottom: 4px; color: #59636e; text-transform: uppercase; }
    dd { font-weight: 600; margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
    .vehicle-block dl { grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)) minmax(0, 1.4fr); }
    .service-block dl { grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)); }
    .owner-block dl { grid-template-columns: 20mm minmax(0, 1fr) 41mm; }
    .drivers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3mm; break-inside: avoid; }
    .driver-block dl { grid-template-columns: 20mm minmax(0, 1fr); }
    .photos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 2mm; padding: 2mm; }
    figure { margin: 0; border: 1px solid #d4dce4; padding: 1mm; min-width: 0; break-inside: avoid; }
    figure img { display: block; width: 100%; height: 30mm; object-fit: contain; }
    figcaption { font-size: 7pt; text-align: center; margin-top: 1mm; }
    .missing-photo { height: 30mm; display: grid; place-items: center; text-align: center; font-size: 7pt; }
    .photos-block > p { margin: 0; padding: 2mm; }
`;

@Injectable({ providedIn: 'root' })
export class VehiclePrintService {
    private readonly companies = inject(CompanyService);
    private readonly brands = inject(BrandService);
    private readonly printer = inject(VEHICLE_PRINTER);
    async print(data: VehiclePrintData, warn: (message: string) => void): Promise<void> {
        const v = data.vehicle;
        const resales = await lastValueFrom(this.companies.resales(v.companyId!));
        const resale = resales.find((r) => r.id === v.resaleId && r.companyId === v.companyId);
        if (!resale) throw new Error('Não foi possível carregar os dados da revenda para a impressão.');
        const [photos, branding] = await Promise.all([Promise.all(vehiclePrintPhotos(data).map(async (photo) => ({ ...photo, source: await this.loadPhoto(photo.source) }))), this.loadBranding(resale, warn)]);
        const missing = photos.filter((p) => !p.source).length;
        if (missing) warn(`${missing} imagem(ns) não puderam ser carregadas. Elas serão identificadas como indisponíveis no relatório.`);
        await this.openPrintDialog(v.id!, buildVehiclePrintHtml(data, resale, photos, branding));
    }
    private async loadBranding(resale: IResale, warn: (message: string) => void): Promise<PrintBranding> {
        const brand =
            resale.brandId == null
                ? undefined
                : await lastValueFrom(this.brands.listAll())
                      .then((brands) => brands.find((item) => item.id === resale.brandId))
                      .catch(() => undefined);
        const [resaleLogo, brandLogo] = await Promise.all([this.loadLogo(resale.logoUrl), this.loadLogo(brand?.logoUrl)]);
        if (resale.logoUrl && !resaleLogo) warn('Não foi possível carregar a logo da revenda.');
        if (resale.brandId != null && (!brand || (brand.logoUrl && !brandLogo))) warn('Não foi possível carregar a logo da marca vinculada.');
        return { resaleLogo, brandLogo, brandName: brand?.name };
    }
    private async loadLogo(source: string | null | undefined): Promise<string> {
        if (!source) return '';
        try {
            const url = new URL(source.replace(/^\/+/, ''), environment.apiuUrl.replace(/\/+$/, '') + '/');
            return await this.loadPhoto(url.href);
        } catch {
            return '';
        }
    }
    private async loadPhoto(source: string): Promise<string> {
        try {
            let data = source;
            if (!isEmbeddedImage(source)) {
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
