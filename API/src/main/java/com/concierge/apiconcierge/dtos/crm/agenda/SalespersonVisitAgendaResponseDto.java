package com.concierge.apiconcierge.dtos.crm.agenda;

public record SalespersonVisitAgendaResponseDto(
        Integer id,
        Integer salespersonId,
        String salespersonName,

        Integer clientId,
        String clientName,

        String type,
        String latitude,
        String longitude,
        String description
) {
}
