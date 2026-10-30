package com.concierge.apiconcierge.dtos.crm.agenda;

import java.util.Date;

public record SalespersonVisitAgendaResponseDto(
        Integer id,
        Date dateVisit,

        Integer salespersonId,
        String salespersonName,

        Integer clientId,
        String clientName,
        String clientCNPJ,
        String clientCPF,

        String informationAgenda
) {
}
