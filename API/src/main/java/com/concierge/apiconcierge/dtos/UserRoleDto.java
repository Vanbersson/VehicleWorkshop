package com.concierge.apiconcierge.dtos;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record UserRoleDto(

        Integer companyId,
        Integer resaleId,
        Integer id,
        StatusEnableDisable status,
        String description) {
}
