import { AttendanceQuoteItem, calculateQuoteItem } from './attendance.quote';

describe('Attendance quotation amounts', () => {
    const item: AttendanceQuoteItem = { productName: 'Produto', quantity: 2, unitPrice: 100, discountType: 'PERCENTAGE', discountValue: 10 };

    it('applies percentage discount to quantity times unit price', () => {
        expect(calculateQuoteItem(item)).toEqual({ subtotal: 200, discountAmount: 20, total: 180 });
    });
    it('applies a fixed discount to the whole line', () => {
        expect(calculateQuoteItem({ ...item, discountType: 'FIXED', discountValue: 25 })).toEqual({ subtotal: 200, discountAmount: 25, total: 175 });
    });
    it('rounds fractional quantities and percentage discounts to cents', () => {
        expect(calculateQuoteItem({ ...item, quantity: 0.333, unitPrice: 10, discountValue: 10 })).toEqual({ subtotal: 3.33, discountAmount: 0.33, total: 3 });
        expect(calculateQuoteItem({ ...item, quantity: 1, unitPrice: 0.05, discountValue: 10 }).discountAmount).toBe(0.01);
    });
    it('rejects excessive discounts, negative prices, zero quantities and invalid numbers', () => {
        for (const invalid of [
            { ...item, discountValue: 101 },
            { ...item, discountType: 'FIXED' as const, discountValue: 201 },
            { ...item, unitPrice: -1 },
            { ...item, quantity: 0 },
            { ...item, quantity: NaN }
        ]) {
            expect(() => calculateQuoteItem(invalid)).toThrow();
        }
    });
});
