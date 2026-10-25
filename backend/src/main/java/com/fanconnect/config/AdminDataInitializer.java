package com.fanconnect.config;

import com.fanconnect.model.entity.User;
import com.fanconnect.model.enums.Role;
import com.fanconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminDataInitializer implements ApplicationRunner {

    private static final String ADMIN_EMAIL = "admin@fanconnect.com";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            userRepository.save(User.builder()
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Admin")
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build());
        }
    }
}