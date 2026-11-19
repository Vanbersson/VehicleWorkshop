package com.concierge.apiconcierge.dtos.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.UserRoleEnum;

import java.time.LocalDate;

public record UserDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        StatusEnableDisable status,
        String name,
        String nickname,
        String cpf,
        LocalDate birthDate,
        String email,
        String password,
        String cellphone,
        String photoUrl,
        Integer roleId,
        String roleDesc,
        UserRoleEnum roleFunc) {
}
