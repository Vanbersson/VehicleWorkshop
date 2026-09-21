package com.concierge.apiconcierge.dtos.menu;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MenuUserDto(Integer companyId,
                          Integer resaleId,
                          UUID id,
                          Integer userId,
                          String menuId) {
}
