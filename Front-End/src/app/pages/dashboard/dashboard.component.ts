import { Component, DoCheck, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
//PrimeNg
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { ClientCompany } from '@/app/models/client.company';
import { LoadingService } from '@/app/services/loading/loading.service';
import { FilterClientComponent } from '@/app/components/filter.client/filter.client.component';
import { DashboardService } from '@/app/services/dashboard/dashboard.service';
import { PrimeNG } from 'primeng/config';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, FormsModule, ButtonModule, InputTextModule, FilterClientComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  providers: []
})
export default class DashboardComponent implements OnInit, DoCheck {
  //Vehicle
  countVehicle = signal<Array<number>>([0, 0, 0, 0]);
  //ClientCompany
  clientCompany!: ClientCompany;
  clientName!: string;
  selectClientCompany = signal<ClientCompany>(new ClientCompany());
  clientData1: any;
  clientOptions1: any;
  clientData2: any;
  clientOptions2: any;

  yearNow = signal<number>(Number.parseInt(new Date().getFullYear().toString()));
  isSearchClient: boolean = false;

  constructor(
    private primeng: PrimeNG,
    private loadingService: LoadingService,
    private dashboardService: DashboardService
  ) {
  }
  ngDoCheck(): void {
    //Client
    if (this.selectClientCompany().id != null) {
      this.clientCompany = this.selectClientCompany();
      this.clientName = this.clientCompany.name;
      //Search client
      this.searchClient(this.clientCompany.id!);
      this.selectClientCompany.set(new ClientCompany());
    }
  }

  async ngOnInit(): Promise<void> {
    this.primeng.setTranslation({
      startsWith: 'Inicia com',
      contains: 'Contém',
      notContains: 'Não contém',
      endsWith: 'Termina com',
      equals: 'Igual',
      notEquals: 'Diferente',
      noFilter: 'Sem filtro',
      lt: 'Menor que',
      lte: 'Menor ou igual',
      gt: 'Maior que',
      gte: 'Maior ou igual',
      dateIs: 'Data igual',
      dateIsNot: 'Data diferente',
      dateBefore: 'Antes de',
      dateAfter: 'Depois de',
      clear: 'Limpar',
      apply: 'Aplicar',
      matchAll: 'Corresponder a todos',
      matchAny: 'Corresponder a qualquer',
      dayNames: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
      dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
      dayNamesMin: ["D", "S", "T", "Q", "Q", "S", "S"],
      monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
      monthNamesShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
    });

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    this.clientData1 = {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      datasets: [
        {
          label: `Ano: ${this.yearNow() - 1}`,
          backgroundColor: ['rgba(255, 159, 64, 0.2)'],
          borderColor: ['rgb(255, 159, 64)'],
          borderWidth: 1
        },
        {
          label: `Ano: ${this.yearNow()}`,
          backgroundColor: ['rgba(54, 162, 235, 0.2)'],
          borderColor: ['rgb(54, 162, 235)'],
          borderWidth: 1
        }
      ]
    };
    this.clientOptions1 = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    this.clientData2 = {
      labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      datasets: [
        {
          label: `Ano: ${this.yearNow() - 1}`,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--orange-500'),
          backgroundColor: documentStyle.getPropertyValue('--orange-100'),
          borderWidth: 1,
          tension: 0.4
        },
        {
          label: `Ano: ${this.yearNow()}`,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          backgroundColor: documentStyle.getPropertyValue('--blue-100'),
          borderWidth: 1,
          tension: 0.4
        }
      ]
    };
    this.clientOptions2 = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    await this.init();
  }

  async init(): Promise<void> {
    //pesquisa de cliente
    this.isSearchClient = false;
    //Clean Name
    this.clientName = "";
    //Clear data
    this.clientData1.datasets[0].data = [];
    this.clientData1.datasets[1].data = [];
    //Clear data
    this.clientData2.datasets[0].data = [];
    this.clientData2.datasets[1].data = [];

    const previousYear = this.yearNow() - 1;
    const currentYear = this.yearNow();

    //total de veículos na empresa e autorizados
    const responseVehicle = await this.countVehiclePenAuth();
    if (responseVehicle.status == 200) {
      this.countVehicle.set(responseVehicle.body!);
    }
    const responseClientData1 = await this.countVehicleFilterYear(previousYear);
    if (responseClientData1.status == 200) {
      this.clientData1.datasets[0].data = [...responseClientData1.body!];
    }
    const responseClientData2 = await this.countVehicleFilterYear(currentYear);
    if (responseClientData2.status == 200) {
      this.clientData1.datasets[1].data = [...responseClientData2.body!];
    }
    //Update graphic
    this.clientData1 = { ... this.clientData1 };

    const resultClientData1 = await this.countYesServiceFilterYear(previousYear);
    if (resultClientData1.status == 200) {
      this.clientData2.datasets[0].data = [...resultClientData1.body!];
    }
    const resultClientData2 = await this.countYesServiceFilterYear(currentYear);
    if (resultClientData2.status == 200) {
      this.clientData2.datasets[1].data = [...resultClientData2.body!];
    }
    //Update graphic
    this.clientData2 = { ...this.clientData2 };
  }

  private async searchClient(clientId: number) {
    //Inicia o load
    this.loadingService.show();
    this.clientData1.datasets[0].data = [];
    this.clientData1.datasets[1].data = [];
    const responseClientData1 = await this.countVehicleFilterYearClient(this.yearNow() - 1, clientId);
    if (responseClientData1.status == 200) {
      //Cliente encontrado
      this.isSearchClient = true;
      for (const d of responseClientData1.body!) {
        this.clientData1.datasets[0].data.push(d);
      }
    }
    const responseClientData2 = await this.countVehicleFilterYearClient(this.yearNow(), clientId);
    if (responseClientData2.status == 200) {
      //Cliente encontrado
      this.isSearchClient = true;
      for (const d of responseClientData2.body!) {
        this.clientData1.datasets[1].data.push(d);
      }
    }
    //Update graphic
    this.clientData1 = { ... this.clientData1 };
    //Clear data
    this.clientData2.datasets[0].data = [];
    this.clientData2.datasets[1].data = [];
    const resultClientData1 = await this.countYesServiceFilterYearClient(this.yearNow() - 1, clientId);
    if (resultClientData1.status == 200) {
      //Cliente encontrado
      this.isSearchClient = true;
      for (const d of resultClientData1.body!) {
        this.clientData2.datasets[0].data.push(d);
      }
    }
    const resultClientData2 = await this.countYesServiceFilterYearClient(this.yearNow(), clientId);
    if (resultClientData2.status == 200) {
      //Cliente encontrado
      this.isSearchClient = true;
      for (const d of resultClientData2.body!) {
        this.clientData2.datasets[1].data.push(d);
      }
    }
    //Fecha o load
    this.loadingService.hide();
    this.clientData2 = { ...this.clientData2 };
  }
  private async countVehiclePenAuth(): Promise<HttpResponse<any[]>> {
    try {
      return await lastValueFrom(this.dashboardService.countVehiclePenAuth());
    } catch (error: any) {
      return error;
    }
  }
  private async countYesServiceFilterYear(year: number): Promise<HttpResponse<any[]>> {
    try {
      return await lastValueFrom(this.dashboardService.countYesServiceFilterYear(year));
    } catch (error: any) {
      return error;
    }
  }
  private async countNotServiceFilterYear(year: number): Promise<HttpResponse<any[]>> {
    try {
      return await lastValueFrom(this.dashboardService.countNotServiceFilterYear(year));
    } catch (error: any) {
      return error;
    }
  }
  private async countYesServiceFilterYearClient(year: number, clientId: number): Promise<HttpResponse<any[]>> {
    try {
      return await lastValueFrom(this.dashboardService.countYesServiceFilterYearClient(year, clientId));
    } catch (error: any) {
      return error;
    }
  }
  private async countVehicleFilterYear(year: number): Promise<HttpResponse<any[]>> {
    try {
      return await lastValueFrom(this.dashboardService.countVehicleFilterYear(year));
    } catch (error: any) {
      return error;
    }
  }
  private async countVehicleFilterYearClient(year: number, clientId: number): Promise<HttpResponse<any[]>> {
    try {
      return await lastValueFrom(this.dashboardService.countVehicleFilterYearClient(year, clientId));
    } catch (error: any) {
      return error;
    }
  }
}
