-- Legacy manual migration (superseded by Flyway backend/src/main/resources/db/migration/)
-- Kept for reference when applying SQL outside Spring Boot.

UPDATE users SET role = 'FAN_USER' WHERE role IN ('SUPPORTER', 'CUSTOMER');
UPDATE users SET role = 'BUSINESS_OWNER' WHERE role = 'CAFE_OWNER';
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'FAN_USER';