-- Approximate city centers for geo search when owner did not set GPS coordinates

UPDATE businesses SET latitude = 33.5731, longitude = -7.5898
WHERE latitude IS NULL AND LOWER(city) LIKE '%casablanca%';

UPDATE businesses SET latitude = 34.0209, longitude = -6.8416
WHERE latitude IS NULL AND LOWER(city) LIKE '%rabat%';

UPDATE businesses SET latitude = 31.6295, longitude = -7.9811
WHERE latitude IS NULL AND LOWER(city) LIKE '%marrakech%';

UPDATE businesses SET latitude = 34.2610, longitude = -6.5802
WHERE latitude IS NULL AND LOWER(city) LIKE '%meknes%';

UPDATE businesses SET latitude = 34.7406, longitude = -1.1240
WHERE latitude IS NULL AND LOWER(city) LIKE '%oujda%';

UPDATE businesses SET latitude = 35.7595, longitude = -5.8340
WHERE latitude IS NULL AND LOWER(city) LIKE '%tanger%' OR LOWER(city) LIKE '%tangier%';

UPDATE businesses SET latitude = 35.1688, longitude = -2.9286
WHERE latitude IS NULL AND LOWER(city) LIKE '%nador%';

UPDATE businesses SET latitude = 33.2549, longitude = -8.5060
WHERE latitude IS NULL AND LOWER(city) LIKE '%el jadida%' OR LOWER(city) LIKE '%jadida%';

UPDATE businesses SET latitude = 32.2994, longitude = -9.2372
WHERE latitude IS NULL AND LOWER(city) LIKE '%safi%';

UPDATE businesses SET latitude = 30.4278, longitude = -9.5981
WHERE latitude IS NULL AND LOWER(city) LIKE '%agadir%';

UPDATE businesses SET latitude = 33.8935, longitude = -5.5473
WHERE latitude IS NULL AND LOWER(city) LIKE '%fes%' OR LOWER(city) LIKE '%fès%';