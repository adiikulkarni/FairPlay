package com.gl.fairplay.venueservice.web;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.security.AuthenticatedUser;
import com.gl.fairplay.venueservice.service.BookingManagementService;
import com.gl.fairplay.venueservice.web.dto.BookingCreateRequest;
import com.gl.fairplay.venueservice.web.dto.BookingResponse;
import com.gl.fairplay.venueservice.web.dto.BookingUpdateRequest;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingManagementService bookingManagementService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                         @Valid @RequestBody BookingCreateRequest request) {
        if (!currentUser.id().equals(request.userId())) {
            throw new BusinessValidationException("User id must match authenticated user");
        }
        return bookingManagementService.createBooking(request);
    }

    @GetMapping("/{userId}")
    public List<BookingResponse> getBookingsForUser(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                                    @PathVariable Long userId) {
        if (!currentUser.id().equals(userId)) {
            throw new BusinessValidationException("User id must match authenticated user");
        }
        return bookingManagementService.getBookingsForUser(userId);
    }

    @PutMapping("/{bookingId}")
    public BookingResponse updateBooking(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                         @PathVariable Long bookingId,
                                         @Valid @RequestBody BookingUpdateRequest request) {
        return bookingManagementService.updateBooking(bookingId, currentUser.id(), currentUser.role(), request);
    }
}