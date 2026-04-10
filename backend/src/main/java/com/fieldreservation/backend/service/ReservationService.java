package com.fieldreservation.backend.service;

import com.fieldreservation.backend.config.AppProperties;
import com.fieldreservation.backend.domain.FieldType;
import com.fieldreservation.backend.domain.Reservation;
import com.fieldreservation.backend.dto.CancelReservationRequest;
import com.fieldreservation.backend.dto.CreateReservationRequest;
import com.fieldreservation.backend.dto.ReservationResponse;
import com.fieldreservation.backend.exception.ApplicationException;
import com.fieldreservation.backend.repository.ReservationRepository;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReservationService {

    private static final List<String> WEEKDAY_SLOTS = List.of("16:00~18:00", "18:00~20:00", "20:00~22:00");
    private static final List<String> WEEKEND_SLOTS = List.of("10:00~12:00", "12:00~14:00", "14:00~16:00", "16:00~18:00", "18:00~20:00", "20:00~22:00");

    private final ReservationRepository reservationRepository;
    private final ReservationPolicyService reservationPolicyService;
    private final AppProperties appProperties;
    private final PasswordEncoder passwordEncoder;

    public ReservationService(
            ReservationRepository reservationRepository,
            ReservationPolicyService reservationPolicyService,
            AppProperties appProperties,
            PasswordEncoder passwordEncoder
    ) {
        this.reservationRepository = reservationRepository;
        this.reservationPolicyService = reservationPolicyService;
        this.appProperties = appProperties;
        this.passwordEncoder = passwordEncoder;
    }

    public List<ReservationResponse> getReservations(String fieldType, String week) {
        LocalDate today = LocalDate.now(appProperties.getZoneId());
        LocalDate mondayOfCurrentWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate startDate = mondayOfCurrentWeek;
        LocalDate endDate = mondayOfCurrentWeek.plusDays(6);

        if ("next".equalsIgnoreCase(week)) {
            startDate = mondayOfCurrentWeek.plusWeeks(1);
            endDate = startDate.plusDays(6);
        }

        List<Reservation> reservations;
        if (fieldType == null || fieldType.isBlank()) {
            reservations = reservationRepository.findAllByReservationDateBetweenOrderByReservationDateAscTimeSlotAsc(startDate, endDate);
        } else {
            FieldType parsedFieldType = parseFieldType(fieldType);
            reservations = reservationRepository.findAllByFieldTypeAndReservationDateBetweenOrderByReservationDateAscTimeSlotAsc(
                    parsedFieldType,
                    startDate,
                    endDate
            );
        }

        return reservations.stream().map(this::toResponse).toList();
    }

    public List<ReservationResponse> getAdminReservations() {
        return reservationRepository.findAllByOrderByReservationDateAscTimeSlotAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest request) {
        validateReservationWindow();
        validateClubName(request.clubName());
        validateTimeSlot(request.reservationDate(), request.timeSlot());

        boolean exists = reservationRepository.existsByFieldTypeAndReservationDateAndTimeSlot(
                request.fieldType(),
                request.reservationDate(),
                request.timeSlot()
        );
        if (exists) {
            throw new ApplicationException("RESERVATION_CONFLICT", "이미 예약된 시간입니다.", HttpStatus.CONFLICT);
        }

        Reservation reservation = new Reservation();
        reservation.setFieldType(request.fieldType());
        reservation.setReservationDate(request.reservationDate());
        reservation.setTimeSlot(request.timeSlot());
        reservation.setUserName(request.userName().trim());
        reservation.setClubName(request.clubName().trim());
        reservation.setContact(request.contact().trim());
        reservation.setPasswordHash(passwordEncoder.encode(request.password()));

        Reservation saved = reservationRepository.save(reservation);
        return toResponse(saved);
    }

    @Transactional
    public void cancelReservation(UUID reservationId, CancelReservationRequest request) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApplicationException("RESERVATION_NOT_FOUND", "예약을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        if (!passwordEncoder.matches(request.password(), reservation.getPasswordHash())) {
            throw new ApplicationException("INVALID_CANCEL_PASSWORD", "비밀번호가 일치하지 않습니다.", HttpStatus.UNAUTHORIZED);
        }

        reservationRepository.delete(reservation);
    }

    @Transactional
    public void deleteByAdmin(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApplicationException("RESERVATION_NOT_FOUND", "예약을 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        reservationRepository.delete(reservation);
    }

    private void validateReservationWindow() {
        if (!reservationPolicyService.isReservationWindowOpen()) {
            throw new ApplicationException(
                    "RESERVATION_CLOSED",
                    "현재 예약 가능 시간이 아닙니다.",
                    HttpStatus.FORBIDDEN
            );
        }
    }

    private void validateClubName(String clubName) {
        String normalized = clubName == null ? "" : clubName.trim();
        boolean allowed = appProperties.getAllowedClubs()
                .stream()
                .map(this::normalize)
                .anyMatch(allowedClub -> allowedClub.equals(normalize(normalized)));

        if (!allowed) {
            throw new ApplicationException(
                    "INVALID_CLUB_NAME",
                    "등록된 동아리만 예약할 수 있습니다.",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    private void validateTimeSlot(LocalDate reservationDate, String timeSlot) {
        List<String> allowedSlots = isWeekend(reservationDate) ? WEEKEND_SLOTS : WEEKDAY_SLOTS;
        if (!allowedSlots.contains(timeSlot)) {
            throw new ApplicationException("INVALID_TIME_SLOT", "선택할 수 없는 시간대입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    private boolean isWeekend(LocalDate reservationDate) {
        DayOfWeek dayOfWeek = reservationDate.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    private FieldType parseFieldType(String fieldType) {
        try {
            return FieldType.valueOf(fieldType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApplicationException("INVALID_FIELD_TYPE", "존재하지 않는 구장입니다.", HttpStatus.BAD_REQUEST);
        }
    }

    private String normalize(String value) {
        return value.replaceAll("\\s+", "").toLowerCase(Locale.ROOT);
    }

    private ReservationResponse toResponse(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getFieldType(),
                reservation.getReservationDate(),
                reservation.getTimeSlot(),
                reservation.getUserName(),
                reservation.getClubName(),
                reservation.getContact(),
                reservation.getCreatedAt()
        );
    }
}
