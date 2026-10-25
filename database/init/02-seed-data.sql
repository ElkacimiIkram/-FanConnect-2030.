-- FanConnect 2030 - Seed Data (Development Only)

INSERT INTO cafes (name, description, address, city, capacity, active, image_url)
VALUES
    ('Green Leaf Café', 'Organic coffee and fresh pastries in a cozy atmosphere.', '123 Main Street', 'Casablanca', 40, TRUE, NULL),
    ('Urban Brew House', 'Modern café with specialty espresso and workspace areas.', '45 Boulevard Zerktouni', 'Casablanca', 60, TRUE, NULL),
    ('Sunset Terrace', 'Rooftop café with panoramic city views.', '8 Avenue des FAR', 'Rabat', 30, TRUE, NULL)
ON CONFLICT DO NOTHING;