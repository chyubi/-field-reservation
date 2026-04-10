package com.fieldreservation.backend.dto;

import java.time.Instant;

public record ErrorResponse(
        String code,
        String message,
        Instant timestamp
) {
}
