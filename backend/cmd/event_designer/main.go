package main

import (
	"database/sql"
	"log"
	"net/http"

	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/handlers"
	_ "github.com/jackc/pgx/v5/stdlib"
)

func main() {
	dbConn, err := sql.Open("pgx", "postgresql://postgres:111@localhost:5432/event_designer?sslmode=disable")
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
	mux.HandleFunc("POST /auth/login", authHandler.Login)
	mux.HandleFunc("POST /auth/request-code", authHandler.RequestCode)
	mux.HandleFunc("POST /auth/verify-code", authHandler.VerifyCode)

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("Server startup error:", err)
	}
}
