package com.gl.fairplay.venueservice.service;

import com.gl.fairplay.venueservice.domain.Booking;
import com.gl.fairplay.venueservice.domain.Venue;
import com.gl.fairplay.venueservice.web.dto.BookingResponse;
import com.gl.fairplay.venueservice.web.dto.VenueResponse;
import org.springframework.stereotype.Component;

/**
 * Maps venue-service entities into response payloads.
 */
@Component
public class VenueMapper {

    /**
     * Converts a venue entity to a response payload.
     *
     * @param venue entity to map
     * @return response payload
     */
    public VenueResponse toVenueResponse(Venue venue) {
        return new VenueResponse(
                venue.getId(),
                venue.getName(),
                venue.getLocation(),
                venue.getSportType(),
                venue.getPricePerHour(),
                venue.getAmenities(),
                venue.getAbout(),
                venue.getOwnerId()
        );
    }

    /**
     * Converts a booking entity to a response payload.
     *
     * @param booking entity to map
     * @return response payload
     */
    public BookingResponse toBookingResponse(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getUserId(),
                booking.getVenueId(),
                booking.getSlotTime(),
                booking.getStatus(),
                booking.getDurationHours(),
                booking.getTotalPrice()
        );
    }
}
