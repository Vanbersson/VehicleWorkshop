export interface VisitCatalogOption {
    id: number;
    description: string;
}
export const VISIT_REASONS: readonly VisitCatalogOption[] = [
    { id: 1, description: 'Implemento Librelato' },
    { id: 2, description: 'Consorcio Nacional Librelato' },
    { id: 3, description: 'Sistema de telemetria (Sigaway)' },
    { id: 4, description: 'Peças e pneus' },
    { id: 5, description: 'Oficina: Serviços mecânicos, hidráulicos, pneumáticos' },
    { id: 6, description: 'Reforma ou corretiva (Pintura, desempeno chassis, jateamento, solda)' },
    { id: 7, description: 'Plano manutenção preventiva' }
];
export const VISIT_PRODUCTS: readonly VisitCatalogOption[] = [
    { id: 1, description: 'Consórcio' },
    { id: 2, description: 'Serviços e Peças' },
    { id: 3, description: 'Graneleiro' },
    { id: 4, description: 'Porta Container' },
    { id: 5, description: 'Bau lonado / sider' },
    { id: 6, description: 'Bau Aluminio' },
    { id: 7, description: 'Tanque' },
    { id: 8, description: 'Carrega tudo' },
    { id: 9, description: 'Frigorifico' }
];
