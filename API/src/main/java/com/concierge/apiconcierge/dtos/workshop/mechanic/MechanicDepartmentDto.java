package com.concierge.apiconcierge.dtos.workshop.mechanic;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record MechanicDepartmentDto(Integer companyId,
                                    Integer resaleId,
                                    Integer id,
                                    StatusEnableDisable status,
                                    String description
) {
}
