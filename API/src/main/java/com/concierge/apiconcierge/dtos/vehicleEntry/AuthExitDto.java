package com.concierge.apiconcierge.dtos.vehicleEntry;

import jakarta.validation.constraints.NotNull;

public record AuthExitDto(
        @NotNull(message = "Veículo não informado")
        Integer vehicleId) {

}
