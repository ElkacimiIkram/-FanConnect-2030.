-- Phase 3: Payments, 25% platform commission, ticket settlement

CREATE TABLE IF NOT EXISTS payments (
    id                      BIGSERIAL PRIMARY KEY,
    reservation_id          BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    amount                  DECIMAL(10, 2) NOT NULL,
    platform_fee            DECIMAL(10, 2) NOT NULL,
    owner_payout            DECIMAL(10, 2) NOT NULL,
    currency                VARCHAR(3) NOT NULL DEFAULT 'MAD',
    status                  VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_method          VARCHAR(30),
    stripe_payment_intent_id VARCHAR(100),
    paid_at                 TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_reservation ON payments (reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);