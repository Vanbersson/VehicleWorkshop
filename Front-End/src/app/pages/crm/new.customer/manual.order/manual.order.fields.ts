export interface ManualOrderField {
    key: string;
    label: string;
    options?: string[];
    numeric?: boolean;
    multiple?: boolean;
}
export interface ManualOrderSection {
    title: string;
    fields: ManualOrderField[];
}
const field = (key: string, label: string, options?: string[]): ManualOrderField => ({ key, label, options });
const numeric = (key: string, label: string): ManualOrderField => ({ key, label, numeric: true });
const yesNo = ['Não', 'Sim'];
const coupling = ['5ª roda', 'Esférico'];
const floor = ['Compensado naval 18 mm', 'Compensado naval 22 mm', 'Chapa xadrez 4,75 mm', 'Chapa xadrez 3,17 mm'];
const supports = 'Suportes (extintor, cone, placa de produtos perigosos)';

export const MANUAL_ORDER_SECTIONS: ManualOrderSection[] = [
    { title: 'Identificação', fields: [field('contract', 'Contrato nº'), field('date', 'Data'), field('seller', 'Responsável pelas vendas')] },
    {
        title: 'Cliente / comprador',
        fields: [
            field('client', 'Cliente / comprador'),
            field('phone', 'Telefone'),
            field('cellphone', 'Celular'),
            field('address', 'Endereço'),
            field('neighborhood', 'Bairro'),
            field('city', 'Cidade'),
            field('state', 'UF'),
            field('zip', 'CEP'),
            field('document', 'CNPJ / CPF'),
            field('registration', 'Inscrição estadual / RG / inscrição de produtor rural'),
            field('email', 'E-mail'),
            field('contact', 'Contato')
        ]
    },
    {
        title: 'Características técnicas do produto',
        fields: [
            field('product', 'Produto'),
            field('suspension', 'Suspensão'),
            field('chassis', 'Pintura do chassi'),
            field('tractor', 'Veículo trator', ['4x2', '6x2', '6x4', '8x2']),
            field('wheels', 'Rodado', ['Disco 20” em aço', 'Disco 20” em alumínio']),
            field('air', 'Engate de ar', ['Mão-amigo', 'Engate rápido']),
            field('electric', 'Sistema elétrico', ['Nacional', 'Mercosul'])
        ]
    },
    {
        title: 'Linha graneleira',
        fields: [
            field('grainLength', 'Comprimento'),
            field('grainModel', 'Modelo', ['Pró-nio', 'Standard']),
            field('grainCoupling', 'Engate rodotrem', coupling),
            field('grainFloor', 'Assoalho', floor),
            field('grainContainer', 'Engate contêiner', ['4P (1x40)', '8P (1x40, 2x20)', '12P (1x40, 1x20, 2x20)']),
            field('grainLashing', 'Sistema de amarração', yesNo),
            field('grainPaint', 'Pintura da caixa de carga'),
            field('grainUpper', 'Altura da tampa superior (mm)', ['800', '900', '1000']),
            field('grainLower', 'Altura da tampa inferior (mm)', ['800', '900', '1000']),
            field('grainTie', 'Amarração da tampa', ['Corrente', 'Cinta']),
            field('grainRope', 'Cor da lona')
        ]
    },
    {
        title: 'Linha basculante',
        fields: [
            field('tipperModel', 'Modelo da caixa de carga', ['Standard', 'Extra leve', 'Premium']),
            field('tipperCoating', 'Revestimento', ['Aço alta resistência — grãos', 'Aço estrutural (SAC 350) — areia / brita']),
            field('tipperCoupling', 'Engate rodotrem', coupling),
            field('tipperVolume', 'Volume'),
            field('tipperPaint', 'Pintura da caixa de carga'),
            field('tipperCanvas', 'Cor da lona'),
            field('tipperDoor', 'Porta traseira', ['Normal', 'Lateral']),
            field('tipperHydraulic', 'Comando hidráulico', yesNo),
            { ...field('tipperSupports', supports, ['Extintor', 'Cone', 'Placa de produtos perigosos']), multiple: true },
            field('tipperTractor', 'Modelo do cavalo')
        ]
    },
    {
        title: 'Linha furgão lonado',
        fields: [
            field('canvasLength', 'Comprimento'),
            field('canvasFloor', 'Assoalho', ['Ômega + chapa xadrez 3,17 mm', 'Ômega + chapa xadrez 4,75 mm']),
            field('canvasHeight', 'Altura externa da caixa de carga (mm)', ['2900', 'Outros']),
            field('canvasColor', 'Cor da lona lateral'),
            field('canvasCustom', 'Lona personalizada', yesNo),
            field('canvasPaint', 'Pintura da caixa de carga'),
            field('canvasCrossbar', 'Travessas de contenção por vão', ['2', '4']),
            field('canvasLifeline', 'Linha de vida', ['Não', '2', '3']),
            field('canvasFront', 'Revestimento frontal', ['Standard com ganchos', 'Revestimento total']),
            { ...field('canvasSupports', supports, ['Extintor', 'Cone', 'Placa de produtos perigosos']), multiple: true }
        ]
    },
    {
        title: 'Linha carga seca',
        fields: [
            field('dryLength', 'Comprimento'),
            field('dryModel', 'Modelo', ['Pró-nio', 'Standard']),
            field('dryCoupling', 'Engate rodotrem', coupling),
            field('dryFloor', 'Assoalho', floor),
            field('dryContainer', 'Engate contêiner', ['4P (1x40)', '8P (1x40, 2x20)', '12P (1x40, 1x20, 2x20)']),
            field('dryPaint', 'Pintura da caixa de carga'),
            field('dryHeight', 'Altura da tampa (mm)', ['500', '800', '1000', '1250']),
            field('dryTie', 'Amarração da tampa', ['Corrente', 'Cinta']),
            field('dryCanvas', 'Cor da lona')
        ]
    },
    {
        title: 'Linha furgão alumínio',
        fields: [
            field('aluminumLength', 'Comprimento'),
            field('aluminumFloor', 'Assoalho', ['Ômega + chapa xadrez 3,17 mm', 'Ômega + chapa xadrez 4,75 mm']),
            field('aluminumHeight', 'Altura externa da caixa de carga (mm)', ['2900', 'Outros']),
            field('aluminumDoor', 'Porta lateral', yesNo),
            field('aluminumColor', 'Cor frontal / traseira'),
            { ...field('aluminumSupports', supports, ['Extintor', 'Cone', 'Placa de produtos perigosos']), multiple: true }
        ]
    },
    { title: 'Valores do produto', fields: [numeric('unitPrice', 'Valor unitário (R$)'), numeric('quantity', 'Quantidade'), numeric('discount', 'Desconto total do item (R$)'), field('delivery', 'Previsão de entrega (mês / ano)')] },
    {
        title: 'Características dos pneus',
        fields: [
            field('tire1Model', 'Modelo dos pneus — linha 1'),
            numeric('tire1Quantity', 'Quantidade — linha 1'),
            numeric('tire1Price', 'Valor unitário (R$) — linha 1'),
            field('tire2Model', 'Modelo dos pneus — linha 2'),
            numeric('tire2Quantity', 'Quantidade — linha 2'),
            numeric('tire2Price', 'Valor unitário (R$) — linha 2')
        ]
    },
    {
        title: 'Condições de pagamento',
        fields: [
            field('payment', 'Condição de pagamento', ['À vista', 'FINAME', 'CDC', 'Leasing', 'Consórcio', 'Cartão BNDES']),
            field('priceList', 'Lista nº'),
            ...[1, 2, 3, 4, 5, 6, 7, 8].flatMap((n) => [numeric('payment' + n, 'Valor (R$) — parcela ' + n), field('due' + n, 'Vencimento — parcela ' + n)])
        ]
    },
    { title: 'Venda através de cartão BNDES', fields: [field('bndesBank', 'Banco / bandeira'), field('bndesInstallments', 'Parcelas'), field('bndesCard', 'Nº do cartão')] },
    { title: 'Venda através de FINAME / CDC / Leasing', fields: [field('financeBank', 'Banco'), field('financeInstallments', 'Parcelas'), field('financePhone', 'Telefone')] },
    { title: 'Venda através de consórcio', fields: [field('consortium', 'Consórcio'), field('consortiumGroup', 'Grupo'), field('consortiumQuota', 'Cota')] },
    { title: 'Observações comerciais', fields: [field('notes', 'Observações comerciais')] }
];
