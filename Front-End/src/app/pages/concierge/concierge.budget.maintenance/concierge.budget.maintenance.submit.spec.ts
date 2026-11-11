import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import ConciergeBudgetMaintenanceComponent from './concierge.budget.maintenance.component';
import { VehicleEntryService } from '@/app/services/vehicle/vehicle.entry.service';
import { TypePaymentService } from '@/app/services/client/type.payment.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { ConciergeBudgetService } from '@/app/services/concierge/concierge.budget.service';
import { VehicleEntry } from '@/app/models/vehicle.entry';

describe('Budget save button', () => {
    for (const missingEntryData of [false, true]) {
        it('requires a salesperson and sends its ID when present: ' + missingEntryData, async () => {
            TestBed.configureTestingModule({
                imports: [ConciergeBudgetMaintenanceComponent],
                providers: [
                    provideRouter([]),
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    { provide: StorageService, useValue: { companyId: 1, resaleId: 2, token: 'test-token' } },
                    { provide: VehicleEntryService, useValue: { listAllPlates: () => of([{ ...new VehicleEntry(), id: 7, clientCompanyId: 2, salespersonId: missingEntryData ? null : 3, clientCompanyName: 'Cliente' }]) } },
                    { provide: TypePaymentService, useValue: { listAllEnabled: () => of([]) } }
                ]
            });
            spyOn(TestBed.inject(ConciergeBudgetService), 'attendants').and.returnValue(of([{ id: 3, name: 'Atendente' }]));
            const fixture = TestBed.createComponent(ConciergeBudgetMaintenanceComponent);
            fixture.detectChanges();
            await fixture.whenStable();
            const component = fixture.componentInstance;
            component.form.controls.vehicleId.setValue(7);
            component.selectVehicle(7);
            component.addItem(0);
            component.items.at(0).patchValue({ description: 'Peca', quantity: 2, price: 10, discount: 0 });
            fixture.detectChanges();
            await fixture.whenStable();
            const button = fixture.nativeElement.querySelector('.summary-save button') as HTMLButtonElement;
            expect(button.disabled).toBeFalse();
            button.click();
            const http = TestBed.inject(HttpTestingController);
            if (missingEntryData) {
                expect(component.form.controls.salespersonUserId.invalid).toBeTrue();
                http.expectNone((req) => req.method === 'POST');
                http.verify();
                return;
            }
            const request = http.expectOne((req) => req.method === 'POST' && req.url.endsWith('/concierge/budgets/1/2'));
            expect(request.request.body.vehicleId).toBe(7);
            expect(request.request.body.clientCompanyId).toBe(2);
            expect(request.request.body.salespersonUserId).toBe(missingEntryData ? null : 3);
            expect(request.request.body.items.length).toBe(1);
            expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
            request.flush({ message: 'Erro de teste' }, { status: 400, statusText: 'Bad Request' });
            fixture.detectChanges();
            expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Erro de teste');
            expect(component.saving()).toBeFalse();
            http.verify();
        });
    }
});
