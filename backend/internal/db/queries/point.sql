-- name: CreatePoint :exec
INSERT INTO points (id, event_id, x, y, title, timeline_description, start_at, end_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8);

-- name: GetPointByID :one
SELECT
    id, event_id, x, y, title, timeline_description, start_at, end_at
FROM points
WHERE id = $1;

-- name: GetPointsByEvent :many
SELECT
    id, event_id, x, y, title, timeline_description, start_at, end_at
FROM points
WHERE event_id = $1
ORDER BY y, x;

-- name: UpdatePoint :exec
UPDATE points
SET
    x = $2,
    y = $3,
    title = $4,
    timeline_description = $5,
    start_at = $6,
    end_at = $7
WHERE id = $1;

-- name: RemoveTimelineFromPoint :exec
UPDATE points
SET 
    timeline_description = NULL, 
    start_at = NULL, 
    end_at = NULL
WHERE id = $1;

-- name: DeletePoint :exec
DELETE FROM points
WHERE id = $1;