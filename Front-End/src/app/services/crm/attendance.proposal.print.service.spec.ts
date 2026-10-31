import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AttendanceProposalPrintService } from './attendance.proposal.print.service';
import { CompanyService } from '@/app/services/company.service';
import { SalespersonService } from '@/app/services/salesperson/salesperson.service';
import { ClientCompanyService } from '@/app/services/client/client.company.service';
import { Resale } from '@/app/models/company';
import { Salesperson } from '@/app/models/crm/salesperson';
import { ClientCompany } from '@/app/models/client.company';
import { Visit } from '@/app/models/crm/visit/visit';
import { AttendanceStatus, CustomerAttendance } from '@/app/models/crm/customer.attendance';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';

describe('Commercial proposal printing', () => {
    let service: AttendanceProposalPrintService;
    let companies: jasmine.SpyObj<CompanyService>;
    let salespersons: jasmine.SpyObj<SalespersonService>;
    let clients: jasmine.SpyObj<ClientCompanyService>;
    let printer: jasmine.Spy;
    const visit = Object.assign(new Visit(), { id: 42, companyId: 1, resaleId: 8, clientCPF: '12345678901', contact: 'cliente@example.com' });
    const attendance: CustomerAttendance = {
        id: 3,
        visitId: 42,
        clientId: 9,
        clientName: 'Cliente da visita',
        salespersonId: 7,
        salespersonName: 'Vendedor',
        dateCreated: '',
        dateVisit: null,
        status: AttendanceStatus.COMMERCIAL_PROPOSAL,
        notes: '',
        proposalNotes: 'Condições comerciais',
        version: 0
    };
    const resale: Resale = {
        id: 8,
        companyId: 1,
        status: StatusEnabDisabEnum.ENABLED,
        name: 'Revenda Centro',
        cnpj: '12345678000190',
        email: 'revenda@example.com',
        phone: '1133334444',
        cellphone: '11999998888',
        zipCode: '01001000',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        address: 'Rua da Revenda',
        addressNumber: '10',
        addressComplement: 'Sala 1'
    };

    beforeEach(() => {
        companies = jasmine.createSpyObj<CompanyService>('CompanyService', ['resales']);
        salespersons = jasmine.createSpyObj<SalespersonService>('SalespersonService', ['filterId']);
        clients = jasmine.createSpyObj<ClientCompanyService>('ClientCompanyService', ['filterId']);
        companies.resales.and.returnValue(of([{ ...resale, id: 99, name: 'Outra revenda' }, resale]));
        salespersons.filterId.and.returnValue(of(new HttpResponse({ body: Object.assign(new Salesperson(), { id: 7, name: 'Maria Vendedora', dddCellphone: '11', cellphone: '988887777' }) })));
        clients.filterId.and.returnValue(
            of(
                new HttpResponse({
                    body: {
                        status: StatusSuccessError.succes,
                        header: '',
                        message: '',
                        data: Object.assign(new ClientCompany(), {
                            id: 9,
                            name: 'Cliente cadastrado',
                            cnpj: '98765432000110',
                            address: 'Rua do Cliente',
                            addressNumber: '20',
                            city: 'Campinas',
                            state: 'SP',
                            phone: '32223333',
                            dddPhone: '19',
                            emailWork: 'compras@example.com'
                        })
                    }
                })
            )
        );
        TestBed.configureTestingModule({
            providers: [
                { provide: CompanyService, useValue: companies },
                { provide: SalespersonService, useValue: salespersons },
                { provide: ClientCompanyService, useValue: clients }
            ]
        });
        service = TestBed.inject(AttendanceProposalPrintService);
        printer = spyOn<any>(service, 'openPrintDialog');
    });

    it('prints the visit resale, seller and complete customer details', async () => {
        await service.print(attendance, visit, jasmine.createSpy('onError'));
        expect(companies.resales).toHaveBeenCalledWith(1);
        expect(salespersons.filterId).toHaveBeenCalledWith(7);
        expect(clients.filterId).toHaveBeenCalledWith(9);
        const html: string = printer.calls.mostRecent().args[1];
        for (const text of [
            'Revenda Centro',
            '12.345.678/0001-90',
            'Rua da Revenda, 10',
            'revenda@example.com',
            'Maria Vendedora',
            '(11) 98888-7777',
            'Cliente cadastrado',
            '98.765.432/0001-10',
            'Rua do Cliente, 20',
            '(19) 3222-3333',
            'compras@example.com',
            'Condições comerciais'
        ])
            expect(html).toContain(text);
        expect(html).not.toContain('Outra revenda');
    });

    it('uses the visit identification and contact for a customer without registration', async () => {
        await service.print({ ...attendance, clientId: null }, visit, jasmine.createSpy('onError'));
        const html: string = printer.calls.mostRecent().args[1];
        expect(html).toContain('Cliente da visita');
        expect(html).toContain('123.456.789-01');
        expect(html).toContain('cliente@example.com');
        expect(html).toContain('Não informado');
        expect(clients.filterId).not.toHaveBeenCalled();
    });

    it('escapes proposal text and customer-supplied data', async () => {
        await service.print({ ...attendance, clientId: null, clientName: '<img src=x onerror=alert(1)>', proposalNotes: '<script>alert(1)</script>' }, visit, jasmine.createSpy('onError'));
        const html: string = printer.calls.mostRecent().args[1];
        expect(html).toContain('&lt;img');
        expect(html).toContain('&lt;script&gt;');
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('<img');
    });

    it('does not open an incomplete proposal when loading customer data fails', async () => {
        clients.filterId.and.returnValue(throwError(() => new Error('Offline')));
        await expectAsync(service.print(attendance, visit, jasmine.createSpy('onError'))).toBeRejected();
        expect(printer).not.toHaveBeenCalled();
    });

    it('does not substitute a different resale when the visit resale is missing', async () => {
        companies.resales.and.returnValue(of([{ ...resale, id: 99 }]));
        await expectAsync(service.print(attendance, visit, jasmine.createSpy('onError'))).toBeRejectedWithError('Não foi possível localizar os dados da revenda da visita.');
        expect(printer).not.toHaveBeenCalled();
    });
});
