package com.gl.fairplay.venueservice.service;

import com.gl.fairplay.venueservice.common.BusinessValidationException;
import com.gl.fairplay.venueservice.domain.Role;
import com.gl.fairplay.venueservice.integration.UserClient;
import com.gl.fairplay.venueservice.integration.dto.UserSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Handles cross-service user validation through OpenFeign.
 */
@Service
@RequiredArgsConstructor
public class UserValidationService {

    private final UserClient userClient;

    /**
     * Ensures a user exists.
     *
     * @param userId user id
     * @return user summary
     */
    public UserSummary validateUser(Long userId) {
        return userClient.getUserById(userId);
    }

    /**
     * Ensures a user exists and has owner role.
     *
     * @param ownerId owner id
     * @return owner summary
     */
    public UserSummary validateOwner(Long ownerId) {
        UserSummary user = validateUser(ownerId);
        if (user.role() != Role.OWNER) {
            throw new BusinessValidationException("User " + ownerId + " is not registered as an owner");
        }
        return user;
    }
}
