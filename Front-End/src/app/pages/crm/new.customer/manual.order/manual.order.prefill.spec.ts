import { ClientCompany } from '@/app/models/client.company';
import { AttendanceQuote } from '@/app/models/crm/attendance.quote';
import { manualOrderClientValues, manualOrderQuoteProducts } from './manual.order.prefill';
import { manualOrderTotals } from '@/app/pages/crm/new.customer/manual.order.print/manual.order.print';

describe('Manual order defaults', () => {
    it('fills the full client address, contacts and documents with individual-client fallbacks', () => {
        const values = manualOrderClientValues(
            Object.assign(new ClientCompany(), { name: 'Cliente', cpf: '12345678901', rg: '123', address: 'Rua A', addressNumber: '12', addressComplement: 'Sala 3', dddPhone: '81', phone: '33333333', emailHome: 'cliente@example.com' })
        );
        expect(values['address']).toBe('Rua A, 12, Sala 3');
        expect(values['document']).toBe('12345678901');
        expect(values['registration']).toBe('123');
        expect(values['phone']).toBe('81 33333333');
        expect(values['email']).toBe('cliente@example.com');
    });

    it('keeps every quoted product and converts both discount types without losing the total', () => {
        const quote = {
            items: [
                { productName: 'Implemento A', quantity: 2, unitPrice: 100, discountType: 'PERCENTAGE', discountValue: 10 },
                { productName: 'Implemento B', quantity: 1.5, unitPrice: 50, discountType: 'FIXED', discountValue: 5 }
            ]
        } as AttendanceQuote;
        const products = manualOrderQuoteProducts(quote);
        expect(products.length).toBe(2);
        expect(products[0].discount).toBe(20);
        expect(products[1].discount).toBe(5);
        expect(manualOrderTotals({ product: products[0].product, quantity: products[0].quantity, unitPrice: products[0].unitPrice, discount: products[0].discount }, products.slice(1)).total).toBe(250);
    });
});
