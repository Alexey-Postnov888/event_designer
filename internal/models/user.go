package models

// Структура пользователя в системе
type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"-"`
}

//временное создание юзера до бд
func NewUser(email, password string) *User {
	return &User{
		Email:    email,
		Password: password,
	}
}

//ответ
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:    u.ID,
		Email: u.Email,
	}
}

// Структура для созданя пользователя
type CreateUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Структура для обновления пользователя
type UpdateUserRequest struct {
	Email string `json:"email"`
}

// Структура для ответа с данными
type UserResponse struct {
	ID    int    `json:"id"`
	Email string `json:"email"`
}

// Структура для ответа при удалении
type DeleteUserResponse struct {
	ID      int    `json:"user_id"`
	Message string `json:"message"`
}
