package com.concierge.apiconcierge.dtos.budget;

import com.concierge.apiconcierge.models.budget.enums.StatusBudgetItemEnum;

import java.util.UUID;

public record BudgetItemServiceDto(
        Integer companyId,
        Integer resaleId,
        UUID id,
        Integer budgetId,
        StatusBudgetItemEnum status,
        Integer ordem,
        String description,
        float hourService,
        float price,
        float discount) {
}
