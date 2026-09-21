package com.concierge.apiconcierge.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record AuthenticationDto(
        @NotBlank String email,
        @NotBlank String password) {
}
