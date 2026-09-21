package com.concierge.apiconcierge.dtos.parts.unit;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record UnitMeasureDto(
        Integer id,
        StatusEnableDisable status,
        String unitMeasure,
        String description) {
}
