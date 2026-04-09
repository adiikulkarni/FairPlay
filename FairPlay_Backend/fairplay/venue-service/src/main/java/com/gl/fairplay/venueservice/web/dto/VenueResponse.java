package com.gl.fairplay.venueservice.web.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Venue response payload.
 */
public record VenueResponse(
        Long id,
        String name,
        String location,
        String sportType,
        BigDecimal pricePerHour,
        List<String> amenities,
        String about,
        Long ownerId
) {
}
