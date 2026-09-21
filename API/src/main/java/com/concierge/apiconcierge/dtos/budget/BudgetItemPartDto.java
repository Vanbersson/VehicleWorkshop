package com.concierge.apiconcierge.dtos.budget;

import com.concierge.apiconcierge.models.budget.enums.StatusBudgetItemEnum;

import java.util.UUID;

public record BudgetItemPartDto(
        Integer companyId,
        Integer resaleId,
        UUID id,
        Integer partId,
        Integer budgetId,
        StatusBudgetItemEnum status,
        Integer ordem,
        String code,
        String description,
        float quantity,
        float discount,
        float price
) {
}
