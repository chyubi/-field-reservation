package com.fieldreservation.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "관리자 비밀번호는 필수입니다.")
        String password
) {
}
