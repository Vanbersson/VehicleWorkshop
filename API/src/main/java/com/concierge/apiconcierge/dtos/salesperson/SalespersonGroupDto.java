package com.concierge.apiconcierge.dtos.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record SalespersonGroupDto(Integer companyId,
                                  Integer resaleId,
                                  Integer id,
                                  StatusEnableDisable status,
                                  String description,
                                  String ufs,
                                  String brands,
                                  String regions) {
}
