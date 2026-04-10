package com.gl.fairplay.venueservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.domain.Booking;
import com.gl.fairplay.venueservice.domain.BookingStatus;
import com.gl.fairplay.venueservice.domain.Role;
import com.gl.fairplay.venueservice.domain.Venue;
import com.gl.fairplay.venueservice.integration.dto.UserSummary;
import com.gl.fairplay.venueservice.repository.BookingRepository;
import com.gl.fairplay.venueservice.repository.VenueRepository;
import com.gl.fairplay.venueservice.web.dto.VenueCreateRequest;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for venue management.
 */
@ExtendWith(MockitoExtension.class)
class VenueManagementServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserValidationService userValidationService;

    private VenueManagementService venueManagementService;

    @BeforeEach
    void setUp() {
        venueManagementService = new VenueManagementService(
                venueRepository,
                bookingRepository,
                userValidationService,
                new VenueMapper());
    }

    @Test
    void createVenueRequiresOwnerRole() {
        when(userValidationService.validateOwner(9L))
                .thenThrow(new BusinessValidationException("User 9 is not registered as an owner"));

        assertThatThrownBy(() -> venueManagementService.createVenue(new VenueCreateRequest(
                "Arena",
                "Pune",
                "Badminton",
                BigDecimal.valueOf(500),
                List.of("Parking", "Washroom"),
                "Indoor badminton court",
                9L)))
                .isInstanceOf(BusinessValidationException.class);
    }

    @Test
    void ownerDashboardAggregatesBookings() {
        when(userValidationService.validateOwner(1L))
                .thenReturn(new UserSummary(1L, "Owner", "owner@example.com", "9876543210", Role.OWNER));
        when(venueRepository.findByOwnerId(1L)).thenReturn(List.of(
                Venue.builder().id(10L).ownerId(1L).build(),
                Venue.builder().id(11L).ownerId(1L).build()));
        when(bookingRepository.findByVenueIdIn(List.of(10L, 11L))).thenReturn(List.of(
                Booking.builder().status(BookingStatus.BOOKED).totalPrice(BigDecimal.valueOf(1000)).build(),
                Booking.builder().status(BookingStatus.CANCELLED).totalPrice(BigDecimal.valueOf(800)).build(),
                Booking.builder().status(BookingStatus.BOOKED).totalPrice(BigDecimal.valueOf(1200)).build()));

        var response = venueManagementService.getOwnerDashboard(1L);

        assertThat(response.totalVenues()).isEqualTo(2L);
        assertThat(response.activeBookings()).isEqualTo(2L);
        assertThat(response.cancelledBookings()).isEqualTo(1L);
        assertThat(response.totalEarnings()).isEqualByComparingTo("2200");
    }

    @Test
    void getVenuesForOwnerReturnsMappedResponses() {
        when(userValidationService.validateOwner(1L))
                .thenReturn(new UserSummary(1L, "Owner", "owner@example.com", "9876543210", Role.OWNER));
        when(venueRepository.findByOwnerId(1L)).thenReturn(List.of(
                Venue.builder()
                        .id(10L)
                        .name("Smash Arena")
                        .location("Pune")
                        .sportType("Badminton")
                        .pricePerHour(BigDecimal.valueOf(650))
                        .ownerId(1L)
                        .build()));

        var response = venueManagementService.getVenueResponsesForOwner(1L);

        assertThat(response).hasSize(1);
        assertThat(response.get(0).name()).isEqualTo("Smash Arena");
        assertThat(response.get(0).ownerId()).isEqualTo(1L);
    }

    @Test
    void deleteVenueRejectsWhenBookingsExist() {
        when(venueRepository.findById(10L)).thenReturn(java.util.Optional.of(
                Venue.builder().id(10L).ownerId(1L).name("Smash Arena").build()));
        when(bookingRepository.existsByVenueId(10L)).thenReturn(true);

        assertThatThrownBy(() -> venueManagementService.deleteVenue(10L, 1L))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessage("Cannot delete a venue that already has bookings");
    }

    @Test
    void deleteVenueDeletesOwnerVenueWithoutBookings() {
        Venue venue = Venue.builder().id(10L).ownerId(1L).name("Smash Arena").build();
        when(venueRepository.findById(10L)).thenReturn(java.util.Optional.of(venue));
        when(bookingRepository.existsByVenueId(10L)).thenReturn(false);

        venueManagementService.deleteVenue(10L, 1L);

        verify(venueRepository).delete(venue);
    }
}
