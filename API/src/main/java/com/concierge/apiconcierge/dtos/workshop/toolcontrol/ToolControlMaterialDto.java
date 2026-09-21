package com.concierge.apiconcierge.dtos.workshop.toolcontrol;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;

import java.math.BigDecimal;

public record ToolControlMaterialDto(Integer companyId,
                                     Integer resaleId,
                                     Integer id,
                                     StatusEnableDisable status,
                                     TypeRequest type,
                                     Integer numberCA,
                                     String description,
                                     Integer categoryId,
                                     BigDecimal quantityAccountingLoan,
                                     BigDecimal quantityAvailableLoan,
                                     BigDecimal quantityAccountingKit,
                                     BigDecimal quantityAvailableKit,
                                     Integer validityDay,
                                     String photoUrl) {
}
