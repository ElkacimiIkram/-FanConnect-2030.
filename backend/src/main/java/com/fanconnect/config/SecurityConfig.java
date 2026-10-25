package com.fanconnect.config;

import com.fanconnect.security.JwtAuthenticationFilter;
import jakarta.servlet.DispatcherType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .dispatcherTypeMatchers(
                                DispatcherType.ERROR,
                                DispatcherType.FORWARD,
                                DispatcherType.INCLUDE,
                                DispatcherType.ASYNC
                        ).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/health"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/cafes", "/cafes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/businesses", "/businesses/**").permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/matches/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/matches/**")).permitAll()
                        .requestMatchers(HttpMethod.GET, "/recommendations", "/recommendations/**").permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/competitions/**")).permitAll()
                        .requestMatchers(AntPathRequestMatcher.antMatcher("/api/competitions/**")).permitAll()
                        .requestMatchers(HttpMethod.GET, "/payments/config").permitAll()
                        .requestMatchers("/assistant/**").permitAll()
                        // Fan-only routes (Phase 1+ endpoints under /fan/**)
                        .requestMatchers("/fan/**").hasRole("FAN_USER")
                        // Business owner dashboard (Phase 1+ endpoints under /owner/**)
                        .requestMatchers("/owner/**").hasAnyRole("BUSINESS_OWNER", "ADMIN")
                        // Business / café management (legacy /cafes until Phase 1 migration)
                        .requestMatchers(HttpMethod.POST, "/cafes").hasAnyRole("BUSINESS_OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/cafes/**").hasAnyRole("BUSINESS_OWNER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/cafes/**").hasAnyRole("BUSINESS_OWNER", "ADMIN")
                        // Admin platform
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/users").hasRole("ADMIN")
                        // Shared authenticated routes
                        .requestMatchers("/notifications/**").hasAnyRole("FAN_USER", "BUSINESS_OWNER", "ADMIN")
                        .requestMatchers("/reservations/**").hasAnyRole("FAN_USER", "BUSINESS_OWNER", "ADMIN")
                        .requestMatchers("/users/**").hasAnyRole("FAN_USER", "BUSINESS_OWNER", "ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}