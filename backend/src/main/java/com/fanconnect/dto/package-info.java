/**
 * Data Transfer Object layer — API contracts for request and response payloads.
 *
 * <p><b>Role:</b> Decouples the public REST API from internal JPA entities.
 * The client sends and receives DTOs; entities never leave the server boundary.
 * This protects sensitive fields (e.g. passwords) and gives API stability.
 *
 * <p>Split into two sub-packages:
 * <ul>
 *   <li>{@link com.fanconnect.dto.request} — incoming data validated with Jakarta Bean Validation</li>
 *   <li>{@link com.fanconnect.dto.response} — outgoing data shaped for the frontend</li>
 * </ul>
 */
package com.fanconnect.dto;