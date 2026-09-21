package com.concierge.apiconcierge.dtos.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.UserRoleEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserResponseDto(
        @NotNull Integer companyId,
        @NotNull Integer resaleId,
        @NotNull Integer id,
        @NotNull StatusEnableDisable status,
        @NotBlank String name,
        @NotBlank String email,

        @NotBlank String cellphone,

        Integer limitDiscount,
        byte[] photo,
        @NotNull Integer roleId,
        @NotBlank String roleDesc,
        @NotNull UserRoleEnum roleFunc) {
}
