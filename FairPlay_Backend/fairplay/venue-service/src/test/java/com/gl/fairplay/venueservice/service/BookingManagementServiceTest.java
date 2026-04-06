package com.gl.fairplay.venueservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.domain.Booking;
import com.gl.fairplay.venueservice.domain.BookingStatus;
import com.gl.fairplay.venueservice.domain.Venue;
import com.gl.fairplay.venueservice.integration.dto.UserSummary;
import com.gl.fairplay.venueservice.repository.BookingRepository;
import com.gl.fairplay.venueservice.web.dto.BookingCreateRequest;
import com.gl.fairplay.venueservice.web.dto.BookingUpdateRequest;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for booking management.
 */
@ExtendWith(MockitoExtension.class)
class BookingManagementServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VenueManagementService venueManagementService;

    @Mock
    private UserValidationService userValidationService;

    private BookingManagementService bookingManagementService;

    @BeforeEach
    void setUp() {
        bookingManagementService = new BookingManagementService(
                bookingRepository,
                venueManagementService,
                userValidationService,
                new VenueMapper());
    }

    @Test
    void createBookingRejectsUnavailableSlot() {
        LocalDateTime slot = LocalDateTime.now().plusDays(1);
        when(userValidationService.validateUser(1L))
                .thenReturn(new UserSummary(1L, "User", "u@example.com", "9999999999", com.gl.fairplay.venueservice.domain.Role.USER));
        when(venueManagementService.getVenueEntity(2L))
                .thenReturn(Venue.builder().id(2L).pricePerHour(BigDecimal.valueOf(800)).build());
        when(bookingRepository.findAll()).thenReturn(List.of(
                Booking.builder().id(99L).venueId(2L).slotTime(slot).status(BookingStatus.BOOKED).build()));

        assertThatThrownBy(() -> bookingManagementService.createBooking(new BookingCreateRequest(1L, 2L, slot, 2)))
                .isInstanceOf(BusinessValidationException.class);
    }

    @Test
    void createBookingCalculatesTotalPrice() {
        LocalDateTime slot = LocalDateTime.now().plusDays(1);
        when(userValidationService.validateUser(1L))
                .thenReturn(new UserSummary(1L, "User", "u@example.com", "9999999999", com.gl.fairplay.venueservice.domain.Role.USER));
        when(venueManagementService.getVenueEntity(2L))
                .thenReturn(Venue.builder().id(2L).pricePerHour(BigDecimal.valueOf(800)).build());
        when(bookingRepository.findAll()).thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0, Booking.class);
            booking.setId(7L);
            return booking;
        });

        var response = bookingManagementService.createBooking(new BookingCreateRequest(1L, 2L, slot, 2));

        assertThat(response.totalPrice()).isEqualByComparingTo("1600");
        assertThat(response.status()).isEqualTo(BookingStatus.BOOKED);
    }

    @Test
    void updateBookingCancelsBooking() {
        when(bookingRepository.findById(5L)).thenReturn(Optional.of(Booking.builder()
                .id(5L)
                .venueId(2L)
                .userId(1L)
                .status(BookingStatus.BOOKED)
                .durationHours(1)
                .totalPrice(BigDecimal.TEN)
                .slotTime(LocalDateTime.now().plusDays(2))
                .build()));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = bookingManagementService.updateBooking(5L, new BookingUpdateRequest(null, BookingStatus.CANCELLED));

        assertThat(response.status()).isEqualTo(BookingStatus.CANCELLED);
    }
}
