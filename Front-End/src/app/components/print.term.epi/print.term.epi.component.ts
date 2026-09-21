import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import printJS from 'print-js';
import { ToolControlMatMec } from '@/app/models/workshop/tool.control/tool.control.mat.mec';
import { ToolControlRequest } from '@/app/models/workshop/tool.control/tool.control.request';

@Component({
  selector: 'app-print-epi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print.term.epi.component.html',
  styleUrl: './print.term.epi.component.scss'
})
export class PrintTermEpiComponent {
  reqId: number = 0;
  nameMec: string = '';
  depMec: string = '';
  listEPI: ToolControlMatMec[] = [];

  constructor() { }

  async print(reqId: number, nameMec: string, depMec: string, listMat: ToolControlMatMec[]) {
    this.reqId = reqId;
    this.nameMec = nameMec;
    this.depMec = depMec;
    this.listEPI = listMat;
    setTimeout(() => {
      const print = document.getElementById('print-EPI');
      print!.style.display = 'block';
      printJS({
        printable: 'print-EPI',
        type: 'html',
        targetStyles: ['*'], // Inclui todos os estilos aplicáveis
        scanStyles: true,
        documentTitle: 'Ficha EPI',
        font_size: '10pt'
      });
      print!.style.display = 'none';
    }, 200);
  }
}


