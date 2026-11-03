package com.concierge.apiconcierge.dtos.crm.attendance;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
public record AttendanceCreateDto(@NotNull @Positive Integer clientId, @NotNull @Positive Integer salespersonId, @Size(max = 2000) String notes) {}
