package com.fieldreservation.backend.dto;

import com.fieldreservation.backend.domain.FieldType;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        FieldType fieldType,
        LocalDate reservationDate,
        String timeSlot,
        String userName,
        String clubName,
        String contact,
        Instant createdAt
) {
}
