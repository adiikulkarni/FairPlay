package com.gl.fairplay.venueservice.web.dto;

import com.gl.fairplay.venueservice.domain.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Booking response payload.
 */
public record BookingResponse(
        Long id,
        Long userId,
        Long venueId,
        LocalDateTime slotTime,
        BookingStatus status,
        Integer durationHours,
        BigDecimal totalPrice
) {
}
