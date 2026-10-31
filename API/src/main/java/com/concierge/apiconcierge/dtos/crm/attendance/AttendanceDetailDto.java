package com.concierge.apiconcierge.dtos.crm.attendance;
import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
public record AttendanceDetailDto(AttendanceResponseDto attendance, SalespersonVisit visit) {}
