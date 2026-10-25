-- Phase 2: Match Center + business-linked reservations

CREATE TABLE IF NOT EXISTS football_matches (
    id              BIGSERIAL PRIMARY KEY,
    external_id     VARCHAR(50),
    competition     VARCHAR(100) NOT NULL,
    home_team       VARCHAR(100) NOT NULL,
    away_team       VARCHAR(100) NOT NULL,
    match_date      TIMESTAMPTZ NOT NULL,
    venue_name      VARCHAR(150),
    city            VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_football_matches_date ON football_matches (match_date);
CREATE INDEX IF NOT EXISTS idx_football_matches_status ON football_matches (status);

-- Extend reservations for business + match-day bookings (keep cafe_id for legacy)
ALTER TABLE reservations ALTER COLUMN cafe_id DROP NOT NULL;

ALTER TABLE reservations
    ADD COLUMN IF NOT EXISTS business_id BIGINT REFERENCES businesses(id),
    ADD COLUMN IF NOT EXISTS space_id BIGINT REFERENCES business_spaces(id),
    ADD COLUMN IF NOT EXISTS table_id BIGINT REFERENCES business_tables(id),
    ADD COLUMN IF NOT EXISTS match_id BIGINT REFERENCES football_matches(id),
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS ticket_code VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_reservations_business ON reservations (business_id);
CREATE INDEX IF NOT EXISTS idx_reservations_match ON reservations (match_id);
CREATE INDEX IF NOT EXISTS idx_reservations_table_match ON reservations (table_id, match_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reservation_table_match_active
    ON reservations (table_id, match_id)
    WHERE table_id IS NOT NULL
      AND match_id IS NOT NULL
      AND status IN ('PENDING', 'CONFIRMED');

-- Seed upcoming matches (2026 competitions)
INSERT INTO football_matches (competition, home_team, away_team, match_date, venue_name, city, status)
SELECT
    v.competition,
    v.home_team,
    v.away_team,
    v.match_date::timestamptz,
    v.venue_name,
    v.city,
    'SCHEDULED'
FROM (VALUES
    ('FIFA World Cup 2026', 'Morocco', 'Brazil', '2026-06-15 20:00:00+00', 'MetLife Stadium', 'New York'),
    ('FIFA World Cup 2026', 'France', 'Argentina', '2026-06-18 20:00:00+00', 'SoFi Stadium', 'Los Angeles'),
    ('CAF Africa Cup of Nations', 'Morocco', 'Senegal', '2026-07-05 19:00:00+00', 'Stade Mohammed V', 'Casablanca'),
    ('CAF Africa Cup of Nations', 'Egypt', 'Nigeria', '2026-07-08 19:00:00+00', 'Stade de Marrakech', 'Marrakech'),
    ('International Friendly', 'Morocco', 'Spain', '2026-08-20 18:00:00+00', 'Stade Moulay Abdellah', 'Rabat')
) AS v(competition, home_team, away_team, match_date, venue_name, city)
WHERE NOT EXISTS (SELECT 1 FROM football_matches LIMIT 1);