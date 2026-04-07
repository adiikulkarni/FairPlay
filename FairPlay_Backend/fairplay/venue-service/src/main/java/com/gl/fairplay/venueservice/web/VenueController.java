package com.gl.fairplay.venueservice.web;

import com.gl.fairplay.venueservice.service.BookingManagementService;
import com.gl.fairplay.venueservice.service.VenueManagementService;
import com.gl.fairplay.venueservice.web.dto.BookingResponse;
import com.gl.fairplay.venueservice.web.dto.OwnerDashboardResponse;
import com.gl.fairplay.venueservice.web.dto.VenueCreateRequest;
import com.gl.fairplay.venueservice.web.dto.VenueResponse;
import com.gl.fairplay.venueservice.web.dto.VenueUpdateRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Venue REST endpoints.
 */
@RestController
@RequestMapping
@RequiredArgsConstructor
public class VenueController {

    private final VenueManagementService venueManagementService;
    private final BookingManagementService bookingManagementService;

    /**
     * Creates a venue.
     *
     * @param request create request
     * @return created venue
     */
    @PostMapping("/venues")
    @ResponseStatus(HttpStatus.CREATED)
    public VenueResponse createVenue(@Valid @RequestBody VenueCreateRequest request) {
        return venueManagementService.createVenue(request);
    }

    /**
     * Returns filtered venues.
     *
     * @param location optional location filter
     * @param sportType optional sport filter
     * @return matching venues
     */
    @GetMapping("/venues")
    public List<VenueResponse> getVenues(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String sportType) {
        return venueManagementService.searchVenues(location, sportType);
    }

    /**
     * Updates a venue.
     *
     * @param venueId venue id
     * @param request update request
     * @return updated venue
     */
    @PutMapping("/venues/{venueId}")
    public VenueResponse updateVenue(@PathVariable Long venueId, @Valid @RequestBody VenueUpdateRequest request) {
        return venueManagementService.updateVenue(venueId, request);
    }

    /**
     * Returns owner dashboard metrics.
     *
     * @param ownerId owner id
     * @return dashboard summary
     */
    @GetMapping("/owners/{ownerId}/dashboard")
    public OwnerDashboardResponse getOwnerDashboard(@PathVariable Long ownerId) {
        return venueManagementService.getOwnerDashboard(ownerId);
    }

    /**
     * Returns bookings across all venues owned by the owner.
     *
     * @param ownerId owner id
     * @return booking list
     */
    @GetMapping("/owners/{ownerId}/bookings")
    public List<BookingResponse> getOwnerBookings(@PathVariable Long ownerId) {
        return bookingManagementService.getBookingsForOwner(ownerId);
    }
}
