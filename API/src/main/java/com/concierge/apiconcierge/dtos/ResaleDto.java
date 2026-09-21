package com.concierge.apiconcierge.dtos;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResaleDto(
        @NotNull Integer companyId,
        Integer id,
        @NotNull StatusEnableDisable status,
        @NotBlank String name,
        @NotBlank String cnpj,
        String email,
        String cellphone,
        String phone,
        @NotBlank String zipCode,
        @NotBlank String state,
        @NotBlank String city,
        @NotBlank String neighborhood,
        @NotBlank String address,
        @NotBlank String addressNumber,
        String addressComplement
) {
}
