package com.concierge.apiconcierge.dtos.crm.agenda;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Date;

public record SalespersonVisitAgendaUpdateDto(
        @NotNull Integer id,
        @NotNull Date dateVisit,
        @NotNull Integer salespersonId,
        @NotBlank String salespersonName,
        @NotNull Integer clientId,
        @NotBlank String clientName,
        String clientCNPJ,
        String clientCPF,
        String informationAgenda
) {}
