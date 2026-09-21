package com.concierge.apiconcierge.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record AuthResponseDto(
        byte[] photo,
        String name,
        String roleDesc,
        String token) {
}
