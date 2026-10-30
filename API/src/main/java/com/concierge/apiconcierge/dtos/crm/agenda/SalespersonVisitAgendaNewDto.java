package com.concierge.apiconcierge.dtos.crm.agenda;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record SalespersonVisitAgendaNewDto(
        @NotNull(message = "Data visita é obrigatório")
        Date dateVisit,
        @NotNull(message = "Código vendedor é obrigatório")
        Integer salespersonId,
        @NotBlank(message = "Nome vendedor é obrigatório")
        String salespersonName,
        @NotNull(message = "Código cliente é obrigatório")
        Integer clientId,
        @NotBlank(message = "Nome cliente é obrigatório")
        String clientName,
        String clientCNPJ,
        String clientCPF,
        String informationAgenda) {
}
