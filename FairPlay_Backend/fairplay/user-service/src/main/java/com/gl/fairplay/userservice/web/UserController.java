package com.gl.fairplay.userservice.web;

import com.gl.fairplay.userservice.common.BusinessValidationException;
import com.gl.fairplay.userservice.security.AuthenticatedUser;
import com.gl.fairplay.userservice.security.JwtService;
import com.gl.fairplay.userservice.service.UserManagementService;
import com.gl.fairplay.userservice.web.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

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
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(),
                        request.password()));

        AuthenticatedUser currentUser = (AuthenticatedUser) authentication.getPrincipal();
        return new AuthResponse(jwtService.generateToken(currentUser));
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
    public UserResponse updateUser(@AuthenticationPrincipal AuthenticatedUser currentUser,
                                   @PathVariable Long userId,
                                   @Valid @RequestBody UserUpdateRequest request) {
        if (!currentUser.getId().equals(userId)) {
            throw new BusinessValidationException("You can update only your own profile");
        }
        return userManagementService.updateUser(userId, request);
    }

    @GetMapping("/me")
    public UserResponse getCurrentUser(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return userManagementService.getUser(currentUser.getId());
    }
}
