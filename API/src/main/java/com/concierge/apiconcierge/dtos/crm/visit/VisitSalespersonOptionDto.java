package com.concierge.apiconcierge.dtos.crm.visit;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
public record VisitSalespersonOptionDto(Integer id, StatusEnableDisable status, String name, Integer userId, String photoUrl) {}
