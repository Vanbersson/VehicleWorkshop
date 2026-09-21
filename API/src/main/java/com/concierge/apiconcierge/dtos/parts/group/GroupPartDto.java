package com.concierge.apiconcierge.dtos.parts.group;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.part.enums.TypeGroupPart;

public record GroupPartDto(Integer companyId,
                           Integer resaleId,
                           Integer id,
                           StatusEnableDisable status,
                           TypeGroupPart type,
                           String description,
                           Integer brandId) {
}
