package com.gl.fairplay.userservice.service;

import com.gl.fairplay.userservice.domain.Activity;
import com.gl.fairplay.userservice.domain.User;
import com.gl.fairplay.userservice.web.dto.ActivityResponse;
import com.gl.fairplay.userservice.web.dto.UserResponse;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Maps domain entities into DTO responses.
 */
@Component
public class UserMapper {

    /**
     * Converts a user entity to a response payload.
     *
     * @param user entity to map
     * @return response payload
     */
    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    /**
     * Converts an activity entity to a response payload.
     *
     * @param activity entity to map
     * @param participantCount participant count
     * @return response payload
     */
    public ActivityResponse toActivityResponse(Activity activity, long participantCount, List<Long> participantIds) {
        return new ActivityResponse(
                activity.getId(),
                activity.getHostUserId(),
                activity.getSportType(),
                activity.getLocation(),
                activity.getTime(),
                participantCount,
                participantIds
        );
    }
}
