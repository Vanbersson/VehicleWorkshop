import { StatusVehicleAuthEnum } from "./status.vehicle.auth.enum";
import { StatusVehicleEnum } from "./status.vehicle.enum";
import { StatusVehicleStepEnum } from "./status.vehicle.step.enum";


export class VehicleEntry {
    companyId: number | null = null;
    resaleId: number | null = null;
    id: number | null = null;
    status: StatusVehicleEnum = StatusVehicleEnum.ENTERED;
    stepEntry: StatusVehicleStepEnum = StatusVehicleStepEnum.ATTENDANT;
    budgetId: number | null = null;

    entryUserId: number | null = null;
    entryUserName: string = '';
    entryDate: Date | string = '';
    entryPhoto1Url: string = '';
    entryPhoto2Url: string = '';
    entryPhoto3Url: string = '';
    entryPhoto4Url: string = '';
    entryInformation: string = '';

    exitDatePrevision: Date | string = '';
    days: number = 0;

    exitUserId: number | null = null;
    exitUserName: string = '';
    exitDate: Date | string = '';
    exitPhoto1Url: string = '';
    exitPhoto2Url: string = '';
    exitPhoto3Url: string = '';
    exitPhoto4Url: string = '';
    exitInformation: string = '';

    attendantUserId: number | null = null;
    attendantUserName: string = '';
    attendantPhoto1Url: string = '';
    attendantPhoto2Url: string = '';
    attendantPhoto3Url: string = '';
    attendantPhoto4Url: string = '';
    attendantInformation: string = '';

    authExitStatus: StatusVehicleAuthEnum = StatusVehicleAuthEnum.NOT;

    auth1ExitUserId: number | null = null;
    auth1ExitUserName: string = '';
    auth1ExitDate: Date | string = '';

    auth2ExitUserId: number | null = null;
    auth2ExitUserName: string = '';
    auth2ExitDate: Date | string = '';

    modelId: number | null = null;
    modelDescription: string = '';

    clientCompanyId: number | null = null;
    clientCompanyName: string = '';

    driverEntryId: number | null = null;
    driverEntryName: string = '';

    driverExitId: number | null = null;
    driverExitName: string = '';

    vehiclePlate: string = '';
    vehiclePlateTogether: string = '';
    vehicleFleet: string = '';
    vehicleColor: string | null = null;
    vehicleKmEntry: string = '';
    vehicleKmExit: string = '';
    vehicleNew: string = '';
    vehicleServiceOrder: string = '';

    numServiceOrder: string = '';
    numNfe: string = '';
    numNfse: string = '';

   checklistId: number | null = null;
}