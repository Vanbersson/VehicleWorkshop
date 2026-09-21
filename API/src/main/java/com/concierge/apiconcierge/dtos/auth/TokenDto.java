package com.concierge.apiconcierge.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record TokenDto(@NotBlank String token) {
}
