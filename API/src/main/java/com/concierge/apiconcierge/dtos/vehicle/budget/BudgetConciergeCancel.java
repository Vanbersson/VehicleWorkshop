package com.concierge.apiconcierge.dtos.vehicle.budget;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
public record BudgetConciergeCancel(@NotBlank @Size(max=1000) String reason) {}
