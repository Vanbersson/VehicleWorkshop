package com.concierge.apiconcierge.dtos.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.salesperson.TypeSalesEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record SalespersonUpdateDto(
        @NotNull(message = "Empresa é obrigatório")
        Integer companyId,
        @NotNull(message = "Revenda é obrigatório")
        Integer resaleId,
        @NotNull(message = "Status é obrigatório")
        StatusEnableDisable status,
        @NotNull(message = "Código é obrigatório")
        Integer id,
        @NotBlank(message = "Nome é obrigatório")
        String name,
        @NotBlank(message = "CPF é obrigatório")
        String cpf,
        @NotBlank(message = "DDD Celular é obrigatório")
        String dddCellphone,
        @NotBlank(message = "Celular é obrigatório")
        String cellphone,
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
        String groupIds,
        String photoUrl) {
}
