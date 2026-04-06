package com.gl.fairplay.userservice.web.dto;

import java.time.LocalDateTime;

/**
 * Activity response payload.
 */
public record ActivityResponse(
        Long id,
        Long hostUserId,
        String sportType,
        String location,
        LocalDateTime time,
        long participantCount
) {
}
