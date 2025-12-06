package models

import (
	"time"

	"github.com/google/uuid"
)

// EventResponse — DTO для детальной информации о мероприятии.
type EventResponse struct {
	ID           uuid.UUID `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description,omitempty"`
	Address      string    `json:"address,omitempty"`
	StartsAt     time.Time `json:"starts_at"`
	EndsAt       time.Time `json:"ends_at"`
	CreatorEmail string    `json:"creator_email"`
}

// ListEventResponse — DTO для элемента в списке мероприятий.
type ListEventResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Address     string    `json:"address,omitempty"`
	StartsAt    time.Time `json:"starts_at"`
	EndsAt      time.Time `json:"ends_at"`
}

// PointResponse - Структура для ответа точки
type PointResponse struct {
	// ID точки
	ID uuid.UUID `json:"id" example:"11eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// ID мероприятия, к которому относится точка
	EventID uuid.UUID `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// Координата X на карте
	X int32 `json:"x" example:"50"`
	// Координата Y на карте
	Y int32 `json:"y" example:"100"`
	// Заголовок точки
	Title string `json:"title" example:"Стойка регистрации"`

	// Поля Таймлайна
	// Описание события в таймлайне
	TimelineDescription *string `json:"timeline_description,omitempty" example:"Регистрация участников и утренний кофе."`
	// Время начала события
	StartAt *time.Time `json:"start_at,omitempty" example:"2025-12-01T09:00:00Z"`
	// Время окончания события
	EndAt *time.Time `json:"end_at,omitempty" example:"2025-12-01T10:00:00Z"`
}

// PointRequest - Структура для создания или обновления точки
type SimplePointRequest struct {
	// ID точки
	ID *uuid.UUID `json:"id,omitempty" example:"44eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// ID мероприятия, к которому относится точка
	EventID uuid.UUID `json:"event_id" example:"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
	// Координата X на карте
	X *int32 `json:"x" example:"90"`
	// Координата Y на карте
	Y *int32 `json:"y" example:"150"`
	// Заголовок точки
	Title *string `json:"title" example:"Название"`
}
