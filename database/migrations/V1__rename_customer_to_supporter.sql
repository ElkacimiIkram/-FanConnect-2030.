-- Migrate legacy CUSTOMER role to SUPPORTER
UPDATE users SET role = 'SUPPORTER' WHERE role = 'CUSTOMER';