-- name: GetUserByEmail :one
SELECT id, email, role, name, password, type_of_activity FROM users WHERE email = $1;

-- name: CreateObserver :one
INSERT INTO users (email, role) VALUES ($1, 'observer') RETURNING id, email, role, name, password, type_of_activity;

-- name: IsEmailAllowedForEvent :one
SELECT EXISTS (SELECT 1 FROM event_allowed_emails WHERE event_id = $1 AND email = $2);

-- name: SaveVerificationCode :exec
INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET code = $2, expires_at = $3;

-- name: GetVerificationCode :one
SELECT code, expires_at FROM verification_codes WHERE email = $1;

-- name: DeleteVerificationCode :exec
DELETE FROM verification_codes WHERE email = $1;

-- name: CreateEvent :exec
INSERT INTO events (id, name, description, starts_at, ends_at) VALUES ($1, $2, $3, $4, $5);

-- name: AddAllowedEmail :exec
INSERT INTO event_allowed_emails (event_id, email) VALUES ($1, $2) ON CONFLICT (event_id, email) DO NOTHING;

-- name: GetEventByID :one
SELECT id, name, description, starts_at, ends_at FROM events WHERE id = $1;

-- name: ListEvents :many
SELECT id, name, description, starts_at, ends_at FROM events ORDER BY starts_at DESC;

-- name: UpdateEvent :exec
UPDATE events
SET name = $2, description = $3, starts_at = $4, ends_at = $5 WHERE id = $1;

-- name: DeleteEvent :exec
DELETE FROM events WHERE id = $1;

-- name: DeleteAllowedEmail :exec
DELETE FROM event_allowed_emails WHERE event_id = $1 AND email = $2;