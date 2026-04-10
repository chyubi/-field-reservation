package com.fieldreservation.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelReservationRequest(
        @NotBlank(message = "취소 비밀번호는 필수입니다.")
        @Size(min = 4, max = 50, message = "취소 비밀번호 길이가 올바르지 않습니다.")
        String password
) {
}
