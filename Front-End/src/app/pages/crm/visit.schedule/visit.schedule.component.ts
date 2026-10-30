import { Component } from '@angular/core';

import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-visit.schedule',
  standalone: true,
  imports: [DatePickerModule],
  templateUrl: './visit.schedule.component.html',
  styleUrl: './visit.schedule.component.scss',
})
export default class VisitScheduleComponent {

}
