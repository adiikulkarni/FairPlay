package com.gl.fairplay.venueservice.integration;

import com.gl.fairplay.venueservice.integration.dto.UserSummary;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * OpenFeign client for user-service.
 */
@FeignClient(name = "user-service")
public interface UserClient {

    /**
     * Fetches a user from user-service.
     *
     * @param userId user id
     * @return user summary
     */
    @GetMapping("/users/{userId}")
    UserSummary getUserById(@PathVariable("userId") Long userId);
}
