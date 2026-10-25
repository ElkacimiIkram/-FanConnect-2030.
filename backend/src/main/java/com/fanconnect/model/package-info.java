/**
 * Domain model — persistent data representation.
 *
 * <p><b>Role:</b> Groups everything that describes <em>what data exists</em> in the system,
 * separate from <em>how it is transported</em> (DTOs) or <em>how it is accessed</em> (repositories).
 *
 * <p>Sub-packages:
 * <ul>
 *   <li>{@link com.fanconnect.model.entity} — JPA/Hibernate entity classes mapped to PostgreSQL tables</li>
 *   <li>{@link com.fanconnect.model.enums} — fixed-value enumerations (roles, statuses)</li>
 * </ul>
 */
package com.fanconnect.model;