package com.gl.fairplay.userservice.web.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * Activity hosting request.
 */
public record ActivityHostRequest(
        @NotNull(message = "Host user id is required")
        Long hostUserId,
        @NotBlank(message = "Sport type is required")
        String sportType,
        @NotBlank(message = "Location is required")
        String location,
        @NotNull(message = "Time is required")
        @Future(message = "Activity time must be in the future")
        LocalDateTime time
) {
}
