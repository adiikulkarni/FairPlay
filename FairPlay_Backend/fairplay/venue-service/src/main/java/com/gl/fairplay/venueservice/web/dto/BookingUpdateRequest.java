package com.gl.fairplay.venueservice.web.dto;

import com.gl.fairplay.venueservice.domain.BookingStatus;
import jakarta.validation.constraints.Future;
import java.time.LocalDateTime;

/**
 * Booking update request.
 */
public record BookingUpdateRequest(
        @Future(message = "Slot time must be in the future")
        LocalDateTime slotTime,
        BookingStatus status
) {
}
