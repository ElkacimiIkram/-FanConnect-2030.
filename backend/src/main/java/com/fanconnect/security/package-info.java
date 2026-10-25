/**
 * Security layer — JWT authentication and user identity resolution.
 *
 * <p><b>Role:</b> Answers two questions on every request: <em>who is calling?</em> and
 * <em>is their token valid?</em> Works alongside {@link com.fanconnect.config.SecurityConfig}
 * which answers <em>are they allowed to access this URL?</em>
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code JwtService} — create, parse, and validate JWT tokens</li>
 *   <li>{@code JwtAuthenticationFilter} — intercepts requests, reads Bearer token, sets SecurityContext</li>
 *   <li>{@code CustomUserDetailsService} — loads user from DB for Spring Security</li>
 * </ul>
 *
 * <p><b>Flow:</b> Login → JwtService signs token → client stores it → every request carries
 * {@code Authorization: Bearer <token>} → filter validates → controller executes.
 */
package com.fanconnect.security;