package com.gl.fairplay.venueservice.web.dto;

import java.math.BigDecimal;

/**
 * Venue response payload.
 */
public record VenueResponse(
        Long id,
        String name,
        String location,
        String sportType,
        BigDecimal pricePerHour,
        Long ownerId
) {
}
