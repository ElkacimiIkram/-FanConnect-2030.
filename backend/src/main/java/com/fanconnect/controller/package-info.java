/**
 * Presentation layer — REST API endpoints (the front door of the backend).
 *
 * <p><b>Role:</b> Receives HTTP requests, validates incoming DTOs with {@code @Valid},
 * delegates to a service interface, and returns a uniform {@code ApiResponse<T>} envelope.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code AuthController} — register / login</li>
 *   <li>{@code CafeController} — café CRUD and public listing</li>
 *   <li>{@code ReservationController} — booking management</li>
 *   <li>{@code UserController} — current user profile</li>
 *   <li>{@code HealthController} — API health check</li>
 * </ul>
 *
 * <p><b>Layer rule:</b> Controllers must stay thin — no database access, no business rules.
 * They only talk to {@code service} interfaces, never to repositories or entities directly.
 */
package com.fanconnect.controller;