import { Injectable } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { VehicleEntry } from '@/app/models/vehicle.entry';

@Injectable({
    providedIn: 'root'
})
export class ShareWhatsappService {
    constructor() { }

    /* Share vehicle data via WhatsApp */
    shareVehicle(vehicle: VehicleEntry) {
        const uppercase = new UpperCasePipe();
        const datePipe = new DatePipe('pt-BR');
        //Alterar o fuso horário para o horário local
        vehicle.entryDate = this.formatDateTime(new Date(vehicle.entryDate));
        if (vehicle.exitDate)
            vehicle.exitDate = this.formatDateTime(new Date(vehicle.exitDate));
        if (vehicle.auth1ExitDate)
            vehicle.auth1ExitDate = this.formatDateTime(new Date(vehicle.auth1ExitDate));
        if (vehicle.auth2ExitDate)
            vehicle.auth2ExitDate = this.formatDateTime(new Date(vehicle.auth2ExitDate));

        const message = encodeURIComponent(`*Dados do Veículo*\n
          Código: ${vehicle.id}
          Placa: ${vehicle.vehiclePlate == '' ? '' : uppercase.transform(vehicle.vehiclePlate)}
          Frota: ${vehicle.vehicleFleet == '' ? '' : vehicle.vehicleFleet}
          Modelo: ${uppercase.transform(vehicle.modelDescription)}
          KM Entrada: ${vehicle.vehicleKmEntry}
          KM Saída: ${vehicle.vehicleKmExit}
          Empresa Código: ${vehicle.clientCompanyId == null ? '' : vehicle.clientCompanyId}
          Empresa Nome: ${vehicle.clientCompanyName == '' ? '' : uppercase.transform(vehicle.clientCompanyName)}
          Consultor: ${vehicle.attendantUserName == '' ? '' : uppercase.transform(vehicle.attendantUserName)}
          Consultor Obs.: ${vehicle.attendantInformation == '' ? '' : uppercase.transform(vehicle.attendantInformation)}
          
          Data Entrada: ${datePipe.transform(vehicle.entryDate, "dd/MM/yyyy HH:mm")}
          Porteiro Entrada: ${uppercase.transform(vehicle.entryUserName)}
          Porteiro Entrada Obs.: ${vehicle.entryInformation == '' ? '' : uppercase.transform(vehicle.entryInformation)}
          Entrada Foto1: ${vehicle.entryPhoto1Url}
          Entrada Foto2: ${vehicle.entryPhoto2Url}
          Entrada Foto3: ${vehicle.entryPhoto3Url}
          Entrada Foto4: ${vehicle.entryPhoto4Url}

          Data Saída: ${vehicle.exitDate == null ? '' : datePipe.transform(vehicle.exitDate, "dd/MM/yyyy HH:mm")}
          Porteiro Saída: ${vehicle.exitUserName == '' ? '' : uppercase.transform(vehicle.exitUserName)}
          Porteiro Saída Obs.: ${vehicle.exitInformation == '' ? '' : uppercase.transform(vehicle.exitInformation)}
          Saída Foto1: ${vehicle.exitPhoto1Url}
          Saída Foto2: ${vehicle.exitPhoto2Url}
          Saída Foto3: ${vehicle.exitPhoto3Url}
          Saída Foto4: ${vehicle.exitPhoto4Url}

          Motorista Entrada Código: ${vehicle.driverEntryId}
          Motorista Entrada Nome: ${uppercase.transform(vehicle.driverEntryName)}
          Motorista Saída Código: ${vehicle.driverExitId == null ? '' : vehicle.driverExitId}
          Motorista Saída Nome: ${vehicle.driverExitName == '' ? '' : uppercase.transform(vehicle.driverExitName)}
          O.S.: ${vehicle.numServiceOrder}
          NFe: ${vehicle.numNfe}
          NFS-e: ${vehicle.numNfse}
          Auto 1ª: ${vehicle.auth1ExitUserName} ${vehicle.auth1ExitDate == null ? '' : datePipe.transform(vehicle.auth1ExitDate, "dd/MM/yyyy HH:mm")}
          Auto 2ª: ${vehicle.auth2ExitUserName} ${vehicle.auth2ExitDate == null ? '' : datePipe.transform(vehicle.auth2ExitDate, "dd/MM/yyyy HH:mm")}
          `);
        window.open(`https://wa.me/?text=${message}`, '_blank');
    }

    private formatDateTime(date: Date): string {
        const datePipe = new DatePipe('en-US');
        // Obtém o fuso horário local no formato ±hh:mm
        const tzOffset = -date.getTimezoneOffset();
        const sign = tzOffset >= 0 ? '+' : '-';
        const hours = Math.floor(Math.abs(tzOffset) / 60).toString().padStart(2, '0');
        const minutes = (Math.abs(tzOffset) % 60).toString().padStart(2, '0');
        const timezone = `${sign}${hours}:${minutes}`;
        // Formata a data e adiciona o fuso horário
        return datePipe.transform(date, "yyyy-MM-dd'T'HH:mm:ss.SSS") + timezone;
    }

}