package com.fieldreservation.backend.repository;

import com.fieldreservation.backend.domain.FieldType;
import com.fieldreservation.backend.domain.Reservation;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    boolean existsByFieldTypeAndReservationDateAndTimeSlot(FieldType fieldType, LocalDate reservationDate, String timeSlot);

    List<Reservation> findAllByReservationDateBetweenOrderByReservationDateAscTimeSlotAsc(LocalDate startDate, LocalDate endDate);

    List<Reservation> findAllByFieldTypeAndReservationDateBetweenOrderByReservationDateAscTimeSlotAsc(
            FieldType fieldType,
            LocalDate startDate,
            LocalDate endDate
    );

    List<Reservation> findAllByOrderByReservationDateAscTimeSlotAsc();
}
