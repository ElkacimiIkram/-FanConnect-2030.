/**
 * Persistence layer — Spring Data JPA repository interfaces.
 *
 * <p><b>Role:</b> Abstracts all database access. Each repository maps to one
 * {@link com.fanconnect.model.entity entity} and provides CRUD plus custom query methods.
 * Hibernate generates the SQL at runtime — no raw JDBC here.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code UserRepository} — find by email, check existence</li>
 *   <li>{@code CafeRepository} — list active cafés</li>
 *   <li>{@code ReservationRepository} — find by user, ordered by date</li>
 * </ul>
 *
 * <p><b>Layer rule:</b> Repositories return entities only. They are called exclusively
 * from the service layer, never from controllers.
 */
package com.fanconnect.repository;