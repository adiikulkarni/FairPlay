package com.gl.fairplay.userservice.service;

import com.gl.fairplay.userservice.common.BusinessValidationException;
import com.gl.fairplay.userservice.common.ResourceNotFoundException;
import com.gl.fairplay.userservice.domain.Activity;
import com.gl.fairplay.userservice.domain.ActivityParticipant;
import com.gl.fairplay.userservice.repository.ActivityParticipantRepository;
import com.gl.fairplay.userservice.repository.ActivityRepository;
import com.gl.fairplay.userservice.web.dto.ActivityHostRequest;
import com.gl.fairplay.userservice.web.dto.ActivityJoinRequest;
import com.gl.fairplay.userservice.web.dto.ActivityResponse;
import jakarta.transaction.Transactional;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Handles activity creation and participation.
 */
@Service
@RequiredArgsConstructor
public class ActivityManagementService {

    private final ActivityRepository activityRepository;
    private final ActivityParticipantRepository participantRepository;
    private final UserManagementService userManagementService;
    private final UserMapper mapper;

    /**
     * Hosts a new activity.
     *
     * @param request host request
     * @return created activity
     */
    @Transactional
    public ActivityResponse hostActivity(ActivityHostRequest request) {
        userManagementService.getUserEntity(request.hostUserId());

        Activity activity = Activity.builder()
                .hostUserId(request.hostUserId())
                .sportType(request.sportType().trim())
                .location(request.location().trim())
                .time(request.time())
                .build();

        Activity saved = activityRepository.save(activity);
        participantRepository.save(ActivityParticipant.builder()
                .activityId(saved.getId())
                .userId(request.hostUserId())
                .build());

        List<Long> participantIds = List.of(request.hostUserId());
        return mapper.toActivityResponse(saved, participantIds.size(), participantIds);
    }

    /**
     * Joins an existing activity.
     *
     * @param request join request
     * @return updated activity
     */
    @Transactional
    public ActivityResponse joinActivity(ActivityJoinRequest request) {
        userManagementService.getUserEntity(request.userId());
        Activity activity = activityRepository.findById(request.activityId())
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found for id " + request.activityId()));

        if (participantRepository.existsByActivityIdAndUserId(request.activityId(), request.userId())) {
            throw new BusinessValidationException("User has already joined this activity");
        }

        participantRepository.save(ActivityParticipant.builder()
                .activityId(request.activityId())
                .userId(request.userId())
                .build());

        List<Long> participantIds = participantIds(activity.getId());
        return mapper.toActivityResponse(activity, participantIds.size(), participantIds);
    }

    /**
     * Returns the activity feed.
     *
     * @return activity responses
     */
    public List<ActivityResponse> getActivities() {
        return activityRepository.findAllByOrderByTimeAsc().stream()
                .map(activity -> {
                    List<Long> participantIds = participantIds(activity.getId());
                    return mapper.toActivityResponse(activity, participantIds.size(), participantIds);
                })
                .toList();
    }

    private List<Long> participantIds(Long activityId) {
        return participantRepository.findByActivityId(activityId).stream()
                .map(ActivityParticipant::getUserId)
                .toList();
    }
}
