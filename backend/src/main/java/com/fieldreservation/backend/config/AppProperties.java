package com.fieldreservation.backend.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    @NotNull
    private ZoneId zoneId = ZoneId.of("Asia/Seoul");

    @NotNull
    private ReservationWindow reservationWindow = new ReservationWindow();

    @NotEmpty
    private List<String> allowedClubs = new ArrayList<>();

    @NotNull
    private Admin admin = new Admin();

    @NotBlank
    private String frontendOrigin = "http://localhost:3000";

    public ZoneId getZoneId() {
        return zoneId;
    }

    public void setZoneId(ZoneId zoneId) {
        this.zoneId = zoneId;
    }

    public ReservationWindow getReservationWindow() {
        return reservationWindow;
    }

    public void setReservationWindow(ReservationWindow reservationWindow) {
        this.reservationWindow = reservationWindow;
    }

    public List<String> getAllowedClubs() {
        return allowedClubs;
    }

    public void setAllowedClubs(List<String> allowedClubs) {
        this.allowedClubs = allowedClubs;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public String getFrontendOrigin() {
        return frontendOrigin;
    }

    public void setFrontendOrigin(String frontendOrigin) {
        this.frontendOrigin = frontendOrigin;
    }

    public static class ReservationWindow {
        @NotNull
        private DayOfWeek openDay = DayOfWeek.SUNDAY;

        @NotNull
        private LocalTime openTime = LocalTime.of(20, 0);

        @NotNull
        private LocalTime closeTime = LocalTime.of(22, 0);

        public DayOfWeek getOpenDay() {
            return openDay;
        }

        public void setOpenDay(DayOfWeek openDay) {
            this.openDay = openDay;
        }

        public LocalTime getOpenTime() {
            return openTime;
        }

        public void setOpenTime(LocalTime openTime) {
            this.openTime = openTime;
        }

        public LocalTime getCloseTime() {
            return closeTime;
        }

        public void setCloseTime(LocalTime closeTime) {
            this.closeTime = closeTime;
        }
    }

    public static class Admin {
        @NotBlank
        private String token = "change-me-admin-token";

        @NotBlank
        private String passwordHash = "";

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getPasswordHash() {
            return passwordHash;
        }

        public void setPasswordHash(String passwordHash) {
            this.passwordHash = passwordHash;
        }
    }
}
