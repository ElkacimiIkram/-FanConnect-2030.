-- Phase 1: Business domain (cafés & restaurants)

CREATE TABLE IF NOT EXISTS businesses (
    id                  BIGSERIAL PRIMARY KEY,
    owner_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name                VARCHAR(150) NOT NULL,
    business_type       VARCHAR(20) NOT NULL DEFAULT 'CAFE',
    description         VARCHAR(1000) NOT NULL DEFAULT '',
    country             VARCHAR(100) NOT NULL DEFAULT 'Morocco',
    city                VARCHAR(100) NOT NULL,
    address             VARCHAR(255) NOT NULL,
    latitude            DECIMAL(10, 7),
    longitude           DECIMAL(10, 7),
    google_maps_url     VARCHAR(500),
    contact_phone       VARCHAR(20),
    contact_email       VARCHAR(100),
    total_capacity      INTEGER NOT NULL,
    total_tables        INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    rejection_reason    VARCHAR(500),
    cover_image_url     VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at         TIMESTAMPTZ,
    approved_by         BIGINT REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS business_spaces (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name                VARCHAR(100) NOT NULL,
    space_type          VARCHAR(30) NOT NULL,
    description         VARCHAR(500),
    capacity            INTEGER NOT NULL,
    number_of_tables    INTEGER NOT NULL,
    match_day_price     DECIMAL(10, 2) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_tables (
    id                  BIGSERIAL PRIMARY KEY,
    space_id            BIGINT NOT NULL REFERENCES business_spaces(id) ON DELETE CASCADE,
    table_number        VARCHAR(20) NOT NULL,
    capacity            INTEGER NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_images (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    image_url           VARCHAR(500) NOT NULL,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_images (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    image_url           VARCHAR(500) NOT NULL,
    sort_order          INTEGER NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS business_approvals (
    id                  BIGSERIAL PRIMARY KEY,
    business_id         BIGINT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    reviewed_by         BIGINT REFERENCES users(id),
    status              VARCHAR(20) NOT NULL,
    rejection_reason    VARCHAR(500),
    admin_notes         VARCHAR(500),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at         TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS notifications (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                VARCHAR(40) NOT NULL,
    title               VARCHAR(200) NOT NULL,
    message             VARCHAR(1000) NOT NULL,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    entity_type         VARCHAR(50),
    entity_id           BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_status_city ON businesses(status, city);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_business_spaces_business ON business_spaces(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Bootstrap admin if ApplicationRunner has not run yet (needed for owner_id FK)
INSERT INTO users (email, password, first_name, last_name, role, enabled)
SELECT
    'admin@fanconnect.com',
    '$2b$10$w3BLUl0MyAhyR0TCXW7XvehFc77w.E1mw7DqzhSGwOSfsy6Pd25z.',
    'System',
    'Admin',
    'ADMIN',
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');

-- Migrate legacy seed cafés as approved platform businesses (system owner = first admin)
INSERT INTO businesses (
    owner_id, name, business_type, description, country, city, address,
    total_capacity, total_tables, status, cover_image_url, approved_at
)
SELECT
    (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id LIMIT 1),
    c.name,
    'CAFE',
    c.description,
    'Morocco',
    c.city,
    c.address,
    c.capacity,
    GREATEST(c.capacity / 4, 1),
    'APPROVED',
    c.image_url,
    NOW()
FROM cafes c
WHERE c.active = TRUE
  AND NOT EXISTS (SELECT 1 FROM businesses b WHERE b.name = c.name AND b.city = c.city);