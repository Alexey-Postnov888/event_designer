package models

// Запрос на логин для админа
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Запрос кода доступа
type RequestCodeRequest struct {
	Email string `json:"email"`
}

// Подтверждение кода
type VerifyCodeRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
}

// Структура для ответа пользователю
type UserResponse struct {
	ID             int    `json:"id"`
	Name           string `json:"name,omitempty"`
	Email          string `json:"email"`
	TypeOfActivity string `json:"type_of_activity,omitempty"`
	Role           string `json:"role"`
}

// Ответ после авторизации
type AuthResponse struct {
	User    *UserResponse `json:"user"`
	Token   string        `json:"token"`
	Message string        `json:"message"`
}
