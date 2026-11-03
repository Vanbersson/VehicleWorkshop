import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'p-landingpage',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './landing.page.component.html',
    styleUrl: './landing.page.component.scss'
})
export class LandingPageComponent {
    readonly menuOpen = signal(false);
    readonly year = new Date().getFullYear();
    readonly navigation = [
        { id: 'sobre', label: 'A Nativa' },
        { id: 'implementos', label: 'Implementos' },
        { id: 'pecas', label: 'Libreparts' },
        { id: 'oficina', label: 'Oficina' }
    ];
    readonly states = ['Pernambuco', 'Paraíba', 'Rio Grande do Norte', 'Alagoas'];
    readonly products = [
        { number: '01', category: 'LINHA GRANELEIRA', name: 'Graneleiro', image: 'images/nativa/graneleiro.jpg', description: 'Uma parceria de peso para o transporte de grãos e cargas a granel.' },
        { number: '02', category: 'LINHA BASCULANTE', name: 'Basculante', image: 'images/nativa/basculante.jpg', description: 'Versatilidade para acompanhar os desafios da sua operação.' },
        { number: '03', category: 'LINHA FURGÃO LONADO', name: 'Furgão lonado', image: 'images/nativa/lonado.jpg', description: 'Praticidade para a movimentação e o transporte da sua carga.' }
    ].map((product) => ({ ...product, contact: 'https://wa.me/558135211030?text=' + encodeURIComponent(`Olá! Gostaria de saber mais sobre o implemento ${product.name} Librelato.`) }));
    readonly parts = [
        { name: 'Lanterna Style', category: 'ILUMINA??O', image: 'images/nativa/lanterna.png', alt: 'Lanterna traseira Style Libreparts' },
        { name: 'Catraca de freio', category: 'SISTEMA DE FREIO', image: 'images/nativa/catraca.png', alt: 'Catraca de freio manual Libreparts' },
        { name: 'V?lvula rel? de emerg?ncia', category: 'SISTEMA PNEUM?TICO', image: 'images/nativa/valvula.jpg', alt: 'V?lvula rel? de emerg?ncia para implementos' },
        { name: 'Rolamentos', category: 'RODAGEM', image: 'images/nativa/rolamento.png', alt: 'Conjunto de rolamentos c?nicos Libreparts' }
    ].map((part) => ({ ...part, contact: 'https://wa.me/558135211030?text=' + encodeURIComponent('Ol?! Gostaria de consultar: ' + part.name + '.') }));
    readonly services = [
        { title: 'Alinhamento e balanceamento', description: 'Ajustes no conjunto de rodas e eixos para o cuidado com a rodagem do seu implemento.' },
        { title: 'Desempeno de chassi', description: 'Avaliação e alinhamento do chassi com comparação às medidas originais de fábrica.' },
        { title: 'Manutenção, corte e dobra', description: 'Manutenção preventiva e reparos. Consulte nossa equipe para avaliar a necessidade do seu equipamento.' },
        { title: 'Borracharia e carpintaria', description: 'Serviços para os pneus e a estrutura do seu implemento, conforme avaliação da oficina.' }
    ];
    toggleMenu(): void {
        this.menuOpen.update((open) => !open);
    }
    closeMenu(): void {
        this.menuOpen.set(false);
    }
}
