package com.gl.fairplay.userservice.web.dto;

import com.gl.fairplay.userservice.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * User profile update request.
 */
public record UserUpdateRequest(
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,
        @Email(message = "Email must be valid")
        String email,
        @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone must be 10 to 15 digits")
        String phone
) {
}
