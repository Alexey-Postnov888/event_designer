package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	auth "github.com/Alexy-Postnov888/event_designer/backend/internal/auth"
	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	middleware "github.com/Alexy-Postnov888/event_designer/backend/internal/middleware"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/models"
	"github.com/google/uuid"
)

// @Summary Создать мероприятие
// @Description Создает новое мероприятие. Доступно только администраторам.
// @Tags Events
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   event body models.CreateEventRequest true "Данные для создания мероприятия"
// @Success 201 {object} map[string]interface{} "Успешное создание, возвращает ID и имя"
// @Failure 400 {string} string "Invalid JSON / Name is required"
// @Failure 500 {string} string "Authentication context missing / Failed to create event"
// @Router /admin/events [post]
func (h *AuthHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req models.CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Name is required", http.StatusBadRequest)
		return
	}

	claims, ok := r.Context().Value(middleware.UserClaimsKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Authentication context missing", http.StatusInternalServerError)
		return
	}
	creatorEmail := claims.Email

	eventID := uuid.New()

	err := h.db.CreateEvent(r.Context(), db.CreateEventParams{
		ID:   eventID,
		Name: req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
		Address: sql.NullString{
			String: req.Address,
			Valid:  req.Address != "",
		},
		StartsAt: sql.NullTime{
			Time:  req.StartsAt,
			Valid: true,
		},
		EndsAt: sql.NullTime{
			Time:  req.EndsAt,
			Valid: true,
		},
		CreatorEmail: creatorEmail,
	})

	if err != nil {
		http.Error(w, "Failed to create event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":   eventID.String(),
		"name": req.Name,
	})
}

// @Summary Получить мероприятие по ID
// @Description Получает детальную информацию о мероприятии. Доступно создателю мероприятия и участникам, чьи email разрешены.
// @Tags Events
// @Security ApiKeyAuth
// @Produce  json
// @Param event_id path string true "ID мероприятия (UUID)"
// @Success 200 {object} models.EventResponse "Полная информация о мероприятии"
// @Failure 400 {string} string "Invalid event ID format"
// @Failure 403 {string} string "Access denied for this event"
// @Failure 404 {string} string "Event not found"
// @Failure 500 {string} string "Database error"
// @Router /events/{event_id} [get]
func (h *AuthHandler) GetEventByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	eventIDStr := r.PathValue("event_id")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event ID format", http.StatusBadRequest)
		return
	}

	claims, ok := r.Context().Value(middleware.UserClaimsKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Authentication context missing", http.StatusInternalServerError)
		return
	}

	userEmail := claims.Email

	event, err := h.db.GetEventByID(r.Context(), eventID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Event not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	isCreator := event.CreatorEmail == userEmail

	allowedInEmails, err := h.db.IsEmailAllowedForEvent(r.Context(), db.IsEmailAllowedForEventParams{
		EventID: eventID,
		Email:   userEmail,
	})

	if err != nil {
		http.Error(w, "Database error during access check", http.StatusInternalServerError)
		return
	}

	if !isCreator && !allowedInEmails {
		http.Error(w, "Access denied for this event", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// @Summary Обновить информацию о мероприятии
// @Description Обновляет поля мероприятия. Используется метод PATCH, можно передавать только те поля, которые нужно изменить.
// @Tags Events
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   update body models.UpdateEventRequest true "Поля для обновления мероприятия"
// @Success 200 {object} map[string]string "Мероприятие успешно обновлено"
// @Failure 400 {string} string "Invalid JSON / Event ID required / Invalid event ID format"
// @Failure 404 {string} string "Event not found"
// @Failure 500 {string} string "Database error / Failed to update event"
// @Router /admin/events [patch]
func (h *AuthHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.UpdateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.EventID == "" {
		http.Error(w, "Event ID required in body", http.StatusBadRequest)
		return
	}

	eventID, err := uuid.Parse(req.EventID)
	if err != nil {
		http.Error(w, "Invalid event ID format", http.StatusBadRequest)
		return
	}

	currentEvent, err := h.db.GetEventByID(r.Context(), eventID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Event not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	params := db.UpdateEventParams{
		ID:          eventID,
		Name:        currentEvent.Name,
		Description: currentEvent.Description,
		Address:     currentEvent.Address,
		StartsAt:    currentEvent.StartsAt,
		EndsAt:      currentEvent.EndsAt,
	}
	if req.Name != nil {
		params.Name = *req.Name
	}
	if req.Description != nil {
		params.Description = sql.NullString{
			String: *req.Description,
			Valid:  *req.Description != "",
		}
	}
	if req.Address != nil {
		params.Address = sql.NullString{
			String: *req.Address,
			Valid:  *req.Address != "",
		}
	}
	if req.StartsAt != nil {
		params.StartsAt = sql.NullTime{Time: *req.StartsAt, Valid: true}
	}
	if req.EndsAt != nil {
		params.EndsAt = sql.NullTime{Time: *req.EndsAt, Valid: true}
	}

	err = h.db.UpdateEvent(r.Context(), params)
	if err != nil {
		http.Error(w, "Failed to update event", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Event updated successfully"})
}

// @Summary Удалить мероприятие
// @Description Удаляет мероприятие по его ID. Доступно только администраторам.
// @Tags Events
// @Security ApiKeyAuth
// @Param eventID path string true "ID мероприятия (UUID)"
// @Success 204 "Мероприятие успешно удалено (No Content)"
// @Failure 400 {string} string "Invalid event ID format in URL"
// @Failure 404 {string} string "Event not found"
// @Failure 500 {string} string "Failed to delete event"
// @Router /admin/events/{eventID} [delete]
func (h *AuthHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.PathValue("eventID")

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event ID format in URL", http.StatusBadRequest)
		return
	}

	err = h.db.DeleteEvent(r.Context(), eventID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Event not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to delete event: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary Получить список мероприятий
// @Description Получает список мероприятий. Для администраторов - все созданные ими мероприятия и мероприятия на которые они добавлены. Для участников - мероприятия, на которые их email разрешен.
// @Tags Events
// @Security ApiKeyAuth
// @Produce  json
// @Success 200 {array} models.ListEventResponse "Список мероприятий"
// @Failure 500 {string} string "Authentication context missing / Failed to retrieve events"
// @Router /events [get]
func (h *AuthHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	claims, ok := r.Context().Value(middleware.UserClaimsKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Authentication context missing", http.StatusInternalServerError)
		return
	}

	userEmail := claims.Email
	userRole := claims.Role

	var eventsResponse []db.ListEventsByAdminRow
	var err error

	if userRole == "admin" {
		eventsResponse, err = h.db.ListEventsByAdmin(r.Context(), userEmail)
	} else {
		observerEvents, dbErr := h.db.ListEventsByObserver(r.Context(), userEmail)
		err = dbErr

		if err == nil {
			eventsResponse = make([]db.ListEventsByAdminRow, len(observerEvents))
			for i, event := range observerEvents {
				eventsResponse[i] = db.ListEventsByAdminRow(event)
			}
		}
	}

	if err != nil {
		http.Error(w, "Failed to retrieve events", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(eventsResponse)
}

// @Summary Добавить разрешенный email
// @Description Добавляет email в список разрешенных участников для данного мероприятия.
// @Tags Events
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   allowedEmail body models.AllowedEmailRequest true "ID мероприятия и Email для добавления"
// @Success 204 "Email успешно добавлен (No Content)"
// @Failure 400 {string} string "Invalid JSON / Required fields missing / Invalid event ID format"
// @Failure 404 {string} string "Event not found"
// @Failure 500 {string} string "Database error / Failed to add allowed email"
// @Router /admin/events/allowed-emails [post]
func (h *AuthHandler) AddAllowedEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AllowedEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.EventID == "" || req.Email == "" {
		http.Error(w, "Event ID and Email are required in body", http.StatusBadRequest)
		return
	}

	eventID, err := uuid.Parse(req.EventID)
	if err != nil {
		http.Error(w, "Invalid event ID format", http.StatusBadRequest)
		return
	}

	_, err = h.db.GetEventByID(r.Context(), eventID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Event not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}

	err = h.db.AddAllowedEmail(r.Context(), db.AddAllowedEmailParams{
		EventID: eventID,
		Email:   req.Email,
	})
	if err != nil {
		http.Error(w, "Failed to add allowed email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// @Summary Удалить разрешенный email
// @Description Удаляет email из списка разрешенных участников для данного мероприятия.
// @Tags Events
// @Security ApiKeyAuth
// @Accept  json
// @Produce  json
// @Param   allowedEmail body models.AllowedEmailRequest true "ID мероприятия и Email для удаления"
// @Success 204 "Email успешно удален (No Content)"
// @Failure 400 {string} string "Invalid JSON / Required fields missing / Invalid event ID format"
// @Failure 500 {string} string "Failed to delete allowed email or email/event not found"
// @Router /admin/events/allowed-emails [delete]
func (h *AuthHandler) DeleteAllowedEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.AllowedEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if req.EventID == "" || req.Email == "" {
		http.Error(w, "Event ID and Email are required in body", http.StatusBadRequest)
		return
	}

	eventID, err := uuid.Parse(req.EventID)
	if err != nil {
		http.Error(w, "Invalid event ID format", http.StatusBadRequest)
		return
	}

	err = h.db.DeleteAllowedEmail(r.Context(), db.DeleteAllowedEmailParams{
		EventID: eventID,
		Email:   req.Email,
	})

	if err != nil {
		http.Error(w, "Failed to delete allowed email or email/event not found", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
