import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { buildVehiclePrintHtml, vehiclePrintPhotos, VehiclePrintData, VehiclePrintService, VEHICLE_PRINTER } from './vehicle.print.service';
import { VehicleEntry } from '@/app/models/vehicle.entry';
import { ClientCompany } from '@/app/models/client.company';
import { Driver } from '@/app/models/driver';
import { IResale as Resale } from '@/app/interfaces/conf-company/i.resale';
import { YesNotEnum } from '@/app/models/yes.not.enum';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StatusVehicleAuthEnum } from '@/app/models/status.vehicle.auth.enum';
import { CompanyService } from '@/app/services/company.service';
import { VehicleEntryService } from './vehicle.entry.service';

describe('Vehicle print report', () => {
    const resale: Resale = {
        id: 2,
        companyId: 1,
        status: StatusEnabDisabEnum.ENABLED,
        name: 'Resale',
        cnpj: '12345678000190',
        email: 'omit-resale-email',
        phone: 'omit-phone',
        cellphone: '',
        zipCode: '12345678',
        state: 'SP',
        city: 'City',
        neighborhood: 'Area',
        address: 'omit-resale-address',
        addressNumber: '10',
        addressComplement: ''
    };
    let data: VehiclePrintData;
    beforeEach(() => {
        data = {
            vehicle: Object.assign(new VehicleEntry(), {
                id: 42,
                companyId: 1,
                resaleId: 2,
                vehiclePlate: 'ABC1234',
                modelDescription: 'Truck',
                vehicleColor: 'Blue',
                vehicleFleet: 'Fleet1',
                salespersonName: 'Consultant',
                entryDate: '2024-01-01T10:00:00Z',
                vehicleKmEntry: 'omit-km',
                numServiceOrder: 'OS42',
                numNfe: 'NFE1',
                numNfse: 'NFSE2',
                entryInformation: 'omit-arrival',
                exitInformation: 'omit-exit',
                attendantInformation: 'omit-consultant-notes',
                auth1ExitUserName: 'omit-authorizer'
            }),
            client: Object.assign(new ClientCompany(), { id: 3, name: 'Owner', cnpj: '12345678000190', contactName: 'omit-contact', address: 'omit-owner-address', cpf: 'omit-owner-cpf' }),
            driverEntry: Object.assign(new Driver(), { id: 4, name: 'Driver in', cnhRegister: 'omit-cnh', email: 'omit-driver-email' }),
            driverExit: Object.assign(new Driver(), { id: 5, name: 'Driver out' })
        };
    });
    it('includes precisely the requested identification, fiscal and authorization fields', () => {
        const html = buildVehiclePrintHtml(data, resale, []);
        for (const value of ['Resale', '12.345.678/0001-90', 'Consultant', 'Truck', 'ABC1234', 'Blue', 'Fleet1', 'OS42', 'NFE1', 'NFSE2', 'Owner', 'Driver in', 'Driver out', '>3</dd>', '>4</dd>', '>5</dd>']) expect(html).toContain(value);
        expect((html.match(/<dt>/g) || []).length).toBe(18);
    });
    it('excludes portaria, history, checklist, dates, mileage, contact and driver documents', () => {
        const html = buildVehiclePrintHtml(data, resale, []);
        for (const value of ['omit-', 'Histórico', 'Checklist', 'Portaria', 'Quilometragem', 'Observações', 'Nascimento', 'Validade', 'Emitido em', 'Atendimento #', 'Telefone', 'E-mail', 'CPF', 'CNH']) expect(html).not.toContain(value);
    });
    it('reports exit authorization only after the final authorization', () => {
        for (const value of [StatusVehicleAuthEnum.NOT, StatusVehicleAuthEnum.FIST]) {
            data.vehicle.authExitStatus = value;
            expect(buildVehiclePrintHtml(data, resale, [])).toContain('Saída autorizada</dt><dd>Não</dd>');
        }
        data.vehicle.authExitStatus = StatusVehicleAuthEnum.AUTH;
        expect(buildVehiclePrintHtml(data, resale, [])).toContain('Saída autorizada</dt><dd>Sim</dd>');
    });
    it('escapes names and plate values rather than rendering executable HTML', () => {
        data.client!.name = '<script>alert(1)</script>';
        data.vehicle.vehiclePlate = '"><img src=x onerror=alert(1)>';
        const html = buildVehiclePrintHtml(data, resale, []);
        expect(html).not.toContain('<script>');
        expect(html).not.toContain('<img src=x');
        expect(html).toContain('&lt;script&gt;');
    });
    it('collects only consultant photos even when every other photo exists', () => {
        for (const prefix of ['entry', 'attendant', 'exit'] as const) for (const index of [1, 2, 3, 4] as const) data.vehicle[`${prefix}Photo${index}Url`] = `https://example.com/${prefix}${index}.jpg`;
        for (const driver of [data.driverEntry!, data.driverExit!]) {
            driver.photoDriverUrl = 'https://example.com/person.jpg';
            driver.photoDoc1Url = 'https://example.com/front.jpg';
            driver.photoDoc2Url = 'https://example.com/back.jpg';
        }
        const photos = vehiclePrintPhotos(data);
        expect(photos.length).toBe(4);
        expect(photos.every((photo) => photo.source.includes('/attendant'))).toBeTrue();
    });
    it('handles unplated vehicles and missing registrations without adding other fields', () => {
        data.vehicle.vehicleNew = YesNotEnum.YES;
        data.client = null;
        data.driverExit = null;
        expect(buildVehiclePrintHtml(data, resale, [])).toContain('Sem placa');
        expect(buildVehiclePrintHtml(data, resale, [])).toContain('Não informado');
        expect(buildVehiclePrintHtml(data, resale, [])).toContain('Nenhuma foto do consultor cadastrada');
    });
    it('uses embedded raster images and identifies unavailable consultant photos', () => {
        const html = buildVehiclePrintHtml(data, resale, [
            { label: 'Consultant photo', source: 'data:image/png;base64,YQ==' },
            { label: 'Unavailable', source: 'javascript:alert(1)' }
        ]);
        expect(html).toContain('<img src="data:image/png;base64,YQ=="');
        expect(html).not.toContain('javascript:');
        expect(html).toContain('Imagem indisponível');
    });
    describe('preparation', () => {
        let service: VehiclePrintService;
        let printer: jasmine.Spy;
        let companies: jasmine.SpyObj<CompanyService>;
        let vehicles: jasmine.SpyObj<VehicleEntryService>;
        beforeEach(() => {
            printer = jasmine.createSpy('printer');
            companies = jasmine.createSpyObj('Companies', ['resales']);
            vehicles = jasmine.createSpyObj('Vehicles', ['history']);
            companies.resales.and.returnValue(of([resale]));
            TestBed.configureTestingModule({
                providers: [
                    { provide: VEHICLE_PRINTER, useValue: printer },
                    { provide: CompanyService, useValue: companies },
                    { provide: VehicleEntryService, useValue: vehicles }
                ]
            });
            service = TestBed.inject(VehiclePrintService);
        });
        it('completes after printing or cancellation without requiring a window focus event', async () => {
            printer.and.callFake((options) => options.onLoadingEnd?.());
            await service.print(data, () => {});
            expect(printer).toHaveBeenCalledTimes(1);
        });
        it('propagates print failures so the component can release its loading state', async () => {
            printer.and.callFake((options) => {
                options.onError(new Error('Printer failed'));
                options.onLoadingEnd?.();
            });
            await expectAsync(service.print(data, () => {})).toBeRejectedWithError('Printer failed');
        });
        it('warns about failed consultant images without blocking the report', async () => {
            data.vehicle.attendantPhoto1Url = 'https://example.com/consultant.jpg';
            spyOn<any>(service, 'loadPhoto').and.resolveTo('');
            const print = spyOn<any>(service, 'openPrintDialog').and.resolveTo();
            const warning = jasmine.createSpy('warning');
            await service.print(data, warning);
            expect(companies.resales).toHaveBeenCalledWith(1);
            expect(warning).toHaveBeenCalled();
            expect(print.calls.mostRecent().args[1]).toContain('Imagem indisponível');
        });
        it('does not open printing when the resale cannot be identified', async () => {
            companies.resales.and.returnValue(of([]));
            const print = spyOn<any>(service, 'openPrintDialog');
            await expectAsync(service.print(data, () => {})).toBeRejected();
            expect(print).not.toHaveBeenCalled();
        });
        it('does not request history or load entry, exit and driver photographs', async () => {
            data.vehicle.entryPhoto1Url = 'https://example.com/entry.jpg';
            data.vehicle.exitPhoto1Url = 'https://example.com/exit.jpg';
            data.driverEntry!.photoDoc1Url = 'https://example.com/document.jpg';
            const load = spyOn<any>(service, 'loadPhoto');
            const print = spyOn<any>(service, 'openPrintDialog').and.resolveTo();
            await service.print(data, () => {});
            expect(vehicles.history).not.toHaveBeenCalled();
            expect(load).not.toHaveBeenCalled();
            expect(print).toHaveBeenCalled();
        });
    });
});
