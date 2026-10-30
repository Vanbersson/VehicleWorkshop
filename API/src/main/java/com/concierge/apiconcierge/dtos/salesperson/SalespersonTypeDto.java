package com.concierge.apiconcierge.dtos.salesperson;

import com.concierge.apiconcierge.models.enums.YesNot;
import jakarta.validation.constraints.NotNull;

public record SalespersonTypeDto(
        @NotNull(message = "Tipo é obrigatório")
        YesNot typeSalesPart,
        @NotNull(message = "Tipo é obrigatório")
        YesNot typeSalesService,
        @NotNull(message = "Tipo é obrigatório")
        YesNot typeSalesVehicle) {
}
