package com.concierge.apiconcierge.dtos.vehicle;

import com.concierge.apiconcierge.models.vehicle.enums.ColorVehicleEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VehicleDto(
        Integer companyId,
        Integer resaleId,

        Integer id,
        String placa,
        String chassi,
        String frota,
        String yearManufacture,
        String yearModel,

        String kmCurrent,

        String kmLast,

        ColorVehicleEnum color,

        Integer modelId,

        Integer ownerId) {
}
