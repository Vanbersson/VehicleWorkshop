package com.concierge.apiconcierge.dtos.parts.category;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

import java.util.Date;

public record PartCategoryDto(Integer companyId,
                              Integer resaleId,
                              Integer id,
                              StatusEnableDisable status,
                              String description) {
}
