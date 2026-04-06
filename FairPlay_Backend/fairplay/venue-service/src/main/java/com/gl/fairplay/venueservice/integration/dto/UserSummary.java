package com.gl.fairplay.venueservice.integration.dto;

import com.gl.fairplay.venueservice.domain.Role;

/**
 * Minimal user payload returned by user-service.
 */
public record UserSummary(
        Long id,
        String name,
        String email,
        String phone,
        Role role
) {
}
