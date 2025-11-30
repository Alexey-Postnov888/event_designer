package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/handlers"
	middleware "github.com/Alexy-Postnov888/event_designer/backend/internal/middleware"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	dbURL := os.Getenv("DB_URL")
	if dbURL == "" {
		log.Fatal("DB_URL environment variable is required")
	}

	dbConn, err := sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatal("Failed to open connection to the database:", err)
	}
	defer dbConn.Close()

	if err := dbConn.Ping(); err != nil {
		log.Fatal("Failed to connect to the database:", err)
	}

	querier := db.New(dbConn)

	authHandler := handlers.NewAuthHandler(querier)

	mux := http.NewServeMux()

	//авторизация для админа
	mux.HandleFunc("POST /auth/login", authHandler.Login)
	//авторизация для обычного юзера с потверждением кода
	mux.HandleFunc("POST /auth/request-code", authHandler.RequestCode)
	mux.HandleFunc("POST /auth/verify-code", authHandler.VerifyCode)

	//CRUD для мероприятий
	mux.HandleFunc("POST /admin/events", middleware.AdminOnlyMiddleware(authHandler.CreateEvent))
	mux.HandleFunc("GET /admin/events", middleware.AuthMiddleware(authHandler.ListEvents))
	mux.HandleFunc("GET /events/{event_id}", middleware.AuthMiddleware(authHandler.GetEventByID))
	mux.HandleFunc("PATCH /admin/events/{event_id}", middleware.AdminOnlyMiddleware(authHandler.UpdateEvent))
	mux.HandleFunc("DELETE /admin/events/{event_id}", middleware.AdminOnlyMiddleware(authHandler.DeleteEvent))

	//управление списком почт для мероприятия
	mux.HandleFunc("POST /admin/events/{event_id}/allowed-emails", middleware.AdminOnlyMiddleware(authHandler.AddAllowedEmail))
	mux.HandleFunc("DELETE /admin/events/{event_id}/allowed-emails/{email}", middleware.AdminOnlyMiddleware(authHandler.DeleteAllowedEmail))

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("Server startup error:", err)
	}
}
