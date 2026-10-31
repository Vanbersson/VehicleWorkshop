import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import VisitComponent from './visit.component';
import { VisitService } from '@/app/services/crm/visit/visit.service';
import { LoadingService } from '@/app/services/loading/loading.service';
import { Visit } from '@/app/models/crm/visit/visit';
import { StatusVisitEnum } from '@/app/models/crm/visit/status.visit.enum';

describe('Visit scheduling actions', () => {
    let component: VisitComponent;
    let navigate: jasmine.Spy;
    beforeEach(() => {
        navigate = jasmine.createSpy('navigate').and.resolveTo(true);
        TestBed.configureTestingModule({ providers: [VisitComponent, { provide: VisitService, useValue: {} }, { provide: MessageService, useValue: {} }, { provide: LoadingService, useValue: {} }, { provide: Router, useValue: { navigate } }] });
        component = TestBed.inject(VisitComponent);
    });
    it('opens the agenda with the scheduled visit identifier', async () => {
        await component.editScheduling(Object.assign(new Visit(), { id: 42, status: StatusVisitEnum.AGENDA }));
        expect(navigate).toHaveBeenCalledWith(['/crm/visit/schedule'], { state: { editAgendaId: 42 } });
    });
    it('does not edit the schedule of started or completed visits', async () => {
        await component.editScheduling(Object.assign(new Visit(), { id: 42, status: StatusVisitEnum.OPEN }));
        await component.editScheduling(Object.assign(new Visit(), { id: 42, status: StatusVisitEnum.CLOSE }));
        expect(navigate).not.toHaveBeenCalled();
    });
});
