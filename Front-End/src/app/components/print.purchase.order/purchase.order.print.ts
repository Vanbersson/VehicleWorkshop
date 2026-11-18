import { IResale as Resale } from '@/app/interfaces/conf-company/i.resale';
import { PurchaseOrder } from '@/app/models/parts/purchase.order';
import { PurchaseOrderItem } from '@/app/models/parts/purchase.order.item/purchase.order.item';
import { PurchaseOrderItemCons } from '@/app/models/parts/purchase.order.item.cons';
import { TypePurchaseOrderEnum } from '@/app/models/parts/type.purchase.order.enum';

const value = (input: unknown): string => (input === null || input === undefined || input === '' ? 'N\u00e3o informado' : String(input));
const numeric = (input: number | null): number => (Number.isFinite(input) ? input! : 0);
const money = (input: number): string => input.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 });
const date = (input: string | Date): string => {
    if (!input) return 'Não informada';
    const parsed = typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input) ? new Date(`${input}T12:00:00`) : new Date(input);
    return Number.isNaN(parsed.getTime()) ? 'Não informada' : parsed.toLocaleDateString('pt-BR');
};
const phone = (input: string): string => {
    const digits = input.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 11 ? digits.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3') : input;
};

export function purchasePrintData(order: PurchaseOrder, resale: Resale, stock: PurchaseOrderItem[], consumption: PurchaseOrderItemCons[]) {
    const items = [
        ...(order.type !== TypePurchaseOrderEnum.CONSUMO ? stock.map((item) => ({ ...item, description: item.itemDescription, code: item.itemCode })) : []),
        ...(order.type !== TypePurchaseOrderEnum.ESTOQUE ? consumption.map((item) => ({ ...item, code: '—' })) : [])
    ];
    const gross = items.reduce((total, item) => total + numeric(item.price) * numeric(item.quantity), 0);
    const discount = items.reduce((total, item) => total + numeric(item.discount), 0);
    const rawCnpj = resale.cnpj || '';
    const cnpj = rawCnpj.replace(/\D/g, '').length === 14 ? rawCnpj.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : rawCnpj;
    const contactPhone = [order.attendantDddCellphone, order.attendantCellphone].filter(Boolean).join('') || [order.attendantDddPhone, order.attendantPhone].filter(Boolean).join('');
    return {
        order,
        resale,
        cnpj: value(cnpj),
        issuerAddress: value(
            [
                [resale.address, resale.addressNumber, resale.addressComplement].filter(Boolean).join(', '),
                resale.neighborhood,
                [resale.city, resale.state].filter(Boolean).join(' / '),
                resale.zipCode ? 'CEP ' + resale.zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2') : ''
            ]
                .filter(Boolean)
                .join(' - ')
        ),
        issuerPhone: value(phone(resale.phone || resale.cellphone || '')),
        generationDate: date(order.generationDate),
        fields: [
            { label: 'Fornecedor', value: value(order.clientCompanyName), wide: true },
            { label: 'Código do fornecedor', value: value(order.clientCompanyId) },
            { label: 'Contato / vendedor', value: value(order.attendantName) },
            { label: 'Telefone do contato', value: value(phone(contactPhone)) },
            { label: 'E-mail', value: value(order.attendantEmail) },
            { label: 'Condição de pagamento', value: value(order.paymentTypeDesc) },
            { label: 'Previsão de entrega', value: date(order.dateDelivery) },
            { label: 'Nota fiscal / série', value: value(order.nfNum ? order.nfNum + (order.nfSerie ? ' / ' + order.nfSerie : '') : '') }
        ],
        items: items.map((item) => ({
            code: item.code,
            description: item.description,
            quantity: numeric(item.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 }),
            price: money(numeric(item.price)),
            discount: money(numeric(item.discount)),
            total: money(numeric(item.price) * numeric(item.quantity) - numeric(item.discount))
        })),
        gross: money(gross),
        discount: money(discount),
        total: money(gross - discount),
        information: value(order.information),
        buyer: value(order.responsibleUserName)
    };
}
