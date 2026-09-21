package com.concierge.apiconcierge.dtos.purchase;

import java.math.BigDecimal;
import java.util.UUID;

public record PurchaseOrderItemConsDto(Integer companyId,
                                       Integer resaleId,
                                       UUID id,
                                       Integer purchaseId,
                                       Integer itemOrder,
                                       String description,
                                       BigDecimal quantity,
                                       BigDecimal discount,
                                       BigDecimal price) {
}
