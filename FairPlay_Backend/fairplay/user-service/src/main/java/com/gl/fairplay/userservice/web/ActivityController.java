package com.gl.fairplay.userservice.web;

import com.gl.fairplay.userservice.common.BusinessValidationException;
import com.gl.fairplay.userservice.security.AuthenticatedUser;
import com.gl.fairplay.userservice.service.ActivityManagementService;
import com.gl.fairplay.userservice.web.dto.ActivityHostRequest;
import com.gl.fairplay.userservice.web.dto.ActivityJoinRequest;
import com.gl.fairplay.userservice.web.dto.ActivityResponse;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Activity REST endpoints.
 */
@RestController
@RequestMapping("/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityManagementService activityManagementService;

    /**
     * Hosts a new activity.
     *
     * @param request host request
     * @return created activity
     */
    @PostMapping("/host")
    @ResponseStatus(HttpStatus.CREATED)
    public ActivityResponse hostActivity(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                         @Valid @RequestBody ActivityHostRequest request) {
        if (!currentUser.getId().equals(request.hostUserId())) {
            throw new BusinessValidationException("Host user id must match authenticated user");
        }

        return activityManagementService.hostActivity(request);
    }

    /**
     * Joins an activity.
     *
     * @param request join request
     * @return updated activity
     */
    @PostMapping("/join")
    public ActivityResponse joinActivity(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                         @Valid @RequestBody ActivityJoinRequest request) {
        if (!currentUser.getId().equals(request.userId())) {
            throw new BusinessValidationException("User id must match authenticated user");
        }

        return activityManagementService.joinActivity(request);
    }

    /**
     * Returns the activity feed.
     *
     * @return activity list
     */
    @GetMapping
    public List<ActivityResponse> getActivities() {
        return activityManagementService.getActivities();
    }
}
