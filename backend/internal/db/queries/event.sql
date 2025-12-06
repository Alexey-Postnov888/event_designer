-- name: CreateEvent :exec
INSERT INTO events (id, name, description, address, starts_at, ends_at, creator_email) 
VALUES ($1, $2, $3, $4, $5, $6, $7);

-- name: GetEventByID :one
SELECT id, name, description, address, starts_at, ends_at, creator_email FROM events WHERE id = $1;

-- name: UpdateEvent :exec
UPDATE events SET name = $2, description = $3, address = $4, starts_at = $5, ends_at = $6 WHERE id = $1;

-- name: DeleteEvent :exec
DELETE FROM events WHERE id = $1;

-- name: ListEventsByObserver :many
SELECT 
    t1.id, t1.name, t1.description, t1.address, t1.starts_at, t1.ends_at
FROM events t1
JOIN event_allowed_emails t2 ON t1.id = t2.event_id
WHERE t2.email = $1
ORDER BY t1.starts_at DESC;

-- name: ListEventsByAdmin :many
SELECT DISTINCT 
    t1.id, t1.name, t1.description, t1.address, t1.starts_at, t1.ends_at
FROM events t1
LEFT JOIN event_allowed_emails t2 ON t1.id = t2.event_id
WHERE t1.creator_email = $1 OR t2.email = $1
ORDER BY t1.starts_at DESC;

-- name: AddAllowedEmail :exec
INSERT INTO event_allowed_emails (event_id, email) VALUES ($1, $2) ON CONFLICT (event_id, email) DO NOTHING;

-- name: DeleteAllowedEmail :exec
DELETE FROM event_allowed_emails WHERE event_id = $1 AND email = $2;