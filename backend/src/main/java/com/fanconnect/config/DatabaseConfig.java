package com.fanconnect.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Database configuration.
 * <p>
 * The PostgreSQL {@link javax.sql.DataSource} and HikariCP pool are auto-configured
 * by Spring Boot from {@code spring.datasource.*} in application.yml.
 * This class enables JPA repositories and declarative transactions.
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.fanconnect.repository")
@EnableTransactionManagement
public class DatabaseConfig {
}