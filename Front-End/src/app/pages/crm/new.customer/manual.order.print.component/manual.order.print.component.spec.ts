import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualOrderPrintComponent } from './manual.order.print.component';

describe('ManualOrderPrintComponent', () => {
    let component: ManualOrderPrintComponent;
    let fixture: ComponentFixture<ManualOrderPrintComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ManualOrderPrintComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ManualOrderPrintComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
