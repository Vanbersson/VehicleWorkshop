package com.concierge.apiconcierge.dtos.budget;

import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record BudgetDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        Integer vehicleEntryId,
        StatusBudgetEnum status,
        Date dateGeneration,
        Date dateValidation,
        Date dateAuthorization,
        String nameResponsible,
        String typePayment,
        Integer idUserAttendant,
        Integer clientCompanyId,
        String information,
        Date clientSendDate,
        Date clientApprovedDate) {
}
