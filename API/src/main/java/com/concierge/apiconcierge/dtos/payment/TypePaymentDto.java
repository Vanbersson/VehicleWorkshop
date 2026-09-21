package com.concierge.apiconcierge.dtos.payment;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record TypePaymentDto(Integer companyId,
                             Integer resaleId,
                             Integer id,
                             StatusEnableDisable status,
                             String description) {
}
