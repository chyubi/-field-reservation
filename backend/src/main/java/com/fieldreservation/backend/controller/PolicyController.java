package com.fieldreservation.backend.controller;

import com.fieldreservation.backend.dto.ApiResponse;
import com.fieldreservation.backend.dto.ReservationPolicyResponse;
import com.fieldreservation.backend.service.ReservationPolicyService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reservation-policy")
public class PolicyController {

    private final ReservationPolicyService reservationPolicyService;

    public PolicyController(ReservationPolicyService reservationPolicyService) {
        this.reservationPolicyService = reservationPolicyService;
    }

    @GetMapping
    public ApiResponse<ReservationPolicyResponse> getPolicy() {
        return ApiResponse.success(reservationPolicyService.getPolicy());
    }
}
