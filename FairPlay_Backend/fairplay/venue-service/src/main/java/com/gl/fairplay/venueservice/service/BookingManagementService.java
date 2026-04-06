package com.gl.fairplay.venueservice.service;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.common.ResourceNotFoundException;
import com.gl.fairplay.venueservice.domain.Booking;
import com.gl.fairplay.venueservice.domain.BookingStatus;
import com.gl.fairplay.venueservice.domain.Venue;
import com.gl.fairplay.venueservice.repository.BookingRepository;
import com.gl.fairplay.venueservice.web.dto.BookingCreateRequest;
import com.gl.fairplay.venueservice.web.dto.BookingResponse;
import com.gl.fairplay.venueservice.web.dto.BookingUpdateRequest;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Handles booking workflows.
 */
@Service
@RequiredArgsConstructor
public class BookingManagementService {

    private final BookingRepository bookingRepository;
    private final VenueManagementService venueManagementService;
    private final UserValidationService userValidationService;
    private final VenueMapper mapper;

    /**
     * Creates a booking after validating user and slot availability.
     *
     * @param request create request
     * @return created booking
     */
    @Transactional
    public BookingResponse createBooking(BookingCreateRequest request) {
        userValidationService.validateUser(request.userId());
        Venue venue = venueManagementService.getVenueEntity(request.venueId());
        ensureSlotAvailable(venue.getId(), request.slotTime(), null);

        Booking booking = Booking.builder()
                .userId(request.userId())
                .venueId(request.venueId())
                .slotTime(request.slotTime())
                .status(BookingStatus.BOOKED)
                .durationHours(request.durationHours())
                .totalPrice(venue.getPricePerHour().multiply(BigDecimal.valueOf(request.durationHours())))
                .build();

        return mapper.toBookingResponse(bookingRepository.save(booking));
    }

    /**
     * Returns bookings for a user.
     *
     * @param userId user id
     * @return booking list
     */
    public List<BookingResponse> getBookingsForUser(Long userId) {
        userValidationService.validateUser(userId);
        return bookingRepository.findByUserIdOrderBySlotTimeDesc(userId).stream()
                .map(mapper::toBookingResponse)
                .toList();
    }

    /**
     * Updates or cancels a booking.
     *
     * @param bookingId booking id
     * @param request update request
     * @return updated booking
     */
    @Transactional
    public BookingResponse updateBooking(Long bookingId, BookingUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for id " + bookingId));

        if (request.slotTime() == null && request.status() == null) {
            throw new BusinessValidationException("At least one booking field must be provided");
        }

        if (request.slotTime() != null) {
            ensureSlotAvailable(booking.getVenueId(), request.slotTime(), booking.getId());
            booking.setSlotTime(request.slotTime());
        }
        if (request.status() != null) {
            booking.setStatus(request.status());
        }

        return mapper.toBookingResponse(bookingRepository.save(booking));
    }

    private void ensureSlotAvailable(Long venueId, LocalDateTime slotTime, Long currentBookingId) {
        boolean unavailable = bookingRepository.findAll().stream()
                .filter(existing -> existing.getStatus() == BookingStatus.BOOKED)
                .filter(existing -> existing.getVenueId().equals(venueId))
                .filter(existing -> existing.getSlotTime().equals(slotTime))
                .anyMatch(existing -> currentBookingId == null || !existing.getId().equals(currentBookingId));

        if (unavailable) {
            throw new BusinessValidationException("Selected slot is not available");
        }
    }
}
