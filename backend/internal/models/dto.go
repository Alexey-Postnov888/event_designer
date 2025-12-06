package models

import (
	"time"

	"github.com/google/uuid"
)

// LoginRequest - Запрос на логин для админа
type LoginRequest struct {
	// Email пользователя
	Email string `json:"email" example:"admin@example.com"`
	// Пароль пользователя
	Password string `json:"password" example:"admin_hash_secure"`
}

// RequestCodeRequest - Запрос кода доступа
type RequestCodeRequest struct {
	// Email пользователя, запрашивающего код
	Email string `json:"email" example:"observer1@example.com"`
	// ID мероприятия, к которому запрашивается доступ
	EventID string `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
}

// VerifyCodeRequest - Подтверждение кода
type VerifyCodeRequest struct {
	// Email пользователя
	Email string `json:"email" example:"observer1@example.com"`
	// Одноразовый код, полученный по почте
	Code string `json:"code" example:"123456"`
	// ID мероприятия
	EventID string `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
}

// CreateEventRequest - Создание мероприятия
type CreateEventRequest struct {
	// Название мероприятия
	Name string `json:"name" example:"Ежегодная конференция IT"`
	// Описание мероприятия
	Description string `json:"description,omitempty" example:"Крупнейшее событие года в сфере технологий."`
	// Адрес проведения
	Address string `json:"address" example:"Ул. Программистов, 15"`
	// Время начала мероприятия
	StartsAt time.Time `json:"starts_at" example:"2025-12-01T10:00:00Z"`
	// Время окончания мероприятия
	EndsAt time.Time `json:"ends_at" example:"2025-12-01T18:00:00Z"`
}

// UpdateEventRequest - Обновление мероприятия
type UpdateEventRequest struct {
	// ID мероприятия для обновления
	EventID string `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// Новое название мероприятия
	Name *string `json:"name,omitempty" example:"Обновленное название конференции"`
	// Новое описание мероприятия
	Description *string `json:"description,omitempty" example:"Новое описание события."`
	// Новый адрес
	Address *string `json:"address,omitempty" example:"Санкт-Петербург, Экспоцентр"`
	// Новое время начала
	StartsAt *time.Time `json:"starts_at,omitempty" example:"2025-12-01T10:00:00Z"`
	// Новое время окончания
	EndsAt *time.Time `json:"ends_at,omitempty" example:"2025-12-01T19:00:00Z"`
}

// EventIDRequest - Используется для получения и удаления мероприятия
type EventIDRequest struct {
	// ID мероприятия
	EventID string `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
}

// AllowedEmailRequest - Используется для добавления и удаления разрешенных почт
type AllowedEmailRequest struct {
	// ID мероприятия
	EventID string `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// Email для добавления/удаления
	Email string `json:"email" example:"new.participant@example.com"`
}

// UserResponse - Структура для ответа пользователю после получения данных
type UserResponse struct {
	// ID пользователя
	ID int `json:"id" example:"1"`
	// Имя пользователя
	Name string `json:"name,omitempty" example:"Главный Администратор"`
	// Email пользователя
	Email string `json:"email" example:"admin@example.com"`
	// Тип деятельности
	TypeOfActivity string `json:"type_of_activity,omitempty" example:"IT"`
	// Роль пользователя (например, "admin" или "observer")
	Role string `json:"role" example:"admin"`
}

// AuthResponse - Ответ после авторизации
type AuthResponse struct {
	// Детали пользователя
	User *UserResponse `json:"user"`
	// JWT токен для последующих запросов
	Token string `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	// Сообщение о статусе авторизации
	Message string `json:"message" example:"Authentication successful"`
}

// MapResponse - Структура для ответа, содержащая публичный URL карты
type MapResponse struct {
	// Публичный URL карты мероприятия
	MapUrl string `json:"map_url" example:"http://localhost:8080/static/maps/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11_map.jpg"`
}

// PointRequest - Структура для создания или обновления точки
type PointRequest struct {
	// ID точки (обязательно для обновления)
	ID *uuid.UUID `json:"id,omitempty" example:"11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// ID мероприятия, к которому относится точка
	EventID uuid.UUID `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// Координата X на карте
	X *int32 `json:"x" example:"50"`
	// Координата Y на карте
	Y *int32 `json:"y" example:"100"`
	// Заголовок точки
	Title *string `json:"title" example:"Стойка регистрации"`

	// Поля Таймлайна
	// Описание события в таймлайне
	TimelineDescription *string `json:"timeline_description,omitempty" example:"Регистрация участников и утренний кофе."`
	// Время начала события
	StartAt *time.Time `json:"start_at,omitempty" example:"2025-12-01T09:00:00Z"`
	// Время окончания события
	EndAt *time.Time `json:"end_at,omitempty" example:"2025-12-01T10:00:00Z"`
}
