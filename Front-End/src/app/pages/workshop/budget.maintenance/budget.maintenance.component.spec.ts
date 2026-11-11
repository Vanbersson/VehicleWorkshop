import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetMaintenanceComponent } from './budget.maintenance.component';

describe('BudgetMaintenanceComponent', () => {
    let component: BudgetMaintenanceComponent;
    let fixture: ComponentFixture<BudgetMaintenanceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BudgetMaintenanceComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(BudgetMaintenanceComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
