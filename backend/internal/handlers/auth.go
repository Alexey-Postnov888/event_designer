package handlers

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"math/big"
	"mime/multipart"
	"net/http"
	"time"

	auth "github.com/Alexy-Postnov888/event_designer/backend/internal/auth"
	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/models"
	"github.com/google/uuid"
)

type StorageService interface {
	Upload(ctx context.Context, file multipart.File, filename string) (publicURL string, storagePath string, err error)
	Delete(ctx context.Context, storagePath string) error
}

type AuthHandler struct {
	db             db.Querier
	StorageService StorageService
}

func NewAuthHandler(dbQuerier db.Querier, storageService StorageService) *AuthHandler {
	return &AuthHandler{
		db:             dbQuerier,
		StorageService: storageService,
	}
}

// @Summary Вход администратора
// @Description Обрабатывает вход администратора по почте и паролю. Возвращает JWT-токен с ролью "admin".
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   loginRequest body models.LoginRequest true "Учетные данные администратора"
// @Success 200 {object} models.AuthResponse "Успешный вход, возвращает токен"
// @Failure 400 {string} string "Invalid JSON"
// @Failure 401 {string} string "Invalid email or password / Only admins can log in with password"
// @Failure 500 {string} string "Database error / Failed to generate token"
// @Router /auth/login [post]
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

	token, err := auth.GenerateToken(int(userRow.ID), userRow.Email, userRow.Role, auth.AdminTokenExpiry)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
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
		Token:   token,
		Message: "Login successful",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// @Summary Запрос кода доступа
// @Description Отправляет одноразовый код потверждения на email для входа на мероприятие. Требуется, чтобы email был разрешен для EventID.
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   requestCode body models.RequestCodeRequest true "Event ID и Email участника"
// @Success 200 {object} map[string]string "Код успешно сгенерирован и отправлен"
// @Failure 400 {string} string "Invalid JSON / Required fields missing / Invalid event_id format"
// @Failure 403 {string} string "Email not allowed for this event"
// @Failure 500 {string} string "Database error / Failed to generate code / Failed to save code"
// @Router /auth/request-code [post]
func (h *AuthHandler) RequestCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.RequestCodeRequest
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
		http.Error(w, "Invalid event_id format (must be UUID)", http.StatusBadRequest)
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

	code, err := generateSecureRandomCode()
	if err != nil {
		http.Error(w, "Failed to generate code", http.StatusInternalServerError)
		return
	}

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
		"code":    code,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func generateSecureRandomCode() (string, error) {
	const digits = "0123456789"
	const codeLength = 6

	code := make([]byte, codeLength)
	for i := range code {
		num, err := rand.Int(rand.Reader, big.NewInt(int64(len(digits))))
		if err != nil {
			return "", err
		}
		code[i] = digits[num.Int64()]
	}
	return string(code), nil
}

// @Summary Подтверждение кода и вход участника
// @Description Потверждает код доступа, предоставленный по email. При успешной проверке возвращает JWT-токен для доступа к ресурсам мероприятия. Если пользователь не существует, он будет создан как "observer".
// @Tags Auth
// @Accept  json
// @Produce  json
// @Param   verifyCode body models.VerifyCodeRequest true "Event ID, Email и полученный код доступа"
// @Success 200 {object} models.AuthResponse "Успешная аутентификация, возвращает токен"
// @Failure 400 {string} string "Invalid JSON / Required fields missing / Invalid event_id format"
// @Failure 401 {string} string "Invalid or expired code"
// @Failure 403 {string} string "Email not allowed for this event"
// @Failure 500 {string} string "Database error / Failed to generate token"
// @Router /auth/verify-code [post]
func (h *AuthHandler) VerifyCode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.VerifyCodeRequest
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
		http.Error(w, "Invalid event_id format", http.StatusBadRequest)
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

	token, err := auth.GenerateToken(int(userRow.ID), userRow.Email, userRow.Role, auth.EventTokenExpiry)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	resp := models.AuthResponse{
		User: &models.UserResponse{
			ID:    int(userRow.ID),
			Email: userRow.Email,
			Role:  userRow.Role,
		},
		Token:   token,
		Message: fmt.Sprintf("Access to event granted as %s", userRow.Role),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
