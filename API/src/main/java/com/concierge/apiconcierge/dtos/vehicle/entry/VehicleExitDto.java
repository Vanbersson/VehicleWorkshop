package com.concierge.apiconcierge.dtos.vehicle.entry;

import java.util.Date;

public record VehicleExitDto(
        Integer companyId,
        Integer resaleId,
        Integer vehicleId,

        Integer exitUserId,
        String exitUserName,
        Date exitDate,
        String exitPhoto1Url,
        String exitPhoto2Url,
        String exitPhoto3Url,
        String exitPhoto4Url,
        String exitInformation
        ) {
}
