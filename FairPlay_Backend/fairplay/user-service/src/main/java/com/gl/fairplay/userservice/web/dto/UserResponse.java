package com.gl.fairplay.userservice.web.dto;

import com.gl.fairplay.userservice.domain.Role;

/**
 * User response payload.
 */
public record UserResponse(
        Long id,
        String name,
        String email,
        String phone,
        Role role
) {
}
