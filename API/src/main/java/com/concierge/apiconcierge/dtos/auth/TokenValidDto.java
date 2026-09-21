package com.concierge.apiconcierge.dtos.auth;

import jakarta.validation.constraints.NotBlank;

public record TokenValidDto(@NotBlank String email) {
}
