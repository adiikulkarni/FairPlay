package com.gl.fairplay.venueservice.web;

import com.gl.fairplay.venueservice.service.BookingManagementService;
import com.gl.fairplay.venueservice.web.dto.BookingCreateRequest;
import com.gl.fairplay.venueservice.web.dto.BookingResponse;
import com.gl.fairplay.venueservice.web.dto.BookingUpdateRequest;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Booking REST endpoints.
 */
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingManagementService bookingManagementService;

    /**
     * Creates a booking.
     *
     * @param request booking request
     * @return created booking
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@Valid @RequestBody BookingCreateRequest request) {
        return bookingManagementService.createBooking(request);
    }

    /**
     * Returns bookings for a user.
     *
     * @param userId user id
     * @return booking list
     */
    @GetMapping("/{userId}")
    public List<BookingResponse> getBookingsForUser(@PathVariable Long userId) {
        return bookingManagementService.getBookingsForUser(userId);
    }

    /**
     * Updates or cancels a booking.
     *
     * @param bookingId booking id
     * @param request update request
     * @return updated booking
     */
    @PutMapping("/{bookingId}")
    public BookingResponse updateBooking(@PathVariable Long bookingId, @Valid @RequestBody BookingUpdateRequest request) {
        return bookingManagementService.updateBooking(bookingId, request);
    }
}
