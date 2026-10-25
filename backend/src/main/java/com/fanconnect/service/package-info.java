/**
 * Business layer — service contracts (interfaces).
 *
 * <p><b>Role:</b> Defines <em>what</em> the application can do, without exposing
 * <em>how</em> it is done. Controllers depend on these interfaces (Dependency Inversion).
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code AuthService} — registration and authentication</li>
 *   <li>{@code CafeService} — café lifecycle and queries</li>
 *   <li>{@code ReservationService} — booking creation, listing, cancellation</li>
 *   <li>{@code UserService} — profile read and update</li>
 * </ul>
 *
 * <p>Concrete implementations live in {@link com.fanconnect.service.impl}.
 *
 * <p><b>Layer rule:</b> Services orchestrate repositories, mappers, and security utilities.
 * They own {@code @Transactional} boundaries and business rule enforcement.
 */
package com.fanconnect.service;