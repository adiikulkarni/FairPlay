package com.gl.fairplay.venueservice.web.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Booking creation request.
 */
public record BookingCreateRequest(
        @NotNull(message = "User id is required")
        Long userId,
        @NotNull(message = "Venue id is required")
        Long venueId,
        @NotNull(message = "Slot time is required")
        @Future(message = "Slot time must be in the future")
        LocalDateTime slotTime,
        @NotNull(message = "Duration is required")
        @Min(value = 1, message = "Duration must be at least 1 hour")
        @Max(value = 12, message = "Duration must not exceed 12 hours")
        Integer durationHours
) {
}
