package com.gl.fairplay.venueservice.service;

import com.gl.fairplay.venueservice.common.ResourceNotFoundException;
import com.gl.fairplay.venueservice.domain.Booking;
import com.gl.fairplay.venueservice.domain.BookingStatus;
import com.gl.fairplay.venueservice.domain.Venue;
import com.gl.fairplay.venueservice.repository.BookingRepository;
import com.gl.fairplay.venueservice.repository.VenueRepository;
import com.gl.fairplay.venueservice.web.dto.OwnerDashboardResponse;
import com.gl.fairplay.venueservice.web.dto.VenueCreateRequest;
import com.gl.fairplay.venueservice.web.dto.VenueResponse;
import com.gl.fairplay.venueservice.web.dto.VenueUpdateRequest;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Handles venue management and owner dashboard logic.
 */
@Service
@RequiredArgsConstructor
public class VenueManagementService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final UserValidationService userValidationService;
    private final VenueMapper mapper;

    /**
     * Creates a new venue for a validated owner.
     *
     * @param request create request
     * @return created venue
     */
    @Transactional
    public VenueResponse createVenue(VenueCreateRequest request) {
        userValidationService.validateOwner(request.ownerId());

        Venue venue = Venue.builder()
                .name(request.name().trim())
                .location(request.location().trim())
                .sportType(request.sportType().trim())
                .pricePerHour(request.pricePerHour())
                .ownerId(request.ownerId())
                .build();

        return mapper.toVenueResponse(venueRepository.save(venue));
    }

    /**
     * Returns filtered venues.
     *
     * @param location optional location filter
     * @param sportType optional sport filter
     * @return matching venues
     */
    public List<VenueResponse> searchVenues(String location, String sportType) {
        String normalizedLocation = normalize(location);
        String normalizedSport = normalize(sportType);

        return venueRepository.findAll().stream()
                .filter(venue -> normalizedLocation == null
                        || venue.getLocation().toLowerCase(Locale.ROOT).contains(normalizedLocation))
                .filter(venue -> normalizedSport == null
                        || venue.getSportType().toLowerCase(Locale.ROOT).contains(normalizedSport))
                .map(mapper::toVenueResponse)
                .toList();
    }

    /**
     * Updates a venue.
     *
     * @param venueId venue id
     * @param request update request
     * @return updated venue
     */
    @Transactional
    public VenueResponse updateVenue(Long venueId, VenueUpdateRequest request) {
        Venue venue = getVenueEntity(venueId);
        if (request.name() != null && !request.name().isBlank()) {
            venue.setName(request.name().trim());
        }
        if (request.location() != null && !request.location().isBlank()) {
            venue.setLocation(request.location().trim());
        }
        if (request.sportType() != null && !request.sportType().isBlank()) {
            venue.setSportType(request.sportType().trim());
        }
        if (request.pricePerHour() != null) {
            venue.setPricePerHour(request.pricePerHour());
        }
        return mapper.toVenueResponse(venueRepository.save(venue));
    }

    /**
     * Returns owner dashboard metrics.
     *
     * @param ownerId owner id
     * @return dashboard summary
     */
    public OwnerDashboardResponse getOwnerDashboard(Long ownerId) {
        userValidationService.validateOwner(ownerId);
        List<Venue> venues = venueRepository.findByOwnerId(ownerId);
        List<Long> venueIds = venues.stream().map(Venue::getId).toList();
        List<Booking> bookings = venueIds.isEmpty() ? List.of() : bookingRepository.findByVenueIdIn(venueIds);

        long activeBookings = bookings.stream().filter(booking -> booking.getStatus() == BookingStatus.BOOKED).count();
        long cancelledBookings = bookings.stream().filter(booking -> booking.getStatus() == BookingStatus.CANCELLED).count();
        BigDecimal totalEarnings = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.BOOKED)
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OwnerDashboardResponse(venues.size(), activeBookings, cancelledBookings, totalEarnings);
    }

    /**
     * Resolves a venue entity.
     *
     * @param venueId venue id
     * @return persistent venue
     */
    public Venue getVenueEntity(Long venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found for id " + venueId));
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
