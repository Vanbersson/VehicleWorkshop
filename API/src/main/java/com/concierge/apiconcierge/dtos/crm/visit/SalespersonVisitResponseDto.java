package com.concierge.apiconcierge.dtos.crm.visit;

import com.concierge.apiconcierge.models.crm.visit.StatusVisitEnum;

import java.util.Date;

public record SalespersonVisitResponseDto(
        Integer id,
        String salespersonName,
        StatusVisitEnum status,
        Date dateRegister,
        Date dateVisit,
        String clientName) {
}
