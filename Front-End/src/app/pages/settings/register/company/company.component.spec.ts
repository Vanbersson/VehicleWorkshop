import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import CompanyComponent from './company.component';
import { CompanyService } from '@/app/services/company.service';
import { BrandService } from '@/app/services/brand/brand.service';
import { ICompany as Company } from '@/app/interfaces/conf-company/i.company';
import { IResale as Resale } from '@/app/interfaces/conf-company/i.resale';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { environment } from '@/environments/environment';

describe('Company and resale registration', () => {
    let component: CompanyComponent;
    let service: jasmine.SpyObj<CompanyService>;
    let brandService: jasmine.SpyObj<BrandService>;
    const company: Company = {
        id: 1,
        status: StatusEnabDisabEnum.ENABLED,
        name: 'Empresa',
        cnpj: '12345678000190',
        email: '',
        phone: '',
        cellphone: '',
        zipCode: '01001000',
        state: 'SP',
        city: 'São Paulo',
        neighborhood: 'Centro',
        address: 'Praça da Sé',
        addressNumber: '1',
        addressComplement: ''
    };
    beforeEach(() => {
        service = jasmine.createSpyObj<CompanyService>('CompanyService', ['list', 'resales', 'saveCompany', 'saveResale', 'saveResaleLogo', 'removeResaleLogo']);
        service.list.and.returnValue(of([company]));
        service.resales.and.returnValue(of([]));
        brandService = jasmine.createSpyObj<BrandService>('BrandService', ['listAll']);
        brandService.listAll.and.returnValue(
            of([
                { id: 7, name: 'Marca A', status: StatusEnabDisabEnum.ENABLED },
                { id: 8, name: 'Marca B', status: StatusEnabDisabEnum.DISABLED }
            ])
        );
        TestBed.configureTestingModule({ providers: [CompanyComponent, { provide: CompanyService, useValue: service }, { provide: BrandService, useValue: brandService }, { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }] });
        component = TestBed.inject(CompanyComponent);
    });
    it('saves a new company and selects it to manage its resales', async () => {
        component.open('company');
        component.form.patchValue(company);
        service.saveCompany.and.returnValue(of(undefined));
        await component.save();
        const payload = service.saveCompany.calls.mostRecent().args[0];
        expect(payload.id).toBeUndefined();
        expect(payload.cnpj).toBe(company.cnpj);
        expect(component.selectedCompany()?.id).toBe(company.id);
        expect(component.dialogVisible).toBeFalse();
    });
    it('blocks a second company while allowing edits and additional resales', async () => {
        await component.load();
        component.open('company');
        expect(component.dialogVisible).toBeFalse();
        component.form.patchValue(company);
        await component.save();
        expect(service.saveCompany).not.toHaveBeenCalled();
        component.open('company', company);
        expect(component.editingId).toBe(company.id);
        expect(component.dialogVisible).toBeTrue();
        component.open('resale');
        component.form.patchValue({ ...company, cnpj: '12345678000270' });
        service.saveResale.and.returnValue(of({ ...company, id: 9, companyId: company.id }));
        await component.save();
        expect(service.saveResale).toHaveBeenCalledWith(jasmine.objectContaining({ companyId: company.id, cnpj: '12345678000270' }));
    });
    it('updates a resale with the selected company and existing resale code', async () => {
        await component.selectCompany(company);
        const resale: Resale = { ...company, id: 8, companyId: 1, name: 'Unidade', ie: '123456789' };
        component.open('resale', resale);
        component.form.controls.name.setValue('Unidade atualizada');
        service.saveResale.and.returnValue(of({ ...resale, name: 'Unidade atualizada' }));
        await component.save();
        expect(service.saveResale).toHaveBeenCalledWith(jasmine.objectContaining({ id: 8, companyId: 1, name: 'Unidade atualizada', ie: '123456789' }));
        expect(service.saveCompany).not.toHaveBeenCalled();
    });
    it('rejects invalid forms and prevents a resale without a company', async () => {
        component.open('resale');
        expect(component.dialogVisible).toBeFalse();
        component.open('company');
        await component.save();
        expect(service.saveCompany).not.toHaveBeenCalled();
        expect(component.saveError()).toBeTruthy();
    });
    it('preserves the form on duplicate CNPJ errors', async () => {
        component.open('company', company);
        service.saveCompany.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
        await component.save();
        expect(component.dialogVisible).toBeTrue();
        expect(component.form.controls.name.value).toBe(company.name);
        expect(component.saveError()).toContain('CNPJ');
        expect(component.saving()).toBeFalse();
    });
    it('ignores a stale resale response after another company is selected', async () => {
        const previous = new Subject<Resale[]>();
        service.resales.and.callFake((id) => (id === 1 ? previous : of([])));
        const pending = component.selectCompany(company);
        await component.selectCompany({ ...company, id: 2 });
        previous.next([{ ...company, id: 8, companyId: 1 }]);
        previous.complete();
        await pending;
        expect(component.selectedCompany()?.id).toBe(2);
        expect(component.resales()).toEqual([]);
    });
    it('defers logo removal until saving and restores the preview when reopening after cancelling', async () => {
        await component.selectCompany(company);
        const resale: Resale = { ...company, id: 8, companyId: 1, logoUrl: '/images/1/8/branding/logo.png' };
        component.open('resale', resale);
        expect(component.logoPreview()).toContain(resale.logoUrl!);
        component.removeLogo();
        expect(component.logoPreview()).toBe('');
        expect(service.removeResaleLogo).not.toHaveBeenCalled();
        component.dialogVisible = false;
        component.open('resale', resale);
        expect(component.logoPreview()).toContain(resale.logoUrl!);
    });
    it('removes a resale logo only after the registration has saved', async () => {
        await component.selectCompany(company);
        const resale: Resale = { ...company, id: 8, companyId: 1, logoUrl: '/images/logo.png' };
        component.open('resale', resale);
        component.removeLogo();
        service.saveResale.and.returnValue(of(resale));
        service.removeResaleLogo.and.returnValue(of({ ...resale, logoUrl: '' }));
        await component.save();
        expect(service.removeResaleLogo).toHaveBeenCalledWith(1, 8);
        expect(component.dialogVisible).toBeFalse();
    });
    it('resolves uploaded logos under the API deployment path', () => {
        expect(component.logoImageUrl('/images/1/8/branding/logo.png')).toBe(environment.apiuUrl.replace(/\/+$/, '') + '/images/1/8/branding/logo.png');
        expect(component.logoImageUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
        expect(component.logoImageUrl('javascript:alert(1)')).toBe('');
    });
    it('loads, preselects and saves the represented brand of a resale', async () => {
        await component.loadBrands();
        await component.selectCompany(company);
        const resale: Resale = { ...company, id: 8, companyId: 1, brandId: 7 };
        component.open('resale', resale);
        expect(component.form.controls.brandId.value).toBe(7);
        expect(component.brandName(7)).toBe('Marca A');
        service.saveResale.and.returnValue(of(resale));
        await component.save();
        expect(service.saveResale).toHaveBeenCalledWith(jasmine.objectContaining({ brandId: 7 }));
    });
    it('rejects assigning a disabled brand and allows clearing an existing brand', async () => {
        await component.loadBrands();
        await component.selectCompany(company);
        const resale: Resale = { ...company, id: 8, companyId: 1, brandId: 7 };
        component.open('resale', resale);
        component.form.controls.brandId.setValue(8);
        await component.save();
        expect(service.saveResale).not.toHaveBeenCalled();
        expect(component.saveError()).toContain('habilitada');
        component.form.controls.brandId.setValue(null);
        service.saveResale.and.returnValue(of({ ...resale, brandId: null }));
        await component.save();
        expect(service.saveResale).toHaveBeenCalledWith(jasmine.objectContaining({ brandId: null }));
    });
});
