/**
 * Request DTOs — data the client sends to the API.
 *
 * <p><b>Role:</b> Defines the shape and validation rules for incoming HTTP request bodies
 * and query parameters. Annotated with {@code @NotBlank}, {@code @Email}, {@code @Future}, etc.
 * Controllers apply {@code @Valid} to trigger automatic validation before the service is called.
 *
 * <p><b>Contains:</b> LoginRequest, RegisterRequest, CafeRequest, UpdateCafeRequest,
 * ReservationRequest, UpdateUserRequest.
 */
package com.fanconnect.dto.request;