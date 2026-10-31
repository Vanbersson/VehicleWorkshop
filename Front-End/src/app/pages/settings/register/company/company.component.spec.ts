import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import CompanyComponent from './company.component';
import { CompanyService } from '@/app/services/company.service';
import { Company, Resale } from '@/app/models/company';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';

describe('Company and resale registration', () => {
    let component: CompanyComponent;
    let service: jasmine.SpyObj<CompanyService>;
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
        service = jasmine.createSpyObj<CompanyService>('CompanyService', ['list', 'resales', 'saveCompany', 'saveResale']);
        service.list.and.returnValue(of([company]));
        service.resales.and.returnValue(of([]));
        TestBed.configureTestingModule({ providers: [CompanyComponent, { provide: CompanyService, useValue: service }, { provide: MessageService, useValue: { add: jasmine.createSpy('add') } }] });
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
});
