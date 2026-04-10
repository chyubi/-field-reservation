package com.fieldreservation.backend.dto;

import com.fieldreservation.backend.domain.FieldType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record CreateReservationRequest(
        @NotNull(message = "구장 정보는 필수입니다.")
        FieldType fieldType,

        @NotNull(message = "예약 날짜는 필수입니다.")
        @FutureOrPresent(message = "예약 날짜는 오늘 이후여야 합니다.")
        LocalDate reservationDate,

        @NotBlank(message = "시간대는 필수입니다.")
        String timeSlot,

        @NotBlank(message = "예약자 이름은 필수입니다.")
        @Size(min = 2, max = 20, message = "예약자 이름 길이는 2자 이상 20자 이하여야 합니다.")
        @Pattern(regexp = "^[가-힣a-zA-Z0-9 ]+$", message = "예약자 이름 형식이 올바르지 않습니다.")
        String userName,

        @NotBlank(message = "동아리명은 필수입니다.")
        @Size(min = 2, max = 30, message = "동아리명 길이는 2자 이상 30자 이하여야 합니다.")
        String clubName,

        @NotBlank(message = "연락처는 필수입니다.")
        @Pattern(regexp = "^01[0-9]-\\d{3,4}-\\d{4}$", message = "연락처 형식은 010-1234-5678 이어야 합니다.")
        String contact,

        @NotBlank(message = "취소 비밀번호는 필수입니다.")
        @Size(min = 4, max = 50, message = "취소 비밀번호 길이가 올바르지 않습니다.")
        String password
) {
}
