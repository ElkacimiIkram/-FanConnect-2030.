/**
 * Configuration layer — wires cross-cutting infrastructure beans.
 *
 * <p><b>Role:</b> Centralizes Spring {@code @Configuration} classes that the framework
 * needs at startup. No business logic belongs here.
 *
 * <p><b>Contains:</b>
 * <ul>
 *   <li>{@code SecurityConfig} — HTTP security rules, JWT filter chain, password encoder</li>
 *   <li>{@code CorsConfig} — allowed origins for the React frontend</li>
 *   <li>{@code OpenApiConfig} — Swagger / OpenAPI documentation setup</li>
 *   <li>{@code JwtProperties} — typed binding of {@code app.jwt.*} from application.yml</li>
 *   <li>{@code JpaAuditingConfig} — enables automatic {@code createdAt}/{@code updatedAt}</li>
 *   <li>{@code DatabaseConfig} — enables JPA repositories and {@code @Transactional}</li>
 * </ul>
 *
 * <p><b>Layer rule:</b> Config may depend on security and util packages, but never on controllers or services.
 */
package com.fanconnect.config;