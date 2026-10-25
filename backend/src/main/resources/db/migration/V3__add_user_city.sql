-- Phase 0: fan profile city (registration field)

ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);