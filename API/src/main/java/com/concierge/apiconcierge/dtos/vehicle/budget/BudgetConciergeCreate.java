package com.concierge.apiconcierge.dtos.vehicle.budget;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
public record BudgetConciergeCreate(@NotNull @Positive Integer vehicleId, LocalDateTime dateValidation, @Positive Integer paymentTypeId, @Size(max=255) String information, @NotNull @Size(max=500) List<@NotNull @Valid BudgetConciergeItemCreate> items, @Positive Integer clientCompanyId, @Positive Integer salespersonUserId) {
    public BudgetConciergeCreate(Integer vehicleId, LocalDateTime dateValidation, Integer paymentTypeId, String information, List<BudgetConciergeItemCreate> items) {
        this(vehicleId,dateValidation,paymentTypeId,information,items,null,null);
    }
    public BudgetConciergeCreate(Integer vehicleId, LocalDateTime dateValidation, Integer paymentTypeId, String information) {
        this(vehicleId,dateValidation,paymentTypeId,information,List.of(),null,null);
    }
}
