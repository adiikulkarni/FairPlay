package com.gl.fairplay.venueservice.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

/**
 * Venue creation request.
 */
public record VenueCreateRequest(
        @NotBlank(message = "Venue name is required")
        String name,
        @NotBlank(message = "Location is required")
        String location,
        @NotBlank(message = "Sport type is required")
        String sportType,
        @NotNull(message = "Price per hour is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price per hour must be greater than zero")
        BigDecimal pricePerHour,
        List<String> amenities,
        String about,
        @NotNull(message = "Owner id is required")
        Long ownerId
) {
}
