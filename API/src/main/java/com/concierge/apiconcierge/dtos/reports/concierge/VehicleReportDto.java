package com.concierge.apiconcierge.dtos.reports.concierge;

import com.concierge.apiconcierge.models.enums.YesNot;
import java.util.Date;

public record VehicleReportDto(
        String type,
        YesNot vehicleNew,
        Integer companyId,
        Integer resaleId,
        Date dateInit,
        Date dateFinal,
        Integer clientId,
        Integer userAttendantId,
        Integer userConciergeId,
        Integer modelId,
        Integer vehicleId,
        String vehiclePlate,
        String vehicleFleet,
        String numServiceOrder
) {
}
