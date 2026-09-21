package com.concierge.apiconcierge.dtos.brand;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public record BrandDto(
        Integer id,
        StatusEnableDisable status,
        String name) {
}
