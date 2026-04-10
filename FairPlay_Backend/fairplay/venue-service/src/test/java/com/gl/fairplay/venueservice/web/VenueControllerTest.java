package com.gl.fairplay.venueservice.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.domain.Role;
import com.gl.fairplay.venueservice.security.AuthenticatedUser;
import com.gl.fairplay.venueservice.service.BookingManagementService;
import com.gl.fairplay.venueservice.service.VenueManagementService;
import com.gl.fairplay.venueservice.web.dto.VenueResponse;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VenueControllerTest {

    @Mock
    private VenueManagementService venueManagementService;

    @Mock
    private BookingManagementService bookingManagementService;

    private VenueController venueController;

    @BeforeEach
    void setUp() {
        venueController = new VenueController(venueManagementService, bookingManagementService);
    }

    @Test
    void getOwnerVenuesRejectsMismatchedOwnerId() {
        assertThatThrownBy(() -> venueController.getOwnerVenues(
                new AuthenticatedUser(2L, "owner@example.com", Role.OWNER), 1L))
                .isInstanceOf(BusinessValidationException.class)
                .hasMessage("Owner id must match authenticated user");
    }

    @Test
    void getOwnerVenuesReturnsManagedVenues() {
        var currentUser = new AuthenticatedUser(1L, "owner@example.com", Role.OWNER);
        var venues = List.of(new VenueResponse(
                10L,
                "Smash Arena",
                "Pune",
                "Badminton",
                BigDecimal.valueOf(650),
                List.of("Parking", "Washroom"),
                "Indoor courts",
                1L));
        when(venueManagementService.getVenueResponsesForOwner(1L)).thenReturn(venues);

        var response = venueController.getOwnerVenues(currentUser, 1L);

        assertThat(response).isEqualTo(venues);
    }

    @Test
    void deleteVenueDelegatesToService() {
        var currentUser = new AuthenticatedUser(1L, "owner@example.com", Role.OWNER);

        venueController.deleteVenue(currentUser, 10L);

        verify(venueManagementService).deleteVenue(10L, 1L);
    }
}
