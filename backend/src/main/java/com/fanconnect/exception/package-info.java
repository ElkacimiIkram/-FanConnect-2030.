/**
 * Exception layer — domain errors and centralized HTTP error handling.
 *
 * <p><b>Role:</b> Replaces scattered try/catch blocks with a clean exception hierarchy.
 * Services throw typed exceptions; {@code GlobalExceptionHandler} catches them and converts
 * each to the correct HTTP status + {@code ApiResponse} JSON body.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code ApiException} / {@code ErrorCode} — base types and error taxonomy</li>
 *   <li>{@code ResourceNotFoundException} — 404 when an entity ID does not exist</li>
 *   <li>{@code BusinessException} — 400 when a business rule is violated</li>
 *   <li>{@code UnauthorizedException} — 401 access denied</li>
 *   <li>{@code ForbiddenException} — 403 insufficient permissions</li>
 *   <li>{@code GlobalExceptionHandler} — {@code @RestControllerAdvice} mapping exceptions to HTTP</li>
 * </ul>
 */
package com.fanconnect.exception;