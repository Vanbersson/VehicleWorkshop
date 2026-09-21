import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';

import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { authGuard } from './app/guards/auth/auth-guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', loadComponent: () => import('./app/pages/dashboard/dashboard.component') },
            {
                path: 'concierge',
                children: [
                    { path: 'vehicle/entry', title: 'Entrada de veículos', loadComponent: () => import('./app/pages/concierge/vehicle.entry/vehicle.entry.component') },
                    { path: 'vehicle/list', title: 'Veículos', loadComponent: () => import('./app/pages/concierge/vehicle/vehicle.component') },
                    { path: 'vehicle/maintenance/:id', title: 'Manuteção veículo', loadComponent: () => import('./app/pages/concierge/vehicle.maintenance/vehicle.maintenance.component') },
                    { path: 'vehicle/exit', title: 'Saída de veículos', loadComponent: () => import('./app/pages/concierge/vehicle.exit/vehicle.exit.component') },
                    { path: 'driver', title: 'Cadastro de Motorista', loadComponent: () => import('./app/pages/concierge/driver/driver.component') },
                    {
                        path: 'register',
                        children: [
                            { path: 'vehicle/model', title: 'Modelo de veículo', loadComponent: () => import('./app/pages/concierge/register/vehicle.model/vehicle.model.component') },
                            { path: 'module', title: 'Modulo portaria', loadComponent: () => import('./app/pages/concierge/register/module/module.component') },
                        ]
                    },
                ]
            },
            {
                path: 'part',
                children: [
                    { path: 'purchase/order', title: 'Pedido de compra', loadComponent: () => import('./app/pages/parts/purchase.order/purchase.order.component') },
                     { path: 'purchase/order/maintenance/:id', title: 'Pedido de compra manuteção', loadComponent: () => import('./app/pages/parts/purchase.order.maintenance/purchase.order.maintenance.component') },
                    {
                        path: 'register',
                        children: [
                            { path: 'part', title: 'Peças', loadComponent: () => import('./app/pages/parts/register/parts/parts.component') },
                            { path: 'group', title: 'Grupo', loadComponent: () => import('./app/pages/parts/register/grouppart/grouppart.component') },
                            { path: 'category', title: 'Grupo', loadComponent: () => import('./app/pages/parts/register/category/category.component') },
                            { path: 'unit', title: 'Grupo', loadComponent: () => import('./app/pages/parts/register/unitmeasure/unitmeasure.component') },
                        ]
                    }
                ]
            },
            {
                path: 'workshop',
                children: [
                    { path: 'budget/list', title: 'Orçamento', loadComponent: () => import('./app/pages/workshop/budget/budget.component') },
                    {
                        path:'equipment',
                        children:[
                              { path: 'request/material', title: 'Requisições', loadComponent: () => import('./app/pages/workshop/equipment/request.equipment/request.equipment.component') },
                              {
                                path:'register',
                                children:[
                                     { path: 'category/material', title: 'Categoria', loadComponent: () => import('./app/pages/workshop/equipment/register/category/category.material.component') },
                                     { path: 'material', title: 'Material', loadComponent: () => import('./app/pages/workshop/equipment/register/material/material.component') },
                                ]
                              }
                        ]
                    },
                    {
                        path: 'register',
                        children: [
                            { path: 'mechanic', title: 'Cadastro de Mecânico', loadComponent: () => import('./app/pages/workshop/register/mechanic/mechanic.component') },
                            { path: 'mechanic/department', title: 'Cadastro de departamentos', loadComponent: () => import('./app/pages/workshop/register/mechanic.department/mechanic.department.component') },
                        ]
                    },
                ]

            },
            {
                path: 'invoicing',
                children: [
                    { path: 'client', title: 'Faturamento', loadComponent: () => import('./app/pages/invoicing/client/client.component') },
                    {
                        path: 'register', children: [
                            { path: 'category', title: 'Categoria', loadComponent: () => import('./app/pages/invoicing/register/category/category.component') },
                            { path: 'payment', title: 'Pagamento', loadComponent: () => import('./app/pages/invoicing/register/type-payment/type-payment.component') },
                        ]
                    }
                ]
            },
            {
                path: 'report',
                children: [
                    {
                        path: 'concierge', children: [
                            { path: 'vehicle/entry', title: 'Entrada de Veículos', loadComponent: () => import('./app/pages/reports/concierge/vehicle.entry/vehicle.entry.report.component') }
                        ]
                    },
                    {
                        path:'part', children:[
                            { path: 'purchase/order', title: 'Pedido de Comprar', loadComponent: () => import('./app/pages/reports/parts/purchase/purchase.report.component') }
                        ]
                    },
                    {
                        path:'workshop', children:[
                            { path: 'equipment/request/material', title: 'Requisições', loadComponent: () => import('./app/pages/reports/workshop/equipment/request.equipment.report/request.equipment.report.component') }
                        ]
                    }

                ]

            },


            {
                path: 'config',
                children: [
                    {
                        path: 'register',
                        children: [
                            { path: 'company', title: 'Empresa', loadComponent: () => import('./app/pages/settings/register/company/company') },
                            { path: 'user', title: 'Usuários', loadComponent: () => import('./app/pages/settings/register/user/user.component') },
                            { path: 'brand', title: 'Marcas', loadComponent: () => import('./app/pages/settings/register/brand/brand.component') }
                        ]
                    }
                ]

            }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadComponent: () => import('./app/pages/login/login') },
    { path: '**', redirectTo: '/notfound' }
];
