-- Remove demo/fake matches — keep only API-synced data going forward

UPDATE reservations
SET match_id = NULL
WHERE match_id IN (
    SELECT id FROM football_matches
    WHERE external_id IS NULL
       OR external_id LIKE 'wc2026-%'
       OR external_id LIKE 'cl-2026-%'
       OR external_id LIKE 'wc2030-%'
       OR (last_synced_at IS NULL AND external_id IS NOT NULL AND external_id !~ '^[0-9]+$')
);

DELETE FROM football_matches
WHERE external_id IS NULL
   OR external_id LIKE 'wc2026-%'
   OR external_id LIKE 'cl-2026-%'
   OR external_id LIKE 'wc2030-%'
   OR (last_synced_at IS NULL AND external_id IS NOT NULL AND external_id !~ '^[0-9]+$');

-- Deactivate competitions without a live API source
UPDATE competitions SET active = FALSE WHERE slug IN ('world-cup-2030', 'caf-africa-cup', 'international-friendlies');

-- Ensure top competitions have football-data.org codes
UPDATE competitions SET external_code = 'WC', external_source = 'FOOTBALL_DATA_ORG', active = TRUE
WHERE slug = 'world-cup-2026' AND (external_code IS NULL OR external_code = '');

UPDATE competitions SET external_code = 'CL', external_source = 'FOOTBALL_DATA_ORG', active = TRUE
WHERE slug = 'champions-league' AND (external_code IS NULL OR external_code = '');

-- Add major leagues with real-time data (football-data.org v4 codes)
INSERT INTO competitions (name, slug, category, season, description, external_code, external_source, active, start_date, end_date)
VALUES
('Premier League', 'premier-league', 'LEAGUE', '2025/26',
 'Championnat d''Angleterre.', 'PL', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('La Liga', 'la-liga', 'LEAGUE', '2025/26',
 'Championnat d''Espagne.', 'PD', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Serie A', 'serie-a', 'LEAGUE', '2025/26',
 'Championnat d''Italie.', 'SA', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Bundesliga', 'bundesliga', 'LEAGUE', '2025/26',
 'Championnat d''Allemagne.', 'BL1', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Ligue 1', 'ligue-1', 'LEAGUE', '2025/26',
 'Championnat de France.', 'FL1', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z')
ON CONFLICT (slug) DO UPDATE SET
    external_code = EXCLUDED.external_code,
    external_source = EXCLUDED.external_source,
    active = EXCLUDED.active,
    season = EXCLUDED.season,
    description = EXCLUDED.description;