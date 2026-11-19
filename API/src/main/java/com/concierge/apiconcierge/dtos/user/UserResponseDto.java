package com.concierge.apiconcierge.dtos.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.UserRoleEnum;

import java.time.LocalDate;

public record UserResponseDto(
        Integer companyId,
        Integer resaleId,
        Integer id,
        String name,
        String nickname,
        String cpf,
        LocalDate birthDate,
        String email,
        String cellphone,
        Integer roleId,
        String roleDesc,
        UserRoleEnum roleFunc) {
}
