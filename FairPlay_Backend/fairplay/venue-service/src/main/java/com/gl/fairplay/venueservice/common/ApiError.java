package com.gl.fairplay.venueservice.common;

import java.time.Instant;
import java.util.List;

/**
 * Standard REST error payload.
 */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        List<String> details
) {
}
