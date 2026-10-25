/**
 * Domain model — JPA entities (maps Java objects to PostgreSQL tables).
 *
 * <p><b>Role:</b> Represents the persistent data structure of the application.
 * Each {@code @Entity} class corresponds to one database table. Hibernate uses
 * these classes to read and write rows via JDBC.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code BaseEntity} — shared {@code id}, {@code createdAt}, {@code updatedAt}</li>
 *   <li>{@code User} — accounts, roles, credentials</li>
 *   <li>{@code Cafe} — venue listings with capacity</li>
 *   <li>{@code Reservation} — bookings linking a user to a café</li>
 * </ul>
 *
 * <p><b>Layer rule:</b> Entities are internal to the backend. They must never be
 * returned directly from controllers — always convert to a DTO via a mapper first.
 */
package com.fanconnect.model.entity;