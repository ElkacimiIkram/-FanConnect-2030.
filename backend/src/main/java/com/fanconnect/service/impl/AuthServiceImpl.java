package com.fanconnect.service.impl;

import com.fanconnect.dto.request.LoginRequest;
import com.fanconnect.dto.request.RegisterRequest;
import com.fanconnect.dto.response.AuthResponse;
import com.fanconnect.dto.response.UserResponse;
import com.fanconnect.exception.BusinessException;
import com.fanconnect.mapper.UserMapper;
import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.Role;
import com.fanconnect.repository.UserRepository;
import com.fanconnect.security.JwtService;
import com.fanconnect.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered");
        }

        Role role = resolveRegistrationRole(request.getRole());
        validateRegistrationProfile(request, role);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .city(request.getCity())
                .role(role)
                .enabled(true)
                .build();

        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid credentials"));

        return buildAuthResponse(user);
    }

    private Role resolveRegistrationRole(Role role) {
        if (role == null) {
            throw new BusinessException("Registration role is required");
        }
        if (role == Role.ADMIN) {
            throw new BusinessException("Admin accounts cannot be created via public registration");
        }
        if (role != Role.FAN_USER && role != Role.BUSINESS_OWNER) {
            throw new BusinessException("Invalid registration role");
        }
        return role;
    }

    private void validateRegistrationProfile(RegisterRequest request, Role role) {
        if (role == Role.FAN_USER && (request.getCity() == null || request.getCity().isBlank())) {
            throw new BusinessException("City is required for fan registration");
        }
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(userDetails);
        UserResponse userResponse = userMapper.toResponse(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }
}