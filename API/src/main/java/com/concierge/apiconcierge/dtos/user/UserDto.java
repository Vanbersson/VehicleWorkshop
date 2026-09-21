package com.concierge.apiconcierge.dtos.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.UserRoleEnum;

public record UserDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        StatusEnableDisable status,
        String name,
        String email,
        String password,
        String cellphone,
        Integer limitDiscount,
        String photoUrl,
        Integer roleId,
        String roleDesc,
        UserRoleEnum roleFunc) {
}
