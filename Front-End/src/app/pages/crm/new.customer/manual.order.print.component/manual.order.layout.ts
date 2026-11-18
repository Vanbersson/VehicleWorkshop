/** Fits the form and contractual text independently onto their A4 pages. */
export async function fitManualOrderToPage(html: string, style: string, ownerDocument: Document = document): Promise<string> {
    const frame = ownerDocument.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:194mm;height:281mm;visibility:hidden;border:0;pointer-events:none';
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        await new Promise<void>((resolve, reject) => {
            timer = setTimeout(() => reject(new Error('Não foi possível preparar o layout do pedido para impressão.')), 15000);
            frame.onload = () => resolve();
            frame.onerror = () => reject(new Error('Não foi possível preparar o layout do pedido para impressão.'));
            // Match print-js's srcdoc mode so table measurements stay identical.
            frame.srcdoc = `<html lang="pt-BR"><head><meta charset="utf-8"><style>${style}</style></head><body>${html}</body></html>`;
            ownerDocument.body.appendChild(frame);
        });
        const contentDocument = frame.contentDocument;
        const pages = contentDocument?.querySelectorAll<HTMLElement>('.order-page, .terms-page');
        if (!pages?.length || !contentDocument) throw new Error('Não foi possível preparar o formulário do pedido.');
        await contentDocument.fonts.ready;
        for (const page of Array.from(pages)) {
            const content = page.querySelector<HTMLElement>('.order-content, .terms-content');
            if (!content) throw new Error('Não foi possível preparar o conteúdo do pedido.');
            const height = Math.max(content.scrollHeight, content.getBoundingClientRect().height);
            const available = page.getBoundingClientRect().height - 2;
            if (height <= 0 || available <= 0) throw new Error('Não foi possível calcular o tamanho do formulário.');
            const scale = Math.min(1, available / height);
            content.style.transform = `scale(${scale})`;
        }
        return contentDocument.body.innerHTML;
    } finally {
        clearTimeout(timer);
        frame.remove();
    }
}
