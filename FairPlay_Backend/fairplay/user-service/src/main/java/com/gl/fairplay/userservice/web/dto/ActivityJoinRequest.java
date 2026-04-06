package com.gl.fairplay.userservice.web.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Activity join request.
 */
public record ActivityJoinRequest(
        @NotNull(message = "Activity id is required")
        Long activityId,
        @NotNull(message = "User id is required")
        Long userId
) {
}
