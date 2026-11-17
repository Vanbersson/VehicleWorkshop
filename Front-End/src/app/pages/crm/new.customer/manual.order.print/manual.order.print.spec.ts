import { buildManualOrderHtml, manualOrderTotals } from './manual.order.print';

describe('Manual order printing', () => {
    it('totals the product and both tire rows with currency rounding', () => {
        expect(manualOrderTotals({ unitPrice: 145371, quantity: 1, tire1Price: 1491, tire1Quantity: 9, tire2Price: 100.25, tire2Quantity: 2 })).toEqual({ product: 145371, tires: 13619.5, total: 158990.5 });
        expect(manualOrderTotals({ unitPrice: 0.1, quantity: 3 })).toEqual({ product: 0.3, tires: 0, total: 0.3 });
    });

    it('treats empty values as zero and prevents negative printed totals', () => {
        expect(manualOrderTotals({ unitPrice: null, quantity: 1, tire1Price: -100, tire1Quantity: 2 })).toEqual({ product: 0, tires: 0, total: 0 });
    });

    it('escapes user content and uses the entered names in the order and contract signatures', () => {
        const html = buildManualOrderHtml({ client: '<script>alert(1)</script>', seller: 'Vendedor & equipe', notes: '<img src=x onerror=alert(1)>' });
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;script&gt;');
        expect(html).toContain('Vendedor &amp; equipe');
        expect(html).toContain('terms-signatures');
        expect(html).toContain('terms-body');
    });
    it('places the resale logo and its represented brand logo in the correct header cards', () => {
        const html = buildManualOrderHtml({}, [], { resaleLogo: 'data:image/png;base64,REVENDALOGO', resaleName: 'Revenda A', brandLogo: 'data:image/png;base64,MARCALOGO', brandName: 'Marca B' });
        const header = html.slice(html.indexOf('<header>'), html.indexOf('</header>'));
        expect(header).toContain('CARIMBO DO REPRESENTANTE</small><img class="header-logo" src="data:image/png;base64,REVENDALOGO"');
        expect(header).toContain('REPRESENTANTE AUTORIZADO</small><img class="header-logo" src="data:image/png;base64,MARCALOGO"');
        expect(header).not.toContain('<strong>LIBRELATO</strong>');
    });
    it('uses a text fallback when logos are absent and rejects unsafe image sources', () => {
        const html = buildManualOrderHtml({}, [], { resaleLogo: 'javascript:alert(1)', brandName: '<Marca>' });
        const header = html.slice(html.indexOf('<header>'), html.indexOf('</header>'));
        expect(header).not.toContain('<img');
        expect(header).toContain('Logo da revenda não cadastrada');
        expect(header).toContain('&lt;Marca&gt;');
    });
});
