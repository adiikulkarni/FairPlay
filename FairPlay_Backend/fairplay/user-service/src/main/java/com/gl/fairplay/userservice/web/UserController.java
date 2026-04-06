package com.gl.fairplay.userservice.web;

import com.gl.fairplay.userservice.service.UserManagementService;
import com.gl.fairplay.userservice.web.dto.LoginRequest;
import com.gl.fairplay.userservice.web.dto.UserRegistrationRequest;
import com.gl.fairplay.userservice.web.dto.UserResponse;
import com.gl.fairplay.userservice.web.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * User REST endpoints.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserManagementService userManagementService;

    /**
     * Registers a new user.
     *
     * @param request registration request
     * @return created user
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        return userManagementService.registerUser(request);
    }

    /**
     * Logs a user in.
     *
     * @param request login request
     * @return authenticated user
     */
    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        return userManagementService.login(request);
    }

    /**
     * Returns a user by id.
     *
     * @param userId user id
     * @return user payload
     */
    @GetMapping("/{userId}")
    public UserResponse getUser(@PathVariable Long userId) {
        return userManagementService.getUser(userId);
    }

    /**
     * Updates a user profile.
     *
     * @param userId user id
     * @param request update request
     * @return updated user
     */
    @PutMapping("/{userId}")
    public UserResponse updateUser(@PathVariable Long userId, @Valid @RequestBody UserUpdateRequest request) {
        return userManagementService.updateUser(userId, request);
    }
}
