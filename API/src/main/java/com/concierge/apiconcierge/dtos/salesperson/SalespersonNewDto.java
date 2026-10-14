package com.concierge.apiconcierge.dtos.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.salesperson.TypeSalesEnum;

import java.math.BigDecimal;

public record SalespersonDto(Integer companyId,
                             Integer resaleId,
                             Integer id,
                             StatusEnableDisable status,
                             String name,
                             String cpf,
                             String dddCellphone,
                             String cellphone,
                             BigDecimal limitDiscount,
                             TypeSalesEnum typeSales,
                             YesNot typeSalesPart,
                             YesNot typeSalesService,
                             YesNot typeSalesVehicle,
                             Integer userId,
                             Integer groupId,
                             String photoUrl) {
}
