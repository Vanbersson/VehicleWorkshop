package com.concierge.apiconcierge.dtos.budget;

import jakarta.validation.constraints.NotNull;

public record BudgetNewDto(
        Integer companyId,
        Integer resaleId,
        Integer vehicleEntryId
) {
}
