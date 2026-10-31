import { Resale } from '@/app/models/company';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';

export const PURCHASE_PRINT_STYLES = `
@page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;color:#111;background:#fff;font:10px Arial,sans-serif}.purchase{width:100%}header{display:flex;border:1.5px solid #111;margin-bottom:7px;break-inside:avoid}.issuer{flex:1;padding:12px;min-width:0;overflow-wrap:anywhere}.issuer h1{font-size:17px;margin:0 0 9px;text-transform:uppercase}.issuer p{margin:5px 0}.order{width:170px;flex-shrink:0;border-left:1px solid #111;text-align:center;padding:12px 8px}.order h2{font-size:13px;margin:0 0 8px}.order strong{font-size:22px;display:block;margin:8px 0}.section-title{margin:9px 0 0;background:#eee;border:1px solid #333;padding:5px 7px;font-size:10px;text-transform:uppercase;letter-spacing:.6px}.fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-left:1px solid #333;border-top:1px solid #333}.field{padding:6px 7px;border-right:1px solid #333;border-bottom:1px solid #333;overflow-wrap:anywhere}.field span{display:block;font-size:8px;text-transform:uppercase;color:#444;margin-bottom:4px}.field b{font-size:10px;font-weight:normal}.wide{grid-column:span 2}table{border-collapse:collapse;width:100%;table-layout:fixed;margin-top:8px}thead{display:table-header-group}th{background:#eee;text-align:left;font-size:9px}td,th{border:1px solid #555;padding:6px 5px;overflow-wrap:anywhere}tr{break-inside:avoid}.number{text-align:right}.totals{display:flex;justify-content:flex-end;margin-top:8px;break-inside:avoid}.totals div{min-width:135px;border:1px solid #333;padding:8px}.totals span{display:block;font-size:9px;margin-bottom:5px}.totals b{font-size:12px}.grand{background:#eee}.notes{white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid #333;border-top:0;padding:8px;min-height:40px}.signatures{display:flex;gap:45px;padding:40px 25px 8px;text-align:center;break-inside:avoid}.signatures div{flex:1;border-top:1px solid #333;padding-top:6px}.signatures small{display:block;margin-top:5px;color:#444}
`;
const escape = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const value = (input: unknown): string => escape(input === null || input === undefined || input === '' ? 'Não informado' : input);
const numeric = (input: number | null): number => (Number.isFinite(input) ? input! : 0);
const money = (input: number): string => input.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 });
const date = (input: string | Date): string => {
    if (!input) return 'Não informada';
    const parsed = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input) ? new Date(`${input}T12:00:00`) : new Date(input);
    return Number.isNaN(parsed.getTime()) ? 'Não informada' : parsed.toLocaleDateString('pt-BR');
};
const field = (label: string, input: unknown, wide = false): string => `<div class="field${wide ? ' wide' : ''}"><span>${label}</span><b>${value(input)}</b></div>`;
const phone = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11 ? digits.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3') : input;
};

export function purchasePrintHtml(order: PurchaseOrder, resale: Resale, stock: PurchaseOrderItem[], consumption: PurchaseOrderItemCons[]): string {
    const items = [
        ...(order.type !== TypePurchaseOrderEnum.CONSUMO ? stock.map((item) => ({ ...item, description: item.itemDescription, code: item.itemCode })) : []),
        ...(order.type !== TypePurchaseOrderEnum.ESTOQUE ? consumption.map((item) => ({ ...item, code: '—' })) : [])
    ];
    const gross = items.reduce((total, item) => total + numeric(item.price) * numeric(item.quantity), 0);
    const discount = items.reduce((total, item) => total + numeric(item.discount), 0);
    const rawCnpj = resale.cnpj || '';
    const cnpj = rawCnpj.replace(/\D/g, '').length === 14 ? rawCnpj.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : rawCnpj;
    const contactPhone = [order.attendantDddCellphone, order.attendantCellphone].filter(Boolean).join('') || [order.attendantDddPhone, order.attendantPhone].filter(Boolean).join('');
    return `<main class="purchase"><header><div class="issuer"><h1>${value(resale.name)}</h1><p><b>CNPJ:</b> ${value(cnpj)} &nbsp; <b>Inscrição estadual:</b> ${value(resale.ie)}</p><p><b>Telefone:</b> ${value(phone(resale.phone || resale.cellphone || ''))}</p></div><div class="order"><h2>PEDIDO DE COMPRA</h2><strong>Nº ${escape(order.id ?? '—')}</strong><div>${escape(order.type)} · ${date(order.generationDate)}</div></div></header>
  <h3 class="section-title">Fornecedor e condições de compra</h3><div class="fields">${field('Fornecedor', order.clientCompanyName, true)}${field('Código do fornecedor', order.clientCompanyId)}${field('Contato / vendedor', order.attendantName)}${field('Telefone do contato', phone(contactPhone))}${field('E-mail', order.attendantEmail)}${field('Condição de pagamento', order.paymentTypeDesc)}${field('Previsão de entrega', date(order.dateDelivery))}${field('Nota fiscal / série', order.nfNum ? `${order.nfNum}${order.nfSerie ? ` / ${order.nfSerie}` : ''}` : '')}</div>
  <table><colgroup><col style="width:12%"><col style="width:34%"><col style="width:9%"><col style="width:15%"><col style="width:14%"><col style="width:16%"></colgroup><thead><tr><th>Código</th><th>Descrição dos itens</th><th class="number">Qtd.</th><th class="number">Valor unitário</th><th class="number">Desconto</th><th class="number">Total</th></tr></thead><tbody>${items.map((item) => `<tr><td>${escape(item.code)}</td><td>${escape(item.description)}</td><td class="number">${numeric(item.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}</td><td class="number">${money(numeric(item.price))}</td><td class="number">${money(numeric(item.discount))}</td><td class="number">${money(numeric(item.price) * numeric(item.quantity) - numeric(item.discount))}</td></tr>`).join('') || '<tr><td colspan="6">Nenhum item informado.</td></tr>'}</tbody></table>
  <div class="totals"><div><span>Total bruto</span><b>${money(gross)}</b></div><div><span>Descontos</span><b>${money(discount)}</b></div><div class="grand"><span>Total do pedido</span><b>${money(gross - discount)}</b></div></div><h3 class="section-title">Observações</h3><div class="notes">${value(order.information)}</div><div class="signatures"><div>${value(order.responsibleUserName)}<small>Comprador</small></div><div>Autorização<small>Responsável</small></div></div></main>`;
}
