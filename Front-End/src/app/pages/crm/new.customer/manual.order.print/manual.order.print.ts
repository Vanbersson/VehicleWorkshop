import { MANUAL_ORDER_SECTIONS, ManualOrderSection } from '@/app/pages/crm/new.customer/manual.order/manual.order.fields';
import { ManualOrderBranding } from '@/app/pages/crm/new.customer/manual.order/manual.order.branding';
import { MANUAL_ORDER_TERMS_TITLE, MANUAL_ORDER_TERMS_PARAGRAPHS } from './manual.order.terms';

export type ManualOrderValues = Record<string, string | number | null>;
export interface ManualOrderProduct {
    product: string;
    quantity: number;
    unitPrice: number;
    discount: number;
}
export const manualOrderProductTotal = (product: ManualOrderProduct): number => Math.max(0, Math.round(product.unitPrice * product.quantity * 100) - Math.round(product.discount * 100)) / 100;
export const escapeManualOrderHtml = (value: unknown): string => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const amount = (values: ManualOrderValues, key: string): number => Math.max(0, Number(values[key]) || 0);
export function manualOrderTotals(values: ManualOrderValues, additionalProducts: ManualOrderProduct[] = []): { product: number; tires: number; total: number } {
    const product =
        Math.round(
            (manualOrderProductTotal({ product: String(values['product'] ?? ''), unitPrice: amount(values, 'unitPrice'), quantity: amount(values, 'quantity'), discount: amount(values, 'discount') }) +
                additionalProducts.reduce((total, item) => total + manualOrderProductTotal(item), 0)) *
                100
        ) / 100;
    const tires = Math.round((amount(values, 'tire1Quantity') * amount(values, 'tire1Price') + amount(values, 'tire2Quantity') * amount(values, 'tire2Price')) * 100) / 100;
    return { product, tires, total: Math.round((product + tires) * 100) / 100 };
}
const money = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function buildManualOrderHtml(values: ManualOrderValues, additionalProducts: ManualOrderProduct[] = [], branding: ManualOrderBranding = {}): string {
    const e = escapeManualOrderHtml;
    const headerLogo = (data: string | undefined, name: string | undefined, fallback: string): string =>
        data && /^data:image\/(png|jpeg);base64,/i.test(data) ? `<img class="header-logo" src="${e(data)}" alt="${e(name || fallback)}">` : `<span class="header-logo-placeholder">${e(name || fallback)}</span>`;
    const contract = String(values['contract'] ?? '').trim();
    const contractDigits = contract.replace(/\D/g, '');
    const contractNumber =
        /^[\d.\s]*$/.test(contract) && contractDigits.length <= 6
            ? `<div class="contract-number">${Array.from(contract ? contractDigits.padStart(6, '0') : '      ')
                  .map((digit, index) => `${index === 3 ? '<span class="contract-dot">.</span>' : ''}<span class="contract-digit">${e(digit) || '&nbsp;'}</span>`)
                  .join('')}</div>`
            : `<strong class="contract-text">${e(contract)}</strong>`;
    const customerField = (label: string, value: unknown): string => `<div><b>${e(label)}:</b> <span class="customer-value">${e(value) || '&nbsp;'}</span></div>`;
    const documentDigits = String(values['document'] ?? '').replace(/\D/g, '');
    const documentNumber =
        documentDigits.length === 14 ? documentDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : documentDigits.length === 11 ? documentDigits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : values['document'];
    const zipDigits = String(values['zip'] ?? '').replace(/\D/g, '');
    const zip = zipDigits.length === 8 ? zipDigits.replace(/^(\d{5})(\d{3})$/, '$1-$2') : values['zip'];
    const customerCard = `<section class="customer-header">
        <div class="customer-line">${customerField('Cliente/Comprador', values['client'])}<div class="customer-secondary">${customerField('Fone', values['phone'])}${customerField('Cel', values['cellphone'])}</div></div>
        <div class="customer-line">${customerField('Endereço', values['address'])}${customerField('Bairro', values['neighborhood'])}</div>
        <div class="customer-line">${customerField('Cidade', values['city'])}<div class="customer-secondary customer-location">${customerField('UF', values['state'])}${customerField('CEP', zip)}</div></div>
        <div class="customer-line">${customerField('CNPJ/CPF', documentNumber)}${customerField('Inscr. Est./RG/Inscr. Prod. Rural', values['registration'])}</div>
        <div class="customer-line">${customerField('E-mail', values['email'])}${customerField('Contato', values['contact'])}</div>
    </section>`;
    const section = (section: ManualOrderSection, columns = false): string =>
        `<section><h2>${e(section.title)}</h2><div class="${columns ? 'fields' : 'rows'}">${section.fields.map((field) => `<div class="field"><b>${e(field.label)}:</b> <span>${field.numeric && field.key.toLowerCase().includes('price') ? e(money(amount(values, field.key))) : e(values[field.key]) || '&nbsp;'}</span></div>`).join('')}</div></section>`;
    const sections = MANUAL_ORDER_SECTIONS;
    const technicalOptions = (key: string): string => (sections[2].fields.find((field) => field.key === key)?.options ?? []).map((option) => `<span class="technical-option">(${values[key] === option ? 'X' : ' '}) ${e(option)}</span>`).join(' ');
    const technicalCharacteristics = `<section class="product-characteristics"><h2>Características técnicas do produto</h2>
        <div class="characteristics-row"><div><b>Produto:</b> ${e(values['product'])}</div><div><b>Rodado:</b> ${technicalOptions('wheels')}</div></div>
        <div class="characteristics-row"><div><b>Suspensão:</b> ${e(values['suspension'])}</div><div><b>Engate de ar:</b> ${technicalOptions('air')}</div></div>
        <div class="characteristics-row"><div><b>Pintura do chassi:</b> ${e(values['chassis'])}</div><div><b>Sistema elétrico:</b> ${technicalOptions('electric')}</div></div>
        <div class="characteristics-row tractor-options"><div><b>Veículo trator:</b> ${technicalOptions('tractor')}</div></div>
    </section>`;
    const grainOptions = (key: string, options?: { value: string; label: string }[]): string =>
        (options ?? (sections[3].fields.find((field) => field.key === key)?.options ?? []).map((value) => ({ value, label: value })))
            .map((option) => `<span class="grain-option">(${String(values[key] ?? '').trim() === option.value ? 'X' : ' '}) ${e(option.label)}</span>`)
            .join(' ');
    const grainFloorOptions = sections[3].fields.find((field) => field.key === 'grainFloor')?.options ?? [];
    const grainCard = `<section class="grain-card"><h2>Linha Graneleira</h2>
        <div class="grain-row"><b>Comprimento:</b> (${e(values['grainLength']) || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}) ${grainOptions('grainModel')}</div>
        <div class="grain-row"><b>Engate Rodotrem:</b> ${grainOptions('grainCoupling')}</div>
        <div class="grain-row"><b>Assoalho:</b><div class="grain-floor">${[0, 2, 1, 3].map((index) => grainOptions('grainFloor', [{ value: grainFloorOptions[index], label: grainFloorOptions[index] }])).join('')}</div></div>
        <div class="grain-row grain-container"><b>Engate Contêiner:</b> ${grainOptions('grainContainer', [{ value: '4P (1x40)', label: '4P (1x40”)' }])}<br>${grainOptions('grainContainer', [
            { value: '8P (1x40, 2x20)', label: '8P (1x40”, 2x20”)' },
            { value: '12P (1x40, 1x20, 2x20)', label: '12P (1x40”, 1x20”, 2x20”)' }
        ])}</div>
        <div class="grain-row"><b>Sistema de Amarração:</b> ${grainOptions('grainLashing')}</div>
        <div class="grain-row"><b>Pintura da Caixa de Carga:</b> ${e(values['grainPaint'])}</div>
        <div class="grain-row"><b>Altura Tampa Superior:</b> ${grainOptions(
            'grainUpper',
            ['800', '900', '1000'].map((value) => ({ value, label: value }))
        )}</div>
        <div class="grain-row"><b>Altura Tampa Inferior:</b> ${grainOptions(
            'grainLower',
            ['800', '900', '1000'].map((value) => ({ value, label: value }))
        )}</div>
        <div class="grain-row"><b>Tipo de Amarração da Tampa:</b> ${grainOptions('grainTie')}</div>
        <div class="grain-row"><b>Cor da Lona:</b> ${e(values['grainRope'])}</div>
    </section>`;
    const tipperOptions = (key: string): string => (sections[4].fields.find((field) => field.key === key)?.options ?? []).map((option) => `<span class="tipper-option">(${values[key] === option ? 'X' : ' '}) ${e(option)}</span>`).join(' ');
    const tipperCoatingOptions = sections[4].fields.find((field) => field.key === 'tipperCoating')?.options ?? [];
    const tipperCoating = (index: number, label: string): string => `<span class="tipper-option">(${values['tipperCoating'] === tipperCoatingOptions[index] ? 'X' : ' '}) ${e(label)}</span>`;
    const selectedSupports = String(values['tipperSupports'] ?? '')
        .split(',')
        .map((value) => value.trim().toLocaleLowerCase('pt-BR'));
    const tipperSupports = (sections[4].fields.find((field) => field.key === 'tipperSupports')?.options ?? [])
        .map((option) => `<span class="tipper-option">(${selectedSupports.includes(option.toLocaleLowerCase('pt-BR')) ? 'X' : ' '}) ${e(option)}</span>`)
        .join(' ');
    const tipperCard = `<section class="tipper-card"><h2>Linha Basculante</h2>
        <div class="tipper-row"><b>Modelo Caixa de Carga:</b><br>${tipperOptions('tipperModel')}</div>
        <div class="tipper-row"><b>Revestimento:</b> ${tipperCoating(0, 'Aço Alta Res. - Grãos')}<br>${tipperCoating(1, 'Aço Estrutural (SAC 350) - Areia/Brita')}</div>
        <div class="tipper-row"><b>Engate Rodotrem:</b> ${tipperOptions('tipperCoupling')}</div>
        <div class="tipper-row"><b>Volume:</b> ${e(values['tipperVolume'])}</div>
        <div class="tipper-row"><b>Pintura da Caixa de Carga:</b> ${e(values['tipperPaint'])}</div>
        <div class="tipper-row"><b>Cor da Lona:</b> ${e(values['tipperCanvas'])}</div>
        <div class="tipper-row"><b>Porta Traseira:</b> ${tipperOptions('tipperDoor')}</div>
        <div class="tipper-row"><b>Comando Hidráulico:</b> ${tipperOptions('tipperHydraulic')}</div>
        <div class="tipper-row tipper-supports"><b>Suporte:</b> ${tipperSupports}</div>
        <div class="tipper-row"><b>Modelo do Cavalo:</b> ${e(values['tipperTractor'])}</div>
    </section>`;
    const canvasOptions = (key: string): string =>
        (sections[5].fields.find((field) => field.key === key)?.options ?? []).map((option) => `<span class="canvas-option">(${String(values[key] ?? '').trim() === option ? 'X' : ' '}) ${e(option)}</span>`).join(' ');
    const canvasFloorOptions = sections[5].fields.find((field) => field.key === 'canvasFloor')?.options ?? [];
    const canvasFloor = canvasFloorOptions.map((option) => `<span class="canvas-option">(${values['canvasFloor'] === option ? 'X' : ' '}) ${e(option)}</span>`).join('<br>');
    const canvasHeight = String(values['canvasHeight'] ?? '').trim();
    const canvasStandardHeight = ['2900', '2900mm'].includes(canvasHeight.replaceAll(' ', '').toLowerCase());
    const canvasSupportValues = String(values['canvasSupports'] ?? '')
        .split(',')
        .map((value) => value.trim().toLocaleLowerCase('pt-BR'));
    const canvasSupports = (sections[5].fields.find((field) => field.key === 'canvasSupports')?.options ?? [])
        .map((option) => `<span class="canvas-option">(${canvasSupportValues.includes(option.toLocaleLowerCase('pt-BR')) ? 'X' : ' '}) ${e(option)}</span>`)
        .join(' ');
    const canvasCard = `<section class="canvas-card"><h2>Linha Furgão Lonado</h2>
        <div class="canvas-row"><b>Comprimento:</b> ${e(values['canvasLength'])}</div>
        <div class="canvas-row canvas-floor"><b>Assoalho:</b><div>${canvasFloor}</div></div>
        <div class="canvas-row canvas-height"><b>Alt. Externa da Caixa de Carga:</b> <span class="canvas-option">(${canvasStandardHeight ? 'X' : ' '}) 2900mm</span> <span class="canvas-option">(${canvasHeight && !canvasStandardHeight ? 'X' : ' '}) Outros</span>${canvasHeight && canvasHeight !== 'Outros' && !canvasStandardHeight ? ` (${e(canvasHeight)})` : ''}</div>
        <div class="canvas-row"><b>Cor da Lona Lateral:</b> ${e(values['canvasColor'])}</div>
        <div class="canvas-row"><b>Lona Personalizada:</b> ${canvasOptions('canvasCustom')}</div>
        <div class="canvas-row"><b>Pintura da Caixa de Carga:</b> ${e(values['canvasPaint'])}</div>
        <div class="canvas-row"><b>Travessa de Contenção por Vão:</b> ${canvasOptions('canvasCrossbar')}</div>
        <div class="canvas-row"><b>Linha de Vida:</b> ${canvasOptions('canvasLifeline')}</div>
        <div class="canvas-row"><b>Revestimento Frontal:</b><br>${canvasOptions('canvasFront')}</div>
        <div class="canvas-row canvas-supports"><b>Suporte:</b> ${canvasSupports}</div>
    </section>`;
    const dryOptions = (key: string, options?: { value: string; label: string }[]): string =>
        (options ?? (sections[6].fields.find((field) => field.key === key)?.options ?? []).map((value) => ({ value, label: value })))
            .map((option) => `<span class="grain-option">(${String(values[key] ?? '').trim() === option.value ? 'X' : ' '}) ${e(option.label)}</span>`)
            .join(' ');
    const dryFloorOptions = sections[6].fields.find((field) => field.key === 'dryFloor')?.options ?? [];
    const dryCard = `<section class="grain-card dry-card"><h2>Linha Carga Seca</h2>
        <div class="grain-row"><b>Comprimento:</b> (${e(values['dryLength']) || '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'}) ${dryOptions('dryModel')}</div>
        <div class="grain-row"><b>Engate Rodotrem:</b> ${dryOptions('dryCoupling')}</div>
        <div class="grain-row"><b>Assoalho:</b><div class="grain-floor">${[0, 2, 1, 3].map((index) => dryOptions('dryFloor', [{ value: dryFloorOptions[index], label: dryFloorOptions[index] }])).join('')}</div></div>
        <div class="grain-row grain-container"><b>Engate Contêiner:</b> ${dryOptions('dryContainer', [{ value: '4P (1x40)', label: '4P (1x40”)' }])}<br>${dryOptions('dryContainer', [
            { value: '8P (1x40, 2x20)', label: '8P (1x40”, 2x20”)' },
            { value: '12P (1x40, 1x20, 2x20)', label: '12P (1x40”, 1x20”, 2x20”)' }
        ])}</div>
        <div class="grain-row"><b>Pintura da Caixa de Carga:</b> ${e(values['dryPaint'])}</div>
        <div class="grain-row"><b>Altura Tampa:</b> ${dryOptions('dryHeight')}</div>
        <div class="grain-row"><b>Tipo de Amarração da Tampa:</b> ${dryOptions('dryTie')}</div>
        <div class="grain-row"><b>Cor da Lona:</b> ${e(values['dryCanvas'])}</div>
    </section>`;
    const aluminumOptions = (key: string): string =>
        (sections[7].fields.find((field) => field.key === key)?.options ?? []).map((option) => `<span class="canvas-option">(${String(values[key] ?? '').trim() === option ? 'X' : ' '}) ${e(option)}</span>`).join(' ');
    const aluminumFloorOptions = sections[7].fields.find((field) => field.key === 'aluminumFloor')?.options ?? [];
    const aluminumFloor = aluminumFloorOptions.map((option) => `<span class="canvas-option">(${values['aluminumFloor'] === option ? 'X' : ' '}) ${e(option)}</span>`).join('<br>');
    const aluminumHeight = String(values['aluminumHeight'] ?? '').trim();
    const aluminumStandardHeight = ['2900', '2900mm'].includes(aluminumHeight.replaceAll(' ', '').toLowerCase());
    const aluminumSupportValues = String(values['aluminumSupports'] ?? '')
        .split(',')
        .map((value) => value.trim().toLocaleLowerCase('pt-BR'));
    const aluminumSupports = (sections[7].fields.find((field) => field.key === 'aluminumSupports')?.options ?? [])
        .map((option) => `<span class="canvas-option">(${aluminumSupportValues.includes(option.toLocaleLowerCase('pt-BR')) ? 'X' : ' '}) ${e(option)}</span>`)
        .join(' ');
    const aluminumCard = `<section class="canvas-card aluminum-card"><h2>Linha Furgão Alumínio</h2>
        <div class="canvas-row"><b>Comprimento:</b> ${e(values['aluminumLength'])}</div>
        <div class="canvas-row canvas-floor"><b>Assoalho:</b><div>${aluminumFloor}</div></div>
        <div class="canvas-row canvas-height"><b>Alt. Externa da Caixa de Carga:</b> <span class="canvas-option">(${aluminumStandardHeight ? 'X' : ' '}) 2900mm</span> <span class="canvas-option">(${aluminumHeight && !aluminumStandardHeight ? 'X' : ' '}) Outros</span>${aluminumHeight && aluminumHeight !== 'Outros' && !aluminumStandardHeight ? ` (${e(aluminumHeight)})` : ''}</div>
        <div class="canvas-row"><b>Porta Lateral:</b> ${aluminumOptions('aluminumDoor')}</div>
        <div class="canvas-row"><b>Cor Frontal/Traseira:</b> ${e(values['aluminumColor'])}</div>
        <div class="canvas-row canvas-supports"><b>Suporte:</b> ${aluminumSupports}</div>
    </section>`;
    const totals = manualOrderTotals(values, additionalProducts);
    const financialNumber = (value: number): string => e(value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    const hasValue = (key: string): boolean => values[key] != null && values[key] !== '';
    const quantityLabel = hasValue('quantity') ? Number(values['quantity']).toLocaleString('pt-BR', { minimumIntegerDigits: 2, maximumFractionDigits: 3 }) : '';
    const paymentOptions = (sections[10].fields.find((field) => field.key === 'payment')?.options ?? []).map((option) => `<span class="payment-option">(${values['payment'] === option ? 'X' : ' '}) ${e(option)}</span>`).join(' ');
    const tireQuantity = amount(values, 'tire1Quantity') + amount(values, 'tire2Quantity');
    const financialBlock = `<div class="order-financial">
        <div class="product-value-strip"><div><b>Valor Unit. (R$):</b><span>${hasValue('unitPrice') ? financialNumber(amount(values, 'unitPrice')) : '&nbsp;'}</span></div><div><b>Qtde:</b><span>${e(quantityLabel) || '&nbsp;'}</span></div><div><b>Valor Total (R$):</b><span>${financialNumber(totals.product)}</span></div><div><b>Prev. Entrega (Mês/Ano):</b><span>${e(values['delivery']) || '&nbsp;'}</span></div></div>
        <section class="tires-card"><h2>Características dos Pneus</h2><table><colgroup><col style="width:32%"><col style="width:11%"><col style="width:29%"><col style="width:28%"></colgroup><thead><tr><th>Modelo</th><th>Quantidade</th><th>Valor Unitário (R$)</th><th>Valor Total (R$)</th></tr></thead><tbody>${[
            1, 2
        ]
            .map((n) => {
                const quantityKey = 'tire' + n + 'Quantity';
                const priceKey = 'tire' + n + 'Price';
                return `<tr><td>${e(values['tire' + n + 'Model']) || '&nbsp;'}</td><td>${hasValue(quantityKey) ? e(amount(values, quantityKey).toLocaleString('pt-BR')) : '&nbsp;'}</td><td><div class="financial-money"><b>R$</b><span>${hasValue(priceKey) ? financialNumber(amount(values, priceKey)) : '&nbsp;'}</span></div></td><td><div class="financial-money"><b>R$</b><span>${hasValue(quantityKey) && hasValue(priceKey) ? financialNumber(Math.round(amount(values, priceKey) * amount(values, quantityKey) * 100) / 100) : '&nbsp;'}</span></div></td></tr>`;
            })
            .join(
                ''
            )}</tbody><tfoot><tr><td></td><td><b>Total:</b> ${e(tireQuantity.toLocaleString('pt-BR'))}</td><td></td><td><div class="financial-money"><b>Total:</b><span>${financialNumber(totals.tires)}</span></div></td></tr></tfoot></table></section>
        <div class="financial-total-row"><div><b>Valor Total do Pedido (Produto + Pneus)</b></div><div class="financial-money"><b>R$</b><span>${financialNumber(totals.total)}</span></div></div>
        <div class="financial-payment-row"><div><b>Condições de Pagamento:</b> ${paymentOptions}</div><div><b>Lista nº</b> <span>${e(values['priceList'])}</span></div></div>
    </div>`;
    const products: ManualOrderProduct[] = [{ product: String(values['product'] ?? ''), quantity: amount(values, 'quantity'), unitPrice: amount(values, 'unitPrice'), discount: amount(values, 'discount') }, ...additionalProducts];
    return `<main>
        <article class="order-page${additionalProducts.length ? ' multiple-products' : ''}"><div class="order-content">
            <header><div>${headerLogo(branding.resaleLogo, branding.resaleName, 'Logo da revenda não cadastrada')}</div><div>${headerLogo(branding.brandLogo, branding.brandName, 'Logo da marca não cadastrada')}</div><div class="contract-card"><small>CONTRATO Nº</small>${contractNumber}</div></header>
            <h1>Contrato para Aquisição de Implementos Rodoviários da Marca Librelato/Pedido de Vendas</h1>
            ${customerCard}${technicalCharacteristics}
            <div class="technical"><div>${grainCard}${dryCard}</div><div>${tipperCard}</div><div>${canvasCard}${aluminumCard}</div></div>
            <p class="series">Obs.: itens de série conforme modelo do produto.</p>
            ${products.length > 1 || amount(values, 'discount') > 0 ? `<section><h2>Itens do pedido</h2><table><thead><tr><th>Produto</th><th>Quantidade</th><th>Valor unitário</th><th>Desconto</th><th>Total</th></tr></thead><tbody>${products.map((item) => `<tr><td>${e(item.product)}</td><td>${e(item.quantity)}</td><td>${e(money(item.unitPrice))}</td><td>${e(money(item.discount))}</td><td>${e(money(manualOrderProductTotal(item)))}</td></tr>`).join('')}</tbody></table></section>` : ''}
            ${financialBlock}
            <div class="installment-tables">${[1, 2, 3, 4].map((column) => `<section><table><thead><tr><th>Valor (R$)</th><th>Vencimento</th></tr></thead><tbody>${[column, column + 4].map((n) => `<tr><td>${hasValue('payment' + n) ? financialNumber(amount(values, 'payment' + n)) : '&nbsp;'}</td><td>${e(values['due' + n]) || '&nbsp;'}</td></tr>`).join('')}</tbody></table></section>`).join('')}</div>
            <div class="financing-cards">
                <section><h2>Venda Através de Cartão BNDES</h2><div><b>Banco/Bandeira:</b> ${e(values['bndesBank'])}</div><div><b>Parcelas:</b> ${e(values['bndesInstallments'])}</div><div><b>Nº Cartão:</b> ${e(values['bndesCard'])}</div></section>
                <section><h2>Venda Através de Finame/CDC/LEASING</h2><div><b>Banco:</b> ${e(values['financeBank'])}</div><div><b>Parcelas:</b> ${e(values['financeInstallments'])}</div><div><b>Fone:</b> ${e(values['financePhone']) || '( &nbsp; )'}</div></section>
                <section><h2>Venda Através de Consórcio</h2><div><b>Consórcio:</b> ${e(values['consortium'])}</div><div><b>Grupo:</b> ${e(values['consortiumGroup'])}</div><div><b>Cota:</b> ${e(values['consortiumQuota'])}</div></section>
            </div>
            <section class="commercial-notes"><h2>Observações Comerciais</h2><div>${e(values['notes']) || '&nbsp;'}</div></section>
            <footer>
                <div>${e(values['date'])}<hr>Data</div>
                <div>${e(values['seller'])}<hr>Responsável venda</div>
                <div style=" margin-top: 3mm;"><hr>${e(values['client'])}</div>
            </footer>
        </div>
        </article>
        
        <article class="terms-page">
            <div class="terms-content">
                <h2 class="terms-title">${e(MANUAL_ORDER_TERMS_TITLE)}</h2>
                <div class="terms-body">${MANUAL_ORDER_TERMS_PARAGRAPHS.map((paragraph) => {
                        const heading = paragraph.match(/^((?:\d{1,2}|B)\. [^:]+:)([\s\S]*)$/);
                        return heading ? `<p><b>${e(heading[1])}</b>${e(heading[2])}</p>` : `<p>${e(paragraph)}</p>`;
                    }).join('')}
                </div>
                <div class="terms-signatures">
                    <div>${e(values['seller'])}<hr>Responsável venda</div>
                    <div><hr>${e(values['client'])}</div>
                </div>
            </div>
        </article>
    </main>`;
}

export const MANUAL_ORDER_PRINT_STYLE = `
@page { size: A4; margin: 8mm; }
* { box-sizing: border-box; } body { margin: 0; color: #111; font-family: Arial, sans-serif; font-size: 7.2pt; }
.order-page { width: 194mm; height: 277mm; overflow: hidden; break-inside: avoid; display: flow-root; } .order-content { width: 194mm; transform-origin: top center; display: flow-root; } header { display: grid; grid-template-columns: 1fr 1fr .54fr; gap: 3px; } header>div { border: 1px solid; border-radius: 6px; padding: 3px 5px; min-height: 16mm; min-width: 0; } header small { display: block; font-size: 6pt; font-weight: bold; } header>div:not(:first-child)>small { font-size: 8pt; font-weight: 800; } header strong { display: block; font-size: 15pt; margin-top: 5px; overflow-wrap: anywhere; }
h1 { border-radius: 6px; text-align: center; font-size: 9pt; padding: 3px; margin: 3px 0; border: 1px solid; background: #eee; } h2 { margin: 0; padding: 2px 4px; background: #eee; border-bottom: 1px solid; text-align: center; font-size: 8pt; }
.header-logo { display: block; width: 100%; height: 16mm; object-fit: cover; object-position: center; margin-top: .5mm; } .header-logo-placeholder { display: flex; align-items: center; justify-content: center; min-height: 16mm; font-size: 9pt; overflow-wrap: anywhere; }
.contract-number { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) auto repeat(3, minmax(0, 1fr)); gap: 1px; align-items: end; margin: 3mm 1mm 0; font: 14pt 'Times New Roman', serif; } .contract-digit { border: 1px solid #333; min-height: 8mm; display: flex; align-items: center; justify-content: center; } .contract-dot { font-weight: bold; line-height: 1; } .contract-text { text-align: center; }
.customer-header { border-radius: 6px; } .customer-line { display: grid; grid-template-columns: 55% 45%; border-bottom: 1px solid #555; } .customer-line:last-child { border-bottom: 0; } .customer-line>div, .customer-secondary>div { padding: 2px 5px; min-height: 4mm; overflow-wrap: anywhere; } .customer-line>div.customer-secondary { padding: 0; } .customer-secondary { display: grid; grid-template-columns: 1fr 1fr; } .customer-location { grid-template-columns: 17% 83%; } .customer-location>div:last-child { border-left: 1px solid #555; } .customer-header b { font-size: 6.4pt; } .customer-value { font: 8.5pt 'Times New Roman', serif; } .customer-line:first-child>div:first-child .customer-value { font-size: 7.5pt; }
section { border: 1px solid; border-radius: 4px; overflow: hidden; margin: 3px 0; break-inside: avoid; } .fields { display: grid; grid-template-columns: 1fr 1fr; } .field { border-bottom: 1px solid #ccc; padding: 2px 4px; min-height: 3.7mm; overflow-wrap: anywhere; white-space: pre-wrap; } .field:last-child { border-bottom: 0; } .field b { font-size: 6.5pt; } .field span { white-space: pre-wrap; }
.technical { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; align-items: start; } .technical section { margin-top: 2px; } .technical .field { min-height: 4mm; }
.canvas-card { border-radius: 7px; font-size: 6pt; } .canvas-card h2 { background: white; } .canvas-row { padding: 2px 4px; min-height: 3.7mm; border-bottom: 1px solid #aaa; overflow-wrap: anywhere; line-height: 1.5; } .canvas-row:last-child { border-bottom: 0; } .canvas-option { display: inline-block; white-space: nowrap; margin-right: 3px; } .canvas-floor { display: grid; grid-template-columns: auto 1fr; gap: 5px; } .canvas-height, .canvas-supports { font-size: 5.5pt; } .canvas-height .canvas-option, .canvas-supports .canvas-option { margin-right: 1px; }
.tipper-card { border-radius: 7px; font-size: 6pt; } .tipper-card h2 { background: white; } .tipper-row { padding: 2px 4px; min-height: 3.7mm; border-bottom: 1px solid #aaa; overflow-wrap: anywhere; line-height: 1.5; } .tipper-row:last-child { border-bottom: 0; } .tipper-option { display: inline-block; white-space: nowrap; margin-right: 3px; } .tipper-supports { font-size: 5.5pt; } .tipper-supports .tipper-option { margin-right: 1px; }
.grain-card { border-radius: 7px; font-size: 6pt; } .grain-card h2 { background: white; } .grain-row { padding: 2px 4px; min-height: 3.7mm; border-bottom: 1px solid #aaa; overflow-wrap: anywhere; } .grain-row:last-child { border-bottom: 0; } .grain-option { display: inline-block; white-space: nowrap; margin-right: 3px; } .grain-floor { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 0; margin-top: 3px; } .grain-floor .grain-option { margin-right: 0; font-size: 5.5pt; } .grain-container { font-size: 5.8pt; line-height: 1.5; }
.product-characteristics { border-radius: 7px; } .product-characteristics h2 { text-align: left; background: white; } .characteristics-row { display: grid; grid-template-columns: 55% 45%; border-bottom: 1px solid #aaa; } .characteristics-row:last-child { border-bottom: 0; } .characteristics-row>div { padding: 2px 4px; min-height: 3.7mm; overflow-wrap: anywhere; } .technical-option { display: inline-block; white-space: nowrap; margin-right: 5px; } .tractor-options { grid-template-columns: 1fr; }
.multiple-products header>div { min-height: 14mm; } .multiple-products .field { min-height: 3.3mm; padding-top: 1px; padding-bottom: 1px; } .multiple-products .technical .field { min-height: 3.5mm; } .multiple-products footer { margin-top: 4mm; }
.summary { display: flex; justify-content: space-between; gap: 5px; border: 1px solid; border-radius: 4px; padding: 4px; margin: 3px 0; flex-wrap: wrap; } .total { background: #eee; font-size: 9pt; } .series { font-size: 6pt; text-align: right; margin: 2px 0; }
.order-financial { break-inside: avoid; margin: 3px 0; } .product-value-strip { display: grid; grid-template-columns: 1.7fr .65fr 2fr 2.2fr; gap: 3px; } .product-value-strip>div, .financial-total-row>div, .financial-payment-row>div { border: 1px solid #111; border-radius: 6px; padding: 2px 4px; min-width: 0; overflow-wrap: anywhere; } .product-value-strip>div { display: flex; align-items: baseline; gap: 4px; } .product-value-strip b { font-size: 6pt; white-space: nowrap; } .product-value-strip span { flex: 1; text-align: center; font: 10pt 'Times New Roman', serif; }
.order-financial .tires-card { border-radius: 6px; margin: 3px 0; } .order-financial .tires-card h2 { background: white; font-size: 9pt; } .tires-card th, .tires-card td { border-color: #333; padding: 2px 5px; } .tires-card th { font-size: 7.2pt; white-space: nowrap; } .tires-card tbody td { text-align: center; font: 10pt 'Times New Roman', serif; height: 4.5mm; } .financial-money { display: flex; align-items: baseline; gap: 4px; } .financial-money>b { font: bold 7.2pt Arial, sans-serif; } .financial-money>span { flex: 1; text-align: center; font: 11pt 'Times New Roman', serif; } .tires-card tfoot td { height: 4.5mm; font-size: 7pt; }
.financial-total-row, .financial-payment-row { display: grid; grid-template-columns: 71% 1fr; gap: 3px; margin-top: 3px; } .financial-total-row>div { background: #eee; } .financial-total-row>div:first-child { display: flex; align-items: center; font-size: 8pt; } .financial-payment-row>div:first-child { font-size: 6pt; line-height: 1.5; } .payment-option { display: inline-block; white-space: nowrap; margin-right: 4px; }
table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #aaa; padding: 2px 4px; text-align: left; } .installments { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; } .installments>div { border: 1px solid; border-radius: 4px; padding: 4px; line-height: 1.7; }
.installment-tables { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; break-inside: avoid; } .installment-tables section { border-radius: 6px; margin: 0; } .installment-tables table { table-layout: fixed; } .installment-tables th, .installment-tables td { border-color: #555; padding: 2px 5px; overflow-wrap: anywhere; } .installment-tables th { font-size: 8pt; } .installment-tables td { height: 4.5mm; text-align: center; font: 9pt 'Times New Roman', serif; }
.financing-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; align-items: start; break-inside: avoid; } .financing-cards section { border-radius: 6px; margin: 3px 0; } .financing-cards h2 { text-align: left; background: white; font-size: 7.5pt; padding: 2px 5px; } .financing-cards section>div { min-height: 4.5mm; padding: 2px 5px; border-bottom: 1px solid #aaa; overflow-wrap: anywhere; } .financing-cards section>div:last-child { border-bottom: 0; }
.commercial-notes { border-radius: 6px; margin: 0; } .commercial-notes h2 { background: white; font-size: 9pt; } .commercial-notes>div { min-height: 9mm; line-height: 4.5mm; font-family: 'Times New Roman', serif; font-size: 10pt; padding: 0 5px; white-space: pre-wrap; overflow-wrap: anywhere; background-image: repeating-linear-gradient(to bottom, transparent 0, transparent calc(4.5mm - .5px), #aaa calc(4.5mm - .5px), #aaa 4.5mm); print-color-adjust: exact; -webkit-print-color-adjust: exact; }
footer { display: flex; justify-content: space-between; gap: 10px; margin-top: 6mm; text-align: center; } footer>div { flex: 1; overflow-wrap: anywhere; } hr { border: 0; border-top: 1px solid; margin: 3px 0; }
.terms-page { break-before: page; break-inside: avoid; width: 194mm; height: 277mm; overflow: hidden; display: flow-root; } .terms-content { width: 194mm; transform-origin: top center; display: flow-root; font-size: 7.2pt; line-height: 1.13; } .terms-title { background: none; border: 0; margin: 0 0 3mm; padding: 0; font-size: 12pt; line-height: 1.2; } .terms-body p { margin: 0 0 1.5mm; text-align: justify; overflow-wrap: anywhere; } .terms-signatures { display: flex; justify-content: space-evenly; align-items: end; gap: 10mm; padding: 0 20mm; margin-top: 8mm; } .terms-signatures>div { flex: 1; text-align: center; overflow-wrap: anywhere; font-size: 9pt; line-height: 1.3; }
`;
