package com.concierge.apiconcierge.dtos.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.UserRoleEnum;

public record UserResponseDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        String name,
        String email,
        String cellphone,
        Integer limitDiscount,
        Integer roleId,
        String roleDesc,
        UserRoleEnum roleFunc) {
}
