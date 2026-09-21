import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { StorageService } from '@/app/services/storage/storage.service';

import { ButtonModule } from 'primeng/button';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, ButtonModule],
    template: `<ul class="layout-menu">
        @for (item of model; track item.label) {
            @if (!item.separator) {
                <li app-menuitem [item]="item" [root]="true"></li>
            } @else {
                <li class="menu-separator"></li>
            }
        }
    </ul>     
    `,
})
export class AppMenu {
    model: MenuItem[] = [];
    constructor(private storageService: StorageService) { }

    ngOnInit() {
        this.model = [
            {
                key: '0_0',
                visible: false,
                label: 'Início',
                items: [{ key: '0_0', visible: false, label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            {
                key: '1_0',
                visible: false,
                label: 'Portaria',
                items: [
                    { key: '1_1', visible: false, label: 'Entrada de Veículo', icon: 'pi pi-fw pi-sign-in', routerLink: ['/concierge/vehicle/entry'] },
                    { key: '1_2', visible: false, label: 'Lista de Veículos', icon: 'pi pi-fw pi-car', routerLink: ['/concierge/vehicle/list'] },
                    { key: '1_5', visible: false, label: 'Saída de Veículos', icon: 'pi pi-fw pi-sign-out', class: 'rotated-icon', routerLink: ['/concierge/vehicle/exit'] },
                    { key: '1_3', visible: false, label: 'Cadastro de Motoristas', icon: 'pi pi-fw pi-id-card', routerLink: ['concierge/driver'] },
                    {
                        key: '1_99',
                        visible: false,
                        label: 'Cadastros',
                        path: '/cadastros',
                        items: [
                            { key: '1_99_0', visible: false, label: 'Cadastro de Modelos', routerLink: ['concierge/register/vehicle/model'] },
                            { key: '1_100', visible: false, label: 'Módulo', routerLink: ['concierge/register/module'] }
                        ]
                    },

                ]
            },
            {
                key: '2_0',
                visible: false,
                label: 'Peças',
                icon: 'pi pi-fw pi-briefcase',
                path: '/part',
                items: [
                    { key: '2_1', visible: false, label: 'Atendimento' },
                    {
                        key: '2_2', visible: false, label: 'Consultas', path: '/consutas',
                        items: [
                            { key: '2_2_0', visible: false, label: 'Orçamentos' }
                        ]
                    },
                    {
                        key: '2_3', visible: false, label: 'Compras', path: '/purchase',
                        items: [
                            { key: '2_3_0', visible: false, label: 'Pedidos de compra', routerLink: ['part/purchase/order'] },
                        ]
                    },
                    {
                        key: '2_99',
                        visible: false,
                        label: 'Cadastros',
                        path: '/register',
                        items: [
                            { key: '2_99_0', visible: false, label: 'Peças', routerLink: ['part/register/part'] },
                            { key: '2_99_1', visible: false, label: 'Grupo de Peças', routerLink: ['part/register/group'] },
                            { key: '2_99_2', visible: false, label: 'Categoria de Peças', routerLink: ['part/register/category'] },
                            { key: '2_99_3', visible: false, label: 'Unidades de Medida', routerLink: ['part/register/unit'] }
                        ]
                    },
                    { key: '2_100', visible: false, label: 'Módulo' }

                ]
            },
            {
                key: '3_0',
                visible: false,
                label: 'Oficina',
                path: '/workshop',
                items: [
                    { key: '3_1', visible: false, label: 'Orçamentos' },
                    {
                        key: '3_2', visible: false, label: 'Controle de equipamentos', path: '/control',
                        items: [
                            { key: '3_2_0', visible: false, label: 'Requisições', routerLink: ['workshop/equipment/request/material'] },
                            {
                                key: '3_2_1', visible: false, label: 'Cadastro', path: '/retister',
                                items: [
                                    { key: '3_2_1_0', visible: false, label: 'Categoria', routerLink: ['workshop/equipment/register/category/material'] },
                                    { key: '3_2_1_1', visible: false, label: 'Material', routerLink: ['workshop/equipment/register/material'] }
                                ]
                            }
                        ]
                    },
                    {
                        key: '3_99', visible: false, label: 'Cadastro', path: '/register',
                        items: [
                            { key: '3_99_0', visible: false, label: 'Mecânico', routerLink: ['workshop/register/mechanic'] },
                            { key: '3_99_1', visible: false, label: 'Departamentos', routerLink: ['workshop/register/mechanic/department'] }
                        ]
                    }
                ]
            },
            {
                key: '4_0',
                visible: false,
                label: 'Faturamento',
                path: '/faturamento',
                items: [
                    { key: '4_1', visible: false, label: 'Manutenção Clientes', routerLink: ['invoicing/client'] },
                    {
                        key: '4_99', visible: false, label: 'Cadastros', path: '/register',
                        items: [
                            { key: '4_99_0', visible: false, label: 'Categoria de Clientes', routerLink: ['invoicing/register/category'] },
                            { key: '4_99_1', visible: false, label: 'Condição de pagamento', routerLink: ['invoicing/register/payment'] }
                        ]
                    }

                ]
            },
            {
                key: '100_0',
                visible: false,
                label: 'Relatórios',
                path: '/report',
                items: [
                    {
                        key: '100_1', visible: false, label: 'Portaria', path: '/concierge', items: [
                            { key: '100_1_0', visible: false, label: 'Entrada de Veículo', routerLink: ['report/concierge/vehicle/entry'] },
                        ]
                    },
                    {
                        key: '100_2', visible: false, label: 'Peças', path: '/part', items: [
                            { key: '100_2_0', visible: false, label: 'Pedidos de compra', routerLink: ['report/part/purchase/order'] },
                        ]
                    },
                    {
                        key: '100_3', visible: false, label: 'Oficina', path: '/workshop', items: [
                            {
                                key: '100_3_0', visible: false, label: 'Controle de equipamentos', path: '/control', items: [
                                    { key: '100_3_1', visible: false, label: 'Requisições', routerLink: ['report/workshop/equipment/request/material'] },
                                ]
                            },
                        ]
                    }


                ]
            },
            {
                key: '999_0',
                visible: false,
                label: 'Configuração',
                path: '/config',
                items: [
                    {
                        key: '999_2', visible: false, label: 'Cadastros', path: '/register',
                        items: [
                            {
                                key: '999_2_0', visible: false, label: 'Empresa', routerLink: '/config/register/company',
                            },
                            {
                                key: '999_2_1', visible: false, label: 'Usuários', routerLink: '/config/register/user'
                            },
                            {
                                key: '999_2_2', visible: false, label: 'Marcas', routerLink: '/config/register/brand'
                            }
                        ]
                    }
                ]
            }
        ];

        // Converte a string em um array de keys
        const keysToShow = this.storageService.menus.split(',');
        this.model = this.model.map(item => this.updateVisibility(item, keysToShow));
    }

    updateVisibility(item: MenuItem, keys: string[]): MenuItem {
        if (this.storageService.roleFunc == StatusRoleFuncEnum.ADMIN) {
            item.visible = true;
        }
        if (keys.includes(item['key'])) {
            item.visible = true;
        }
        if (item.items) {
            item.items = item.items.map(subItem => this.updateVisibility(subItem, keys));
        }
        return item;
    }
}
