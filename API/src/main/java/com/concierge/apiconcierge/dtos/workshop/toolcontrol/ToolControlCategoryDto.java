package com.concierge.apiconcierge.dtos.workshop.toolcontrol;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeCategory;

public record ToolControlCategoryDto(Integer companyId,
                                     Integer resaleId,

                                     Integer id,

                                     StatusEnableDisable status,
                                     TypeCategory type,
                                     Integer quantityReq,
                                     String description) {
}
