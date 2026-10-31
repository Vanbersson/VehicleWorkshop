import { CustomerAttendance } from '@/app/models/crm/customer.attendance';

export type QuoteDiscountType = 'PERCENTAGE' | 'FIXED';

export interface AttendanceQuoteItem {
    productName: string;
    quantity: number;
    unitPrice: number;
    discountType: QuoteDiscountType;
    discountValue: number;
}

export interface AttendanceQuote {
    id: number;
    version: number;
    notes: string;
    dateCreated: string;
    dateUpdated: string;
    subtotal: number;
    discountTotal: number;
    total: number;
    items: AttendanceQuoteItem[];
}

export interface AttendanceQuoteResponse {
    attendance: CustomerAttendance;
    quote: AttendanceQuote | null;
}

export interface AttendanceQuoteSave {
    attendanceId: number;
    attendanceVersion: number;
    version: number | null;
    notes: string;
    items: AttendanceQuoteItem[];
}

export interface QuoteAmounts {
    subtotal: number;
    discountAmount: number;
    total: number;
}

export function calculateQuoteItem(item: AttendanceQuoteItem): QuoteAmounts {
    const scaled = (value: number, decimals: number): bigint => {
        if (!Number.isFinite(value) || value < 0) throw new Error('Informe valores numéricos válidos, maiores ou iguais a zero.');
        const result = Math.round((value + Number.EPSILON) * 10 ** decimals);
        if (!Number.isSafeInteger(result)) throw new Error('O valor informado ultrapassa o limite de cálculo.');
        return BigInt(result);
    };
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) throw new Error('A quantidade deve ser maior que zero.');
    const quantity = scaled(item.quantity, 3);
    if (quantity === 0n) throw new Error('Informe uma quantidade com até três casas decimais.');
    const gross = (quantity * scaled(item.unitPrice, 2) + 500n) / 1000n;
    const value = scaled(item.discountValue, 2);
    if (item.discountType === 'PERCENTAGE' && value > 10000n) throw new Error('O desconto percentual não pode ultrapassar 100%.');
    const discount = item.discountType === 'PERCENTAGE' ? (gross * value + 5000n) / 10000n : value;
    if (discount > gross) throw new Error('O desconto em R$ não pode ultrapassar o subtotal do item.');
    if (gross > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('O subtotal ultrapassa o limite de cálculo.');
    return { subtotal: Number(gross) / 100, discountAmount: Number(discount) / 100, total: Number(gross - discount) / 100 };
}
