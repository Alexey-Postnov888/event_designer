package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/models"
	"github.com/google/uuid"
)

// @Summary Загрузить или обновить карту мероприятия
// @Description Загружает новый файл карты или заменяет существующий для мероприятия.
// @Tags Maps
// @Security ApiKeyAuth
// @Accept  multipart/form-data
// @Produce  json
// @Param event_id formData string true "ID мероприятия (UUID)"
// @Param map_file formData file true "Файл карты (изображение)"
// @Success 201 "Карта успешно создана (StatusCreated)"
// @Success 204 "Карта успешно обновлена (No Content)"
// @Failure 400 {string} string "Invalid event ID format / Missing form data"
// @Failure 500 {string} string "Failed to upload file / Failed to create/update event map in DB"
// @Router /admin/events/map [put]
func (h *AuthHandler) UpdateEventMap(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20)
	eventIDStr := r.FormValue("event_id")
	eventID, err := uuid.Parse(eventIDStr)

	file, handler, err := r.FormFile("map_file")
	if err != nil {
		return
	}
	defer file.Close()

	var oldStoragePath string
	oldMap, err := h.db.GetEventMapDetails(r.Context(), eventID)
	if err == nil {
		oldStoragePath = oldMap.MapStoragePath
	}
	publicURL, storagePath, err := h.StorageService.Upload(r.Context(), file, handler.Filename)
	if err != nil {
		return
	}

	err = h.db.CreateOrUpdateEventMap(r.Context(), db.CreateOrUpdateEventMapParams{
		EventID:        eventID,
		MapUrl:         publicURL,
		MapStoragePath: storagePath,
	})

	if err != nil {
		h.StorageService.Delete(r.Context(), storagePath)
		http.Error(w, "Failed to create/update event map in DB: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if oldStoragePath != "" {
		if err := h.StorageService.Delete(r.Context(), oldStoragePath); err != nil {
			log.Printf("Warning: Failed to delete old file %s from storage: %v", oldStoragePath, err)
		}
	}

	if oldStoragePath == "" {
		w.WriteHeader(http.StatusCreated)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}

// @Summary Получить карту мероприятия
// @Description Возвращает URL общедоступной карты мероприятия.
// @Tags Maps
// @Security ApiKeyAuth
// @Produce  json
// @Param eventID path string true "ID мероприятия (UUID)"
// @Success 200 {object} models.MapResponse "URL карты"
// @Failure 400 {string} string "Invalid event ID format in URL"
// @Failure 404 {string} string "Event map not found."
// @Failure 500 {string} string "Failed to fetch event map"
// @Router /events/{eventID}/map [get]
func (h *AuthHandler) GetEventMap(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.PathValue("eventID")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event ID format in URL", http.StatusBadRequest)
		return
	}

	mapDetails, err := h.db.GetEventMapDetails(r.Context(), eventID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Event map not found.", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to fetch event map: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := models.MapResponse{
		MapUrl: mapDetails.MapUrl,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// @Summary Удалить карту мероприятия
// @Description Удаляет карту мероприятия и соответствующий файл из хранилища.
// @Tags Maps
// @Security ApiKeyAuth
// @Param eventID path string true "ID мероприятия (UUID)"
// @Success 204 "Карта успешно удалена (No Content)"
// @Failure 400 {string} string "Invalid event ID format in URL"
// @Failure 404 {string} string "Event map not found."
// @Failure 500 {string} string "Failed to delete event map"
// @Router /admin/events/{eventID}/map [delete]
func (h *AuthHandler) DeleteEventMap(w http.ResponseWriter, r *http.Request) {
	eventIDStr := r.PathValue("eventID")
	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event ID format in URL", http.StatusBadRequest)
		return
	}

	storagePath, err := h.db.DeleteEventMap(r.Context(), eventID)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Event map not found.", http.StatusNotFound)
			return
		}
		http.Error(w, "Failed to delete event map: "+err.Error(), http.StatusInternalServerError)
		return
	}

	log.Printf("File to delete from storage: %s\n", storagePath)

	w.WriteHeader(http.StatusNoContent)
}
