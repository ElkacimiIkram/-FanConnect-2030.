-- Phase 4B: Ticket check-in at venue

ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_ticket_code
    ON reservations (ticket_code)
    WHERE ticket_code IS NOT NULL;