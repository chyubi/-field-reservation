package com.fieldreservation.backend.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public record ReservationPolicyResponse(
        boolean unlocked,
        DayOfWeek openDay,
        LocalTime openTime,
        LocalTime closeTime,
        List<String> allowedClubs
) {
}
