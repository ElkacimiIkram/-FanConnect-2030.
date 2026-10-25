-- Remove any remaining manually-seeded or stale matches not tied to live API sync

UPDATE reservations SET match_id = NULL
WHERE match_id IN (SELECT id FROM football_matches WHERE last_synced_at IS NULL);

DELETE FROM football_matches WHERE last_synced_at IS NULL;