package com.fieldreservation.backend.controller;

import com.fieldreservation.backend.dto.ApiResponse;
import com.fieldreservation.backend.dto.LoginRequest;
import com.fieldreservation.backend.dto.LoginResponse;
import com.fieldreservation.backend.dto.ReservationResponse;
import com.fieldreservation.backend.service.AdminAuthService;
import com.fieldreservation.backend.service.ReservationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final ReservationService reservationService;

    public AdminController(AdminAuthService adminAuthService, ReservationService reservationService) {
        this.adminAuthService = adminAuthService;
        this.reservationService = reservationService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success(adminAuthService.login(request));
    }

    @GetMapping("/reservations")
    public ApiResponse<List<ReservationResponse>> getReservations(
            @RequestHeader("X-Admin-Token") String adminToken
    ) {
        adminAuthService.assertAuthorized(adminToken);
        return ApiResponse.success(reservationService.getAdminReservations());
    }

    @DeleteMapping("/reservations/{reservationId}")
    @ResponseStatus(HttpStatus.OK)
    public ApiResponse<Void> deleteReservation(
            @RequestHeader("X-Admin-Token") String adminToken,
            @PathVariable UUID reservationId
    ) {
        adminAuthService.assertAuthorized(adminToken);
        reservationService.deleteByAdmin(reservationId);
        return ApiResponse.success(null);
    }
}
