package com.gl.fairplay.userservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.gl.fairplay.userservice.common.BusinessValidationException;
import com.gl.fairplay.userservice.domain.Activity;
import com.gl.fairplay.userservice.domain.ActivityParticipant;
import com.gl.fairplay.userservice.domain.User;
import com.gl.fairplay.userservice.repository.ActivityParticipantRepository;
import com.gl.fairplay.userservice.repository.ActivityRepository;
import com.gl.fairplay.userservice.web.dto.ActivityHostRequest;
import com.gl.fairplay.userservice.web.dto.ActivityJoinRequest;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for activity management.
 */
@ExtendWith(MockitoExtension.class)
class ActivityManagementServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private ActivityParticipantRepository participantRepository;

    @Mock
    private UserManagementService userManagementService;

    private ActivityManagementService activityManagementService;

    @BeforeEach
    void setUp() {
        activityManagementService = new ActivityManagementService(
                activityRepository,
                participantRepository,
                userManagementService,
                new UserMapper());
    }

    @Test
    void hostActivityAddsHostAsParticipant() {
        when(userManagementService.getUserEntity(1L)).thenReturn(User.builder().id(1L).build());
        when(activityRepository.save(any(Activity.class))).thenAnswer(invocation -> {
            Activity activity = invocation.getArgument(0, Activity.class);
            activity.setId(10L);
            return activity;
        });
        when(participantRepository.save(any(ActivityParticipant.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = activityManagementService.hostActivity(new ActivityHostRequest(
                1L,
                "Football",
                "Pune",
                LocalDateTime.now().plusDays(1)));

        assertThat(response.id()).isEqualTo(10L);
        assertThat(response.participantCount()).isEqualTo(1L);
    }

    @Test
    void joinActivityPreventsDuplicateParticipation() {
        when(userManagementService.getUserEntity(2L)).thenReturn(User.builder().id(2L).build());
        when(activityRepository.findById(4L)).thenReturn(Optional.of(Activity.builder().id(4L).build()));
        when(participantRepository.existsByActivityIdAndUserId(4L, 2L)).thenReturn(true);

        assertThatThrownBy(() -> activityManagementService.joinActivity(new ActivityJoinRequest(4L, 2L)))
                .isInstanceOf(BusinessValidationException.class);
    }
}
