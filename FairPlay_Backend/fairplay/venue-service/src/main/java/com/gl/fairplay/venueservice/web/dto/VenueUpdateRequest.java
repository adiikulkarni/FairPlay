package com.gl.fairplay.venueservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;

/**
 * Venue update request.
 */
public record VenueUpdateRequest(
        String name,
        String location,
        String sportType,
        @DecimalMin(value = "0.0", inclusive = false, message = "Price per hour must be greater than zero")
        BigDecimal pricePerHour
) {
}
