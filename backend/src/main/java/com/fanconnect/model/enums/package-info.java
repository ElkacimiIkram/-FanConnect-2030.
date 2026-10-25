/**
 * Domain model — enumerated types shared across entities, DTOs, and services.
 *
 * <p><b>Role:</b> Defines fixed sets of allowed values stored as strings in PostgreSQL
 * via {@code @Enumerated(EnumType.STRING)}. Keeps magic strings out of business logic.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code Role} — FAN_USER, BUSINESS_OWNER, ADMIN</li>
 *   <li>{@code ReservationStatus} — PENDING, CONFIRMED, CANCELLED, COMPLETED</li>
 * </ul>
 */
package com.fanconnect.model.enums;