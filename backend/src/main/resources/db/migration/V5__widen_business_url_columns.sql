-- Google Maps and image CDN URLs can exceed 500 characters

ALTER TABLE businesses
    ALTER COLUMN google_maps_url TYPE VARCHAR(2048),
    ALTER COLUMN cover_image_url TYPE VARCHAR(2048);

ALTER TABLE business_images
    ALTER COLUMN image_url TYPE VARCHAR(2048);

ALTER TABLE menu_images
    ALTER COLUMN image_url TYPE VARCHAR(2048);