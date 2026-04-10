package com.fieldreservation.backend.service;

import com.fieldreservation.backend.config.AppProperties;
import com.fieldreservation.backend.dto.ReservationPolicyResponse;
import java.time.ZonedDateTime;
import org.springframework.stereotype.Service;

@Service
public class ReservationPolicyService {

    private final AppProperties appProperties;

    public ReservationPolicyService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public ReservationPolicyResponse getPolicy() {
        return new ReservationPolicyResponse(
                isReservationWindowOpen(),
                appProperties.getReservationWindow().getOpenDay(),
                appProperties.getReservationWindow().getOpenTime(),
                appProperties.getReservationWindow().getCloseTime(),
                appProperties.getAllowedClubs()
        );
    }

    public boolean isReservationWindowOpen() {
        ZonedDateTime now = ZonedDateTime.now(appProperties.getZoneId());
        return now.getDayOfWeek() == appProperties.getReservationWindow().getOpenDay()
                && !now.toLocalTime().isBefore(appProperties.getReservationWindow().getOpenTime())
                && now.toLocalTime().isBefore(appProperties.getReservationWindow().getCloseTime());
    }
}
