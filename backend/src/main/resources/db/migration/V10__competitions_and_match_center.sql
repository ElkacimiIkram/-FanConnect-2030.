-- Competitions catalog (admin-managed) + extended match data for Match Center

CREATE TABLE IF NOT EXISTS competitions (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    category        VARCHAR(30) NOT NULL,
    season          VARCHAR(20),
    description     VARCHAR(500),
    logo_url        VARCHAR(500),
    external_code   VARCHAR(20),
    external_source VARCHAR(30) DEFAULT 'FOOTBALL_DATA_ORG',
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS competition_id BIGINT REFERENCES competitions(id) ON DELETE SET NULL;
ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS group_name VARCHAR(50);
ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS round_label VARCHAR(100);
ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS home_score INTEGER;
ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS away_score INTEGER;
ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS match_minute INTEGER;
ALTER TABLE football_matches ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_football_matches_competition ON football_matches(competition_id);
CREATE INDEX IF NOT EXISTS idx_football_matches_group ON football_matches(group_name);
CREATE INDEX IF NOT EXISTS idx_football_matches_status_date ON football_matches(status, match_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_football_matches_external_id ON football_matches(external_id) WHERE external_id IS NOT NULL;

INSERT INTO competitions (name, slug, category, season, description, external_code, active, start_date, end_date)
VALUES
('Coupe du Monde FIFA 2026', 'world-cup-2026', 'WORLD_CUP', '2026',
 'Coupe du Monde aux États-Unis, Canada et Mexique.', 'WC', TRUE, '2026-06-11T00:00:00Z', '2026-07-19T23:59:59Z'),
('Coupe du Monde FIFA 2030', 'world-cup-2030', 'WORLD_CUP', '2030',
 'Coupe du Monde 2030 — Maroc, Espagne et Portugal.', NULL, TRUE, '2030-06-01T00:00:00Z', '2030-07-31T23:59:59Z'),
('UEFA Champions League', 'champions-league', 'CHAMPIONS_LEAGUE', '2025/26',
 'Ligue des champions européenne.', 'CL', TRUE, '2025-09-01T00:00:00Z', '2026-06-30T23:59:59Z'),
('CAN — Coupe d''Afrique des Nations', 'caf-africa-cup', 'CAF', '2025',
 'Compétition continentale africaine.', NULL, TRUE, '2025-12-01T00:00:00Z', '2026-01-31T23:59:59Z'),
('Matchs amicaux internationaux', 'international-friendlies', 'FRIENDLY', '2026',
 'Rencontres de préparation entre sélections.', NULL, TRUE, NULL, NULL)
ON CONFLICT (slug) DO NOTHING;

UPDATE football_matches fm
SET competition_id = c.id
FROM competitions c
WHERE fm.competition_id IS NULL
  AND (
    (LOWER(fm.competition) LIKE '%world cup%' AND c.slug = 'world-cup-2026')
    OR ((LOWER(fm.competition) LIKE '%can%' OR LOWER(fm.competition) LIKE '%africa cup%') AND c.slug = 'caf-africa-cup')
    OR (LOWER(fm.competition) LIKE '%friendly%' AND c.slug = 'international-friendlies')
  );

INSERT INTO football_matches (
    competition, competition_id, group_name, round_label,
    home_team, away_team, match_date, venue_name, city, status,
    home_score, away_score, external_id
)
SELECT
    'Coupe du Monde FIFA 2026', c.id, g.group_name, g.round_label,
    g.home_team, g.away_team, g.match_date::timestamptz, g.venue_name, g.city, g.status,
    g.home_score, g.away_score, g.external_id
FROM competitions c,
(VALUES
    ('Groupe A', 'Phase de groupes', 'Mexique', 'Afrique du Sud', '2026-06-11 19:00:00+00', 'Estadio Azteca', 'Mexico City', 'SCHEDULED', NULL::integer, NULL::integer, 'wc2026-a1'),
    ('Groupe A', 'Phase de groupes', 'Maroc', 'Croatie', '2026-06-12 16:00:00+00', 'SoFi Stadium', 'Los Angeles', 'SCHEDULED', NULL::integer, NULL::integer, 'wc2026-a2'),
    ('Groupe A', 'Phase de groupes', 'Maroc', 'Mexique', '2026-06-18 20:00:00+00', 'SoFi Stadium', 'Los Angeles', 'SCHEDULED', NULL::integer, NULL::integer, 'wc2026-a3'),
    ('Groupe B', 'Phase de groupes', 'Canada', 'Qatar', '2026-06-12 19:00:00+00', 'BC Place', 'Vancouver', 'SCHEDULED', NULL::integer, NULL::integer, 'wc2026-b1'),
    ('Groupe B', 'Phase de groupes', 'France', 'Sénégal', '2026-06-13 18:00:00+00', 'MetLife Stadium', 'New York', 'SCHEDULED', NULL::integer, NULL::integer, 'wc2026-b2'),
    ('Groupe C', 'Phase de groupes', 'Brésil', 'Serbie', '2026-06-23 20:00:00+00', 'Hard Rock Stadium', 'Miami', 'LIVE', 1, 0, 'wc2026-c1'),
    ('Groupe C', 'Phase de groupes', 'Argentine', 'Pologne', '2026-06-22 18:00:00+00', 'AT&T Stadium', 'Dallas', 'FINISHED', 2, 1, 'wc2026-c0')
) AS g(group_name, round_label, home_team, away_team, match_date, venue_name, city, status, home_score, away_score, external_id)
WHERE c.slug = 'world-cup-2026'
  AND NOT EXISTS (SELECT 1 FROM football_matches fm WHERE fm.external_id = g.external_id);

INSERT INTO football_matches (
    competition, competition_id, round_label,
    home_team, away_team, match_date, venue_name, city, status, external_id
)
SELECT
    'UEFA Champions League', c.id, 'Huitièmes de finale',
    m.home_team, m.away_team, m.match_date::timestamptz, m.venue_name, m.city, 'SCHEDULED', m.external_id
FROM competitions c,
(VALUES
    ('Real Madrid', 'Manchester City', '2026-03-12 20:00:00+00', 'Santiago Bernabéu', 'Madrid', 'cl-2026-1'),
    ('Paris SG', 'Bayern Munich', '2026-03-12 20:00:00+00', 'Parc des Princes', 'Paris', 'cl-2026-2'),
    ('Barcelona', 'Inter Milan', '2026-03-19 20:00:00+00', 'Camp Nou', 'Barcelona', 'cl-2026-3')
) AS m(home_team, away_team, match_date, venue_name, city, external_id)
WHERE c.slug = 'champions-league'
  AND NOT EXISTS (SELECT 1 FROM football_matches fm WHERE fm.external_id = m.external_id);

INSERT INTO football_matches (
    competition, competition_id, group_name, round_label,
    home_team, away_team, match_date, venue_name, city, status, external_id
)
SELECT
    'Coupe du Monde FIFA 2030', c.id, 'Groupe A', 'Phase de groupes',
    'Maroc', 'Espagne', '2030-06-15 20:00:00+00', 'Grand Stade de Casablanca', 'Casablanca', 'SCHEDULED', 'wc2030-a1'
FROM competitions c
WHERE c.slug = 'world-cup-2030'
  AND NOT EXISTS (SELECT 1 FROM football_matches fm WHERE fm.external_id = 'wc2030-a1');