package com.gl.fairplay.venueservice.web.dto;

import java.math.BigDecimal;

/**
 * Owner dashboard summary.
 */
public record OwnerDashboardResponse(
        long totalVenues,
        long activeBookings,
        long cancelledBookings,
        BigDecimal totalEarnings
) {
}
