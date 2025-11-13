package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/models"
	"github.com/google/uuid"
)

type AuthHandler struct {
	db db.Querier
}

func NewAuthHandler(db db.Querier) *AuthHandler {
	return &AuthHandler{db: db}
}

// Обрабатываем вход администратора по почте и паролю
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	userRow, err := h.db.GetUserByEmail(context.Background(), req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if !userRow.Password.Valid || userRow.Password.String != req.Password {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	if userRow.Role != "admin" {
		http.Error(w, "Only admins can log in with password", http.StatusUnauthorized)
		return
	}

	resp := models.AuthResponse{
		User: &models.UserResponse{
			ID:             int(userRow.ID),
			Name:           userRow.Name.String,
			Email:          userRow.Email,
			TypeOfActivity: userRow.TypeOfActivity.String,
			Role:           userRow.Role,
		},
		Token:   "auth-token-" + userRow.Email,
		Message: "Login successful",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// Обрабатываем запрос на отправку кода потверждения для участии в мероприятии
func (h *AuthHandler) RequestCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	eventIDStr := r.URL.Query().Get("event_id")
	if eventIDStr == "" {
		http.Error(w, "Event ID required", http.StatusBadRequest)
		return
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event_id format (must be UUID)", http.StatusBadRequest)
		return
	}

	var req models.RequestCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	allowed, err := h.db.IsEmailAllowedForEvent(context.Background(), db.IsEmailAllowedForEventParams{
		EventID: eventID,
		Email:   req.Email,
	})
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if !allowed {
		http.Error(w, "Email not allowed for this event", http.StatusForbidden)
		return
	}

	code := "787878"
	expiresAt := time.Now().Add(10 * time.Minute)
	err = h.db.SaveVerificationCode(context.Background(), db.SaveVerificationCodeParams{
		Email:     req.Email,
		Code:      code,
		ExpiresAt: expiresAt,
	})
	if err != nil {
		http.Error(w, "Failed to save code", http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"message": "Code sent to email",
		"email":   req.Email,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Потверждаем код доступа и предоставляем аутентификацию для участника мероприятия
func (h *AuthHandler) VerifyCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	eventIDStr := r.URL.Query().Get("event_id")
	if eventIDStr == "" {
		http.Error(w, "Event ID required", http.StatusBadRequest)
		return
	}

	eventID, err := uuid.Parse(eventIDStr)
	if err != nil {
		http.Error(w, "Invalid event_id format", http.StatusBadRequest)
		return
	}

	var req models.VerifyCodeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	codeRow, err := h.db.GetVerificationCode(context.Background(), req.Email)
	if err != nil {
		http.Error(w, "Invalid or expired code", http.StatusUnauthorized)
		return
	}

	if codeRow.Code != req.Code || time.Now().After(codeRow.ExpiresAt) {
		http.Error(w, "Invalid or expired code", http.StatusUnauthorized)
		return
	}

	allowed, err := h.db.IsEmailAllowedForEvent(context.Background(), db.IsEmailAllowedForEventParams{
		EventID: eventID,
		Email:   req.Email,
	})
	if err != nil || !allowed {
		http.Error(w, "Email not allowed for this event", http.StatusForbidden)
		return
	}

	var userRow db.GetUserByEmailRow
	userFromDB, err := h.db.GetUserByEmail(context.Background(), req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			observerRow, err := h.db.CreateObserver(context.Background(), req.Email)
			if err != nil {
				http.Error(w, "Failed to create observer", http.StatusInternalServerError)
				return
			}
			userRow = db.GetUserByEmailRow{
				ID:    observerRow.ID,
				Email: observerRow.Email,
				Role:  observerRow.Role,
			}
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}
	} else {
		userRow = userFromDB
	}

	h.db.DeleteVerificationCode(context.Background(), req.Email)

	resp := models.AuthResponse{
		User: &models.UserResponse{
			ID:    int(userRow.ID),
			Email: userRow.Email,
			Role:  userRow.Role,
		},
		Token:   "event-token-" + userRow.Email,
		Message: fmt.Sprintf("Access to event granted as %s", userRow.Role),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
