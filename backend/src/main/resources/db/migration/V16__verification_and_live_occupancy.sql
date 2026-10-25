-- Business verification documents, live occupancy, snapshots, CHECKED_IN status

ALTER TABLE businesses
    ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS verification_complete BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS verification_documents (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    owner_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type       VARCHAR(30) NOT NULL,
    storage_key         VARCHAR(500) NOT NULL,
    original_name       VARCHAR(255),
    mime_type           VARCHAR(100),
    file_size_bytes     BIGINT,
    status              VARCHAR(20) NOT NULL DEFAULT 'UPLOADED',
    rejection_note      VARCHAR(500),
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ,
    reviewed_by         BIGINT REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_verification_docs_business ON verification_documents(business_id);
CREATE INDEX IF NOT EXISTS idx_verification_docs_type ON verification_documents(business_id, document_type);

CREATE TABLE IF NOT EXISTS business_live_occupancy (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    match_id            BIGINT REFERENCES football_matches(id) ON DELETE SET NULL,
    current_customers   INTEGER NOT NULL CHECK (current_customers >= 0),
    available_seats     INTEGER,
    occupancy_percent   DECIMAL(5, 2),
    reported_by         BIGINT NOT NULL REFERENCES users(id),
    reported_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source              VARCHAR(20) NOT NULL DEFAULT 'OWNER_MANUAL'
);

CREATE INDEX IF NOT EXISTS idx_live_occ_business_match
    ON business_live_occupancy(business_id, match_id, reported_at DESC);

CREATE TABLE IF NOT EXISTS occupancy_snapshots (
    id                          BIGSERIAL PRIMARY KEY,
    business_id                 BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    match_id                    BIGINT REFERENCES football_matches(id) ON DELETE SET NULL,
    snapshot_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    capacity                    INTEGER NOT NULL,
    owner_reported_count        INTEGER,
    checked_in_seats            INTEGER NOT NULL DEFAULT 0,
    confirmed_not_arrived       INTEGER NOT NULL DEFAULT 0,
    pending_reservations        INTEGER NOT NULL DEFAULT 0,
    effective_occupancy         INTEGER NOT NULL,
    occupancy_percent           DECIMAL(5, 2) NOT NULL,
    level                       VARCHAR(10) NOT NULL,
    day_of_week                 SMALLINT,
    hour_of_day                 SMALLINT
);

CREATE INDEX IF NOT EXISTS idx_occ_snapshots_business_time
    ON occupancy_snapshots(business_id, snapshot_at DESC);

-- Migrate legacy check-in status
UPDATE reservations SET status = 'CHECKED_IN' WHERE status = 'COMPLETED';

-- Grandfather already-approved partner venues
UPDATE businesses SET verification_complete = TRUE WHERE status = 'APPROVED';