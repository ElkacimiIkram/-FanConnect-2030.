-- Match Center: FIFA World Cup 2026 & 2030 only — remove club competitions

UPDATE reservations
SET match_id = NULL
WHERE match_id IN (
    SELECT fm.id FROM football_matches fm
    LEFT JOIN competitions c ON fm.competition_id = c.id
    WHERE c.slug IS NULL
       OR c.slug NOT IN ('world-cup-2026', 'world-cup-2030')
);

DELETE FROM football_matches fm
USING competitions c
WHERE fm.competition_id = c.id
  AND c.slug NOT IN ('world-cup-2026', 'world-cup-2030');

DELETE FROM football_matches
WHERE competition_id IS NULL
  AND LOWER(competition) NOT LIKE '%world cup%'
  AND LOWER(competition) NOT LIKE '%coupe du monde%';

UPDATE competitions SET active = FALSE
WHERE slug NOT IN ('world-cup-2026', 'world-cup-2030');

UPDATE competitions
SET active = TRUE,
    external_code = 'WC',
    external_source = 'FOOTBALL_DATA_ORG',
    description = 'Coupe du Monde FIFA 2026 — États-Unis, Canada et Mexique. Qualifications et phase finale.',
    logo_url = 'https://upload.wikimedia.org/wikipedia/en/6/6e/FIFA_World_Cup_2026_Logo.svg'
WHERE slug = 'world-cup-2026';

UPDATE competitions
SET active = TRUE,
    external_code = NULL,
    external_source = NULL,
    description = 'Coupe du Monde FIFA 2030 — Maroc, Espagne et Portugal. Matchs de démonstration en attendant les données officielles.',
    logo_url = NULL
WHERE slug = 'world-cup-2030';

INSERT INTO football_matches (
    competition, competition_id, group_name, round_label,
    home_team, away_team, match_date, venue_name, city, status
)
SELECT
    'Coupe du Monde FIFA 2030',
    c.id,
    'Groupe A',
    'Phase de groupes — Journée 1',
    'Maroc',
    'Espagne',
    '2030-06-15T20:00:00Z',
    'Stade Mohammed V',
    'Casablanca',
    'SCHEDULED'
FROM competitions c
WHERE c.slug = 'world-cup-2030'
  AND NOT EXISTS (
      SELECT 1 FROM football_matches m
      WHERE m.competition_id = c.id AND m.home_team = 'Maroc' AND m.away_team = 'Espagne'
  );

INSERT INTO football_matches (
    competition, competition_id, group_name, round_label,
    home_team, away_team, match_date, venue_name, city, status
)
SELECT
    'Coupe du Monde FIFA 2030',
    c.id,
    'Groupe A',
    'Phase de groupes — Journée 1',
    'Portugal',
    'Argentine',
    '2030-06-16T17:00:00Z',
    'Stade Ibn Batouta',
    'Tanger',
    'SCHEDULED'
FROM competitions c
WHERE c.slug = 'world-cup-2030'
  AND NOT EXISTS (
      SELECT 1 FROM football_matches m
      WHERE m.competition_id = c.id AND m.home_team = 'Portugal' AND m.away_team = 'Argentine'
  );

INSERT INTO football_matches (
    competition, competition_id, group_name, round_label,
    home_team, away_team, match_date, venue_name, city, status
)
SELECT
    'Coupe du Monde FIFA 2030',
    c.id,
    'Demi-finale',
    'Phase à élimination directe',
    'Maroc',
    'Brésil',
    '2030-07-14T21:00:00Z',
    'Stade de la Cartuja',
    'Séville',
    'SCHEDULED'
FROM competitions c
WHERE c.slug = 'world-cup-2030'
  AND NOT EXISTS (
      SELECT 1 FROM football_matches m
      WHERE m.competition_id = c.id AND m.home_team = 'Maroc' AND m.away_team = 'Brésil'
  );