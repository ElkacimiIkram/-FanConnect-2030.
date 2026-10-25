/**
 * Mapper layer — converts between entities and DTOs.
 *
 * <p><b>Role:</b> Single-responsibility translation between the persistence model
 * ({@link com.fanconnect.model.entity}) and the API model ({@link com.fanconnect.dto}).
 * Keeps mapping logic out of services and controllers.
 *
 * <p><b>Contains:</b> UserMapper, CafeMapper, ReservationMapper.
 *
 * <p><b>Layer rule:</b> Mappers are stateless {@code @Component} classes. They know
 * about entities and DTOs but never touch repositories or HTTP.
 */
package com.fanconnect.mapper;