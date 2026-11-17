import { environment } from '@/environments/environment';

export interface ManualOrderBranding {
    resaleName?: string;
    resaleLogo?: string;
    brandName?: string;
    brandLogo?: string;
}

export function manualOrderLogoUrl(value: string | null | undefined): string {
    if (!value) return '';
    const url = new URL(value.replace(/^\/+/, ''), environment.apiuUrl.replace(/\/+$/, '') + '/');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Endereço da logo inválido.');
    return url.href;
}

/** Embed the image so the print frame does not depend on a second network load. */
export async function manualOrderLogoData(url: string | undefined, label: string): Promise<string> {
    if (!url) return '';
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!response.ok) throw new Error('Logo indisponível');
        const blob = await response.blob();
        if (!['image/png', 'image/jpeg'].includes(blob.type)) throw new Error('Imagem inválida');
        const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
            reader.readAsDataURL(blob);
        });
        const image = new Image();
        image.src = data;
        await image.decode();
        return data;
    } catch {
        throw new Error(`Não foi possível carregar a logo ${label}. Verifique o cadastro e tente novamente.`);
    }
}
