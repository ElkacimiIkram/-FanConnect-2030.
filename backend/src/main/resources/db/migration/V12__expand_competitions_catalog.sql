INSERT INTO competitions (name, slug, category, season, description, external_code, external_source, active, start_date, end_date)
VALUES
('Ligue 2', 'ligue-2', 'LEAGUE', '2025/26', 'Deuxième division française.', 'FL2', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Championship', 'championship', 'LEAGUE', '2025/26', 'D2 anglaise.', 'ELC', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Primeira Liga', 'primeira-liga', 'LEAGUE', '2025/26', 'Championnat du Portugal.', 'PPL', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Eredivisie', 'eredivisie', 'LEAGUE', '2025/26', 'Championnat des Pays-Bas.', 'DED', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Scottish Premiership', 'scottish-premiership', 'LEAGUE', '2025/26', 'Championnat d''Écosse.', 'SPL', 'FOOTBALL_DATA_ORG', TRUE, '2025-08-01T00:00:00Z', '2026-05-31T23:59:59Z'),
('Brasileiro Série A', 'brasileiro-serie-a', 'LEAGUE', '2025', 'Championnat du Brésil.', 'BSA', 'FOOTBALL_DATA_ORG', TRUE, '2025-04-01T00:00:00Z', '2025-12-31T23:59:59Z'),
('UEFA Euro', 'uefa-euro', 'CHAMPIONS_LEAGUE', '2024', 'Championnat d''Europe des nations.', 'EC', 'FOOTBALL_DATA_ORG', TRUE, '2024-06-01T00:00:00Z', '2024-07-31T23:59:59Z')
ON CONFLICT (slug) DO UPDATE SET
    external_code = EXCLUDED.external_code,
    external_source = EXCLUDED.external_source,
    active = EXCLUDED.active,
    season = EXCLUDED.season,
    description = EXCLUDED.description;