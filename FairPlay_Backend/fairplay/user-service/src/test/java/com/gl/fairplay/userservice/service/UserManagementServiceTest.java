package com.gl.fairplay.userservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.gl.fairplay.userservice.common.BusinessValidationException;
import com.gl.fairplay.userservice.common.DuplicateResourceException;
import com.gl.fairplay.userservice.domain.Role;
import com.gl.fairplay.userservice.domain.User;
import com.gl.fairplay.userservice.repository.UserRepository;
import com.gl.fairplay.userservice.web.dto.LoginRequest;
import com.gl.fairplay.userservice.web.dto.UserRegistrationRequest;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Unit tests for user management.
 */
@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserManagementService userManagementService;

    @BeforeEach
    void setUp() {
        userManagementService = new UserManagementService(
                userRepository,
                new UserMapper(),
                new BCryptPasswordEncoder()
        );
    }

    @Test
    void registerUserRejectsDuplicateEmail() {
        when(userRepository.existsByEmailIgnoreCase("player@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userManagementService.registerUser(new UserRegistrationRequest(
                "Player One",
                "player@example.com",
                "9876543210",
                Role.USER,
                "secret12")))
                .isInstanceOf(DuplicateResourceException.class);
    }

    @Test
    void registerUserNormalizesEmail() {
        when(userRepository.existsByEmailIgnoreCase("owner@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            user.setId(3L);
            return user;
        });

        var response = userManagementService.registerUser(new UserRegistrationRequest(
                "Owner",
                "Owner@Example.com",
                "9876543210",
                Role.OWNER,
                "secret12"));

        assertThat(response.email()).isEqualTo("owner@example.com");
    }

    @Test
    void loginRejectsInvalidPassword() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(
                User.builder()
                        .id(1L)
                        .email("user@example.com")
                        .password(encoder.encode("correct"))
                        .build()));

        assertThatThrownBy(() -> userManagementService.login(new LoginRequest("user@example.com", "wrong")))
                .isInstanceOf(BusinessValidationException.class);
    }
}