package com.concierge.apiconcierge.dtos.budget;


import java.util.Date;
import java.util.UUID;

public record BudgetTokenDto(Integer companyId,
                             Integer resaleId,
                             UUID id,
                             Integer budgetId,
                             Date dateValid) {
}
