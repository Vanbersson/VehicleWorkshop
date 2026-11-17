import { ClientCompany } from '@/app/models/client.company';
import { AttendanceQuote, calculateQuoteItem } from '@/app/models/crm/attendance.quote';
import { ManualOrderProduct, ManualOrderValues } from '@/app/pages/crm/new.customer/manual.order.print/manual.order.print';

export function manualOrderClientValues(client: ClientCompany): ManualOrderValues {
    return {
        client: client.name,
        phone: [client.dddPhone, client.phone].filter(Boolean).join(' '),
        cellphone: [client.dddCellphone, client.cellphone].filter(Boolean).join(' '),
        address: [client.address, client.addressNumber, client.addressComplement].filter(Boolean).join(', '),
        neighborhood: client.neighborhood,
        city: client.city,
        state: client.state,
        zip: client.zipCode,
        document: client.cnpj || client.cpf,
        registration: client.ie || client.rg,
        email: client.emailWork || client.emailHome || client.contactEmail,
        contact: client.contactName
    };
}

export function manualOrderQuoteProducts(quote: AttendanceQuote): ManualOrderProduct[] {
    return quote.items.map((item) => ({ product: item.productName, quantity: item.quantity, unitPrice: item.unitPrice, discount: calculateQuoteItem(item).discountAmount }));
}
