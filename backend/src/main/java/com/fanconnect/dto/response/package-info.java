/**
 * Response DTOs — data the API sends back to the client.
 *
 * <p><b>Role:</b> Exposes only the fields the frontend needs. Built by mappers from
 * JPA entities and wrapped inside {@code ApiResponse<T>} for a consistent JSON envelope:
 * {@code { success, message, data, timestamp }}.
 *
 * <p><b>Contains:</b> ApiResponse, AuthResponse, UserResponse, CafeResponse, ReservationResponse.
 */
package com.fanconnect.dto.response;