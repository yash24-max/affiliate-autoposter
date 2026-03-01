CREATE TABLE IF NOT EXISTS auth.user_credential (
    id                    BIGSERIAL PRIMARY KEY,
    user_id               BIGINT UNIQUE NOT NULL REFERENCES auth.users(id),
    email                 VARCHAR(320) UNIQUE NOT NULL,
    password              VARCHAR(255),
    is_enabled            BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token    VARCHAR(512),
    reset_token           VARCHAR(512),
    reset_token_expiry_at TIMESTAMP,
    created_at            TIMESTAMP,
    updated_at            TIMESTAMP
);
