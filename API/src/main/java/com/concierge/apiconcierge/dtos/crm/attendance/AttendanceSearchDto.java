package com.concierge.apiconcierge.dtos.crm.attendance;
import jakarta.validation.constraints.*;
public record AttendanceSearchDto(@Positive Integer id, @Size(max = 255) String clientName, @Size(max = 255) String salespersonName) {}
