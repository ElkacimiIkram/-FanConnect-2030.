/**
 * Business layer — service implementations.
 *
 * <p><b>Role:</b> Contains the concrete {@code @Service} classes that implement
 * the contracts defined in {@link com.fanconnect.service}. This is where business
 * rules, validation beyond DTO constraints, and transaction management live.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code AuthServiceImpl}</li>
 *   <li>{@code CafeServiceImpl}</li>
 *   <li>{@code ReservationServiceImpl}</li>
 *   <li>{@code UserServiceImpl}</li>
 * </ul>
 *
 * <p><b>Layer rule:</b> Implementations may use repositories, mappers, and security
 * components. They must never import controllers or expose JPA entities to the outside world.
 */
package com.fanconnect.service.impl;