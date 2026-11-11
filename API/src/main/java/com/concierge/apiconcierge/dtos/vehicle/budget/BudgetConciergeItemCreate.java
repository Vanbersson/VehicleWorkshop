package com.concierge.apiconcierge.dtos.vehicle.budget;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
public record BudgetConciergeItemCreate(
    @NotNull @Min(0) @Max(1) Integer type,
    @NotBlank @Size(max=100) String description,
    BigDecimal quantity,
    @DecimalMin("0.01") @Digits(integer=9,fraction=2) BigDecimal hourService,
    @NotNull @DecimalMin("0") @Digits(integer=8,fraction=3) BigDecimal price,
    @NotNull @DecimalMin("0") @Digits(integer=8,fraction=3) BigDecimal discount
) {}
