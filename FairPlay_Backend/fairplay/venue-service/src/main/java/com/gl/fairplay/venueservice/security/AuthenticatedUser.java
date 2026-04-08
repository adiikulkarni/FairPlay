package com.gl.fairplay.venueservice.security;

import com.gl.fairplay.venueservice.domain.Role;

public record AuthenticatedUser(Long id, String email, Role role) {
}