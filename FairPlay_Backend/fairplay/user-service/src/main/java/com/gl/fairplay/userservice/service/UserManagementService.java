package com.gl.fairplay.userservice.service;

import com.gl.fairplay.userservice.common.BusinessValidationException;
import com.gl.fairplay.userservice.common.DuplicateResourceException;
import com.gl.fairplay.userservice.common.ResourceNotFoundException;
import com.gl.fairplay.userservice.domain.User;
import com.gl.fairplay.userservice.repository.UserRepository;
import com.gl.fairplay.userservice.web.dto.LoginRequest;
import com.gl.fairplay.userservice.web.dto.UserRegistrationRequest;
import com.gl.fairplay.userservice.web.dto.UserResponse;
import com.gl.fairplay.userservice.web.dto.UserUpdateRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Handles user registration, login, and profile updates.
 */
@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;


    /**
     * Registers a new user.
     *
     * @param request request payload
     * @return created user
     */
    @Transactional
    public UserResponse registerUser(UserRegistrationRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("A user with this email already exists");
        }

        User user = User.builder()
                .name(request.name().trim())
                .email(normalizedEmail)
                .phone(request.phone().trim())
                .role(request.role())
                .password(passwordEncoder.encode(request.password()))
                .build();

        return mapper.toUserResponse(userRepository.save(user));
    }

    /**
     * Logs a user in with basic credential verification.
     *
     * @param request login request
     * @return user response
     */
    public UserResponse login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.email());

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BusinessValidationException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BusinessValidationException("Invalid email or password");
        }

        return mapper.toUserResponse(user);
    }

    /**
     * Updates mutable profile fields.
     *
     * @param userId user id
     * @param request update request
     * @return updated user
     */
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = getUserEntity(userId);

        if (request.name() != null && !request.name().isBlank()) {
            user.setName(request.name().trim());
        }

        if (request.email() != null && !request.email().isBlank()) {
            String normalizedEmail = normalizeEmail(request.email());

            if (!user.getEmail().equalsIgnoreCase(normalizedEmail)
                    && userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                throw new DuplicateResourceException("A user with this email already exists");
            }

            user.setEmail(normalizedEmail);
        }

        if (request.phone() != null && !request.phone().isBlank()) {
            user.setPhone(request.phone().trim());
        }

        return mapper.toUserResponse(userRepository.save(user));
    }


    /**
     * Resolves a user entity.
     *
     * @param userId user id
     * @return persistent entity
     */
    public User getUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id " + userId));
    }

    /**
     * Fetches a user by id.
     *
     * @param userId user id
     * @return user response
     */
    public UserResponse getUser(Long userId) {
        return mapper.toUserResponse(getUserEntity(userId));
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}
