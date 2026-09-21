package com.concierge.apiconcierge.dtos.vehicle.model;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record VehicleModelDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        StatusEnableDisable status,
        String description) {
}
