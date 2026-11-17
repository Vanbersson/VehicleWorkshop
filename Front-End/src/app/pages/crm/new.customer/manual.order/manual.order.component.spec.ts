import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualOrderComponent } from './manual.order.component';

describe('ManualOrderComponent', () => {
    let component: ManualOrderComponent;
    let fixture: ComponentFixture<ManualOrderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ManualOrderComponent],
            providers: [provideHttpClient()]
        }).compileComponents();

        fixture = TestBed.createComponent(ManualOrderComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
