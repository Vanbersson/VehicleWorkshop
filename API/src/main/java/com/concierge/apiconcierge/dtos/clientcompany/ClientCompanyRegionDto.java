package com.concierge.apiconcierge.dtos.clientcompany;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record ClientCompanyRegionDto(Integer companyId,
                                     Integer resaleId,
                                     Integer id,
                                     StatusEnableDisable status,
                                     String description,
                                     String uf) {
}
