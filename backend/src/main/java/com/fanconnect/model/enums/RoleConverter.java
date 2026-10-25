package com.fanconnect.model.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Reads legacy role values (SUPPORTER, CAFE_OWNER) until Flyway migration is applied.
 */
@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        return role == null ? null : role.name();
    }

    @Override
    public Role convertToEntityAttribute(String dbValue) {
        return Role.fromLegacy(dbValue);
    }
}