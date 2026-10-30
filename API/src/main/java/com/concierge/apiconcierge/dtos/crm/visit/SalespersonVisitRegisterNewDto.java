package com.concierge.apiconcierge.dtos.crm.visit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SalespersonVisitRegisterNewDto(
        @NotNull(message = "Código vendedor é obrigatório")
        Integer salespersonId,
        @NotBlank(message = "Nome vendedor é obrigatório")
        String salespersonName,
        Integer clientId,
        @NotBlank(message = "Nome cliente é obrigatório")
        String clientName,
        String clientCNPJ,
        String clientCPF) {
}
