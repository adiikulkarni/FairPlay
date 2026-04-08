package com.gl.fairplay.venueservice.web;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.security.AuthenticatedUser;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class VenueController {

    private final VenueManagementService venueManagementService;
    private final BookingManagementService bookingManagementService;

    @PostMapping("/venues")
    @ResponseStatus(HttpStatus.CREATED)
    public VenueResponse createVenue(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                     @Valid @RequestBody VenueCreateRequest request) {
        if (!currentUser.id().equals(request.ownerId())) {
            throw new BusinessValidationException("Owner id must match authenticated user");
        }
        return venueManagementService.createVenue(request);
    }

    @GetMapping("/venues")
    public List<VenueResponse> getVenues(@RequestParam(required = false) String location,
                                         @RequestParam(required = false) String sportType) {
        return venueManagementService.searchVenues(location, sportType);
    }

    @PutMapping("/venues/{venueId}")
    public VenueResponse updateVenue(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                     @PathVariable Long venueId,
                                     @Valid @RequestBody VenueUpdateRequest request) {
        return venueManagementService.updateVenue(venueId, currentUser.id(), request);
    }

    @GetMapping("/owners/{ownerId}/dashboard")
    public OwnerDashboardResponse getOwnerDashboard(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                                    @PathVariable Long ownerId) {
        if (!currentUser.id().equals(ownerId)) {
            throw new BusinessValidationException("Owner id must match authenticated user");
        }
        return venueManagementService.getOwnerDashboard(ownerId);
    }

    @GetMapping("/owners/{ownerId}/bookings")
    public List<BookingResponse> getOwnerBookings(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                                  @PathVariable Long ownerId) {
        if (!currentUser.id().equals(ownerId)) {
            throw new BusinessValidationException("Owner id must match authenticated user");
        }
        return bookingManagementService.getBookingsForOwner(ownerId);
    }
}