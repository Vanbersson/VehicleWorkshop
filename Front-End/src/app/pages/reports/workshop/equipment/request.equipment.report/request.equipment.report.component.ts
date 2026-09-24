import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-request.equipment.report',
  imports: [CommonModule, ButtonModule, TableModule, ToastModule],
  templateUrl: './request.equipment.report.component.html',
  styleUrl: './request.equipment.report.component.scss',
  providers:[MessageService]
})
export default class RequestEquipmentReportComponent {

}
