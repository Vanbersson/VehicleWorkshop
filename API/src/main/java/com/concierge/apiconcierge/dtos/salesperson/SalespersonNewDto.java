package com.concierge.apiconcierge.dtos.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.salesperson.TypeSalesEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SalespersonNewDto(
        @NotNull(message = "Status é obrigatório")
        StatusEnableDisable status,
        @NotBlank(message = "Nome é obrigatório")
        String name,
        @NotNull(message = "Desconto é obrigatório")
        BigDecimal limitDiscount,
        @NotNull(message = "Tipo é obrigatório")
        TypeSalesEnum typeSales,
        YesNot typeSalesPart,
        YesNot typeSalesService,
        YesNot typeSalesVehicle,
        @NotNull(message = "Usuário é obrigatório")
        Integer userId,
        @NotBlank(message = "Grupo é obrigatório")
        String groupIds) {
}
