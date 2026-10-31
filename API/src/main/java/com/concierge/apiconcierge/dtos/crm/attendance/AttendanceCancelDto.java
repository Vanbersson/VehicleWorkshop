package com.concierge.apiconcierge.dtos.crm.attendance;
import jakarta.validation.constraints.*;
public record AttendanceCancelDto(@NotNull Integer id, @NotNull Long version, @NotBlank @Size(max = 2000) String reason) {}
