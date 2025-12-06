-- name: CreateOrUpdateEventMap :exec
INSERT INTO event_maps (event_id, map_url, map_storage_path) 
VALUES ($1, $2, $3)
ON CONFLICT (event_id) DO UPDATE SET
    map_url = EXCLUDED.map_url,
    map_storage_path = EXCLUDED.map_storage_path,
    updated_at = now();

-- name: GetEventMapDetails :one
SELECT event_id, map_url, map_storage_path FROM event_maps WHERE event_id = $1;

-- name: DeleteEventMap :one
DELETE FROM event_maps WHERE event_id = $1 RETURNING map_storage_path;