package com.fieldreservation.backend.controller;

import com.fieldreservation.backend.dto.ApiResponse;
import com.fieldreservation.backend.dto.CancelReservationRequest;
import com.fieldreservation.backend.dto.CreateReservationRequest;
import com.fieldreservation.backend.dto.ReservationResponse;
import com.fieldreservation.backend.service.ReservationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ApiResponse<List<ReservationResponse>> getReservations(
            @RequestParam(required = false) String fieldType,
            @RequestParam(required = false) String week
    ) {
        return ApiResponse.success(reservationService.getReservations(fieldType, week));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ReservationResponse> createReservation(
            @Valid @RequestBody CreateReservationRequest request
    ) {
        return ApiResponse.success(reservationService.createReservation(request));
    }

    @PostMapping("/{reservationId}/cancel")
    public ApiResponse<Void> cancelReservation(
            @PathVariable UUID reservationId,
            @Valid @RequestBody CancelReservationRequest request
    ) {
        reservationService.cancelReservation(reservationId, request);
        return ApiResponse.success(null);
    }
}
