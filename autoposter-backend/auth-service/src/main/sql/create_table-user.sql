CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(255),
    phone        VARCHAR(20),
    email        VARCHAR(320) UNIQUE NOT NULL,
    other_details TEXT,
    created_at   TIMESTAMP,
    updated_at   TIMESTAMP
);
