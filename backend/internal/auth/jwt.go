package auth

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func GetSecretKey() []byte {
	return []byte(os.Getenv("JWT_SECRET"))
}

type Claims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

const (
	AdminTokenExpiry = 24 * time.Hour
	EventTokenExpiry = 2 * time.Hour
)

func GenerateToken(userID int, email, role string, expiry time.Duration) (string, error) {
	key := GetSecretKey()
	if len(key) == 0 {
		return "", errors.New("JWT_SECRET is not set")
	}

	claims := &Claims{
		UserID: userID,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(key)
}

func ParseToken(tokenStr string) (*Claims, error) {
	key := GetSecretKey()
	if len(key) == 0 {
		return nil, errors.New("JWT_SECRET is not set")
	}

	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return key, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}
