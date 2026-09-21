package com.concierge.apiconcierge.dtos.vehicle.entry;

import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.vehicle.enums.*;

import java.util.Date;

public record VehicleEntryDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        StatusVehicleEnum status,
        StepVehicleEnum stepEntry,
        Integer budgetId,

        Integer entryUserId,
        String entryUserName,
        Date entryDate,
        String entryPhoto1Url,
        String entryPhoto2Url,
        String entryPhoto3Url,
        String entryPhoto4Url,
        String entryInformation,

        Date exitDatePrevision,

        Integer exitUserId,
        String exitUserName,
        Date exitDate,
        String exitPhoto1Url,
        String exitPhoto2Url,
        String exitPhoto3Url,
        String exitPhoto4Url,
        String exitInformation,

        Integer attendantUserId,
        String attendantUserName,
        String attendantPhoto1Url,
        String attendantPhoto2Url,
        String attendantPhoto3Url,
        String attendantPhoto4Url,
        String attendantInformation,

        StatusAuthExitEnum authExitStatus,

        Integer auth1ExitUserId,
        String auth1ExitUserName,
        Date auth1ExitDate,

        Integer auth2ExitUserId,
        String auth2ExitUserName,
        Date auth2ExitDate,

        Integer modelId,
        String modelDescription,

        Integer clientCompanyId,
        String clientCompanyName,

        Integer driverEntryId,
        String driverEntryName,

        Integer driverExitId,
        String driverExitName,

        String vehiclePlate,
        String vehiclePlateTogether,
        String vehicleFleet,
        ColorVehicleEnum vehicleColor,
        String vehicleKmEntry,
        String vehicleKmExit,
        YesNot vehicleNew,
        YesNot vehicleServiceOrder,

        String numServiceOrder,
        String numNfe,
        String numNfse,
        Integer checklistId

) {
}
