package com.concierge.apiconcierge.dtos.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record ResponseSalespersonDto(
        Integer id,
        StatusEnableDisable status,
        String name) {
}
