package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/models"
	"github.com/google/uuid"
)

// @Summary Создать простую точку
// @Description Создает новую точку на карте (без привязки к таймлайну). Требуется EventID, X, Y и Title.
// @Tags Points
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   point body models.SimplePointRequest true "Данные точки (X, Y, Title, EventID)"
// @Success 201 {object} map[string]interface{} "Успешное создание, возвращает ID"
// @Failure 400 {string} string "Invalid request body / Required fields missing"
// @Failure 403 {string} string "Forbidden: Cannot use timeline data"
// @Failure 500 {string} string "Failed to create simple point"
// @Router /admin/events/points/simple [post]
func (h *AuthHandler) CreateSimplePoint(w http.ResponseWriter, r *http.Request) {
	var req models.PointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.StartAt != nil || req.TimelineDescription != nil || req.EndAt != nil {
		http.Error(w, "Cannot create Simple Point with timeline data. Use /v1/points/timeline.", http.StatusForbidden)
		return
	}

	if req.X == nil || req.Y == nil || req.Title == nil {
		http.Error(w, "Fields X, Y, and Title are required for Simple Point creation.", http.StatusBadRequest)
		return
	}

	pointID := uuid.New()

	err := h.db.CreatePoint(r.Context(), db.CreatePointParams{
		ID:                  pointID,
		EventID:             req.EventID,
		X:                   *req.X,
		Y:                   *req.Y,
		Title:               *req.Title,
		TimelineDescription: sql.NullString{},
		StartAt:             sql.NullTime{},
		EndAt:               sql.NullTime{},
	})
	if err != nil {
		http.Error(w, "Failed to create simple point: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": pointID})
}

// @Summary Создать точку таймлайна
// @Description Создает новую точку на карте с привязкой к таймлайну (StartAt, EndAt, Description). Требуются все поля.
// @Tags Points
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   point body models.PointRequest true "Данные точки (EventID, X, Y, Title, StartAt, EndAt, TimelineDescription)"
// @Success 201 {object} map[string]interface{} "Успешное создание, возвращает ID"
// @Failure 400 {string} string "Invalid request body / All timeline fields are required"
// @Failure 500 {string} string "Failed to create timeline point"
// @Router /admin/events/points/timeline [post]
func (h *AuthHandler) CreateTimelinePoint(w http.ResponseWriter, r *http.Request) {
	var req models.PointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.StartAt == nil || req.TimelineDescription == nil || req.EndAt == nil || req.X == nil || req.Y == nil || req.Title == nil {
		http.Error(w, "Timeline creation requires start_at, end_at, timeline_description, X, Y, and Title.", http.StatusBadRequest)
		return
	}

	pointID := uuid.New()

	err := h.db.CreatePoint(r.Context(), db.CreatePointParams{
		ID:                  pointID,
		EventID:             req.EventID,
		X:                   *req.X,
		Y:                   *req.Y,
		Title:               *req.Title,
		TimelineDescription: toNullString(req.TimelineDescription),
		StartAt:             toNullTime(req.StartAt),
		EndAt:               toNullTime(req.EndAt),
	})
	if err != nil {
		http.Error(w, "Failed to create timeline point: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"id": pointID})
}

// @Summary Обновить простую точку
// @Description Обновляет координаты и/или заголовок существующей простой точки.
// @Tags Points
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   point body models.SimplePointRequest true "ID точки и поля для обновления (ID required)"
// @Success 200 "Точка успешно обновлена"
// @Failure 400 {string} string "Invalid request body / Point ID must be provided"
// @Failure 403 {string} string "Forbidden: Cannot update Timeline Point using Simple Point endpoint / Cannot add timeline data"
// @Failure 404 {string} string "Point not found"
// @Failure 500 {string} string "Failed to update simple point"
// @Router /admin/events/points/simple [patch]
func (h *AuthHandler) UpdateSimplePoint(w http.ResponseWriter, r *http.Request) {
	var req models.PointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.ID == nil {
		http.Error(w, "Point ID must be provided in the request body.", http.StatusBadRequest)
		return
	}
	pointID := *req.ID

	currentPoint, err := h.db.GetPointByID(r.Context(), pointID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Point not found or DB error: %v", err), http.StatusNotFound)
		return
	}

	if isTimelinePoint(currentPoint.StartAt) {
		http.Error(w, "Cannot update Timeline Point using Simple Point endpoint.", http.StatusForbidden)
		return
	}

	if req.StartAt != nil || req.TimelineDescription != nil || req.EndAt != nil {
		http.Error(w, "Cannot convert Simple Point to Timeline Point via update.", http.StatusForbidden)
		return
	}

	newX := currentPoint.X
	if req.X != nil {
		newX = *req.X
	}

	newY := currentPoint.Y
	if req.Y != nil {
		newY = *req.Y
	}

	var finalTitle string

	if req.Title != nil {
		finalTitle = *req.Title
	} else {
		finalTitle = currentPoint.Title
	}

	err = h.db.UpdatePoint(r.Context(), db.UpdatePointParams{
		ID:                  pointID,
		X:                   newX,
		Y:                   newY,
		Title:               finalTitle,
		TimelineDescription: sql.NullString{},
		StartAt:             sql.NullTime{},
		EndAt:               sql.NullTime{},
	})
	if err != nil {
		http.Error(w, "Failed to update simple point: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// @Summary Обновить точку таймлайна
// @Description Обновляет существующую точку таймлайна. Требуется предоставление всех полей таймлайна для обновления.
// @Tags Points
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   point body models.PointRequest true "ID точки и полные данные таймлайна (ID, StartAt, EndAt, Description required)"
// @Success 200 "Точка успешно обновлена"
// @Failure 400 {string} string "Invalid request body / Required fields missing"
// @Failure 403 {string} string "Forbidden: Cannot update Simple Point using Timeline Point endpoint"
// @Failure 404 {string} string "Point not found"
// @Failure 500 {string} string "Failed to update timeline point"
// @Router /admin/events/points/timeline [patch]
func (h *AuthHandler) UpdateTimelinePoint(w http.ResponseWriter, r *http.Request) {
	var req models.PointRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.ID == nil {
		http.Error(w, "Point ID must be provided in the request body.", http.StatusBadRequest)
		return
	}
	pointID := *req.ID

	currentPoint, err := h.db.GetPointByID(r.Context(), pointID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Point not found or DB error: %v", err), http.StatusNotFound)
		return
	}

	if !isTimelinePoint(currentPoint.StartAt) {
		http.Error(w, "Cannot update Simple Point using Timeline Point endpoint.", http.StatusForbidden)
		return
	}

	newX := currentPoint.X
	if req.X != nil {
		newX = *req.X
	}

	newY := currentPoint.Y
	if req.Y != nil {
		newY = *req.Y
	}

	finalTitle := currentPoint.Title
	if req.Title != nil {
		finalTitle = *req.Title
	}

	newTimelineDescription := currentPoint.TimelineDescription
	newStartAt := currentPoint.StartAt
	newEndAt := currentPoint.EndAt

	if req.TimelineDescription != nil {
		newTimelineDescription = toNullString(req.TimelineDescription)
	}

	if req.StartAt != nil {
		newStartAt = toNullTime(req.StartAt)
	}

	if req.EndAt != nil {
		newEndAt = toNullTime(req.EndAt)
	}

	err = h.db.UpdatePoint(r.Context(), db.UpdatePointParams{
		ID:                  pointID,
		X:                   newX,
		Y:                   newY,
		Title:               finalTitle,
		TimelineDescription: newTimelineDescription,
		StartAt:             newStartAt,
		EndAt:               newEndAt,
	})
	if err != nil {
		http.Error(w, "Failed to update timeline point: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

// @Summary Получить все точки по ID мероприятия
// @Description Возвращает список всех простых точек и точек таймлайна для указанного мероприятия.
// @Tags Points
// @Security ApiKeyAuth
// @Produce  json
// @Param eventID path string true "ID мероприятия (UUID)"
// @Success 200 {array} models.PointResponse "Список точек"
// @Failure 400 {string} string "Invalid event ID"
// @Failure 500 {string} string "Failed to fetch points"
// @Router /events/{eventID}/points [get]
func (h *AuthHandler) GetPointsByEvent(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.PathValue("eventID")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event ID", http.StatusBadRequest)
		return
	}

	points, err := h.db.GetPointsByEvent(r.Context(), eventID)
	if err != nil {
		http.Error(w, "Failed to fetch points: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(points)
}

// @Summary Удалить точку
// @Description Удаляет простую точку или точку таймлайна по ее ID.
// @Tags Points
// @Security ApiKeyAuth
// @Param eventID path string true "ID мероприятия (UUID)"
// @Param pointID path string true "ID точки (UUID)"
// @Success 204 "Точка успешно удалена (No Content)"
// @Failure 400 {string} string "Invalid ID format in URL"
// @Failure 500 {string} string "Failed to delete point"
// @Router /admin/events/{eventID}/points/{pointID} [delete]
func (h *AuthHandler) DeletePoint(w http.ResponseWriter, r *http.Request) {
	// ИСПРАВЛЕНИЕ: Извлекаем eventID (для контекста) и pointID (для удаления)
	eventIDStr := r.PathValue("eventID")
	if _, err := uuid.Parse(eventIDStr); err != nil {
		http.Error(w, "Invalid event ID format in URL", http.StatusBadRequest)
		return
	}

	pointIDStr := r.PathValue("pointID")
	pointID, err := uuid.Parse(pointIDStr)
	if err != nil {
		http.Error(w, "Invalid point ID format in URL", http.StatusBadRequest)
		return
	}

	err = h.db.DeletePoint(r.Context(), pointID)
	if err != nil {
		http.Error(w, "Failed to delete point: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func isTimelinePoint(startAt sql.NullTime) bool {
	return startAt.Valid
}

func toNullString(s *string) sql.NullString {
	if s == nil {
		return sql.NullString{}
	}
	return sql.NullString{String: *s, Valid: true}
}

func toNullTime(t *time.Time) sql.NullTime {
	if t == nil {
		return sql.NullTime{}
	}
	return sql.NullTime{Time: *t, Valid: true}
}
