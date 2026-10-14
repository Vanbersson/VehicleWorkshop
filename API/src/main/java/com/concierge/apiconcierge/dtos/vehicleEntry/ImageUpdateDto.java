package com.concierge.apiconcierge.dtos.vehicleEntry;

import jakarta.validation.constraints.NotNull;

public record ImageUpdateDto(
        @NotNull(message = "Veículo não informado")
        Integer vehicleId,
        String image1,
        String image2,
        String image3,
        String image4) {
}
