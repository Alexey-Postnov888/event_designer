package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/Alexy-Postnov888/event_designer/backend/docs"
	db "github.com/Alexy-Postnov888/event_designer/backend/internal/db/generated"
	"github.com/Alexy-Postnov888/event_designer/backend/internal/handlers"
	middleware "github.com/Alexy-Postnov888/event_designer/backend/internal/middleware"
	storage "github.com/Alexy-Postnov888/event_designer/backend/internal/storage"
	_ "github.com/jackc/pgx/v5/stdlib"
	httpSwagger "github.com/swaggo/http-swagger"
)

// Путь, куда сохраняются файлы временно
const LocalStorageDir = "/root/local_storage"

// Публичный URL для доступа к файлам
const PublicStaticURL = "http://localhost:8080/static/"

// @title           Event Designer API
// @version         1.0
// @description     Сервис для управления событиями, картами и точками интереса.
// @host            localhost:8080
// @BasePath		/

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
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

	localStorage := storage.NewLocalStorage(LocalStorageDir, PublicStaticURL)

	authHandler := handlers.NewAuthHandler(querier, localStorage)

	mux := http.NewServeMux()

	//авторизация для админа
	mux.HandleFunc("POST /auth/login", authHandler.Login)
	//авторизация для обычного юзера с потверждением кода
	mux.HandleFunc("POST /auth/request-code", authHandler.RequestCode)
	mux.HandleFunc("POST /auth/verify-code", authHandler.VerifyCode)

	//CRUD для мероприятий
	mux.HandleFunc("POST /admin/events", middleware.AdminOnlyMiddleware(authHandler.CreateEvent))
	mux.HandleFunc("GET /events", middleware.AuthMiddleware(authHandler.ListEvents))
	mux.HandleFunc("GET /events/{event_id}", middleware.AuthMiddleware(authHandler.GetEventByID))
	mux.HandleFunc("PATCH /admin/events", middleware.AdminOnlyMiddleware(authHandler.UpdateEvent))
	mux.HandleFunc("DELETE /admin/events/{eventID}", middleware.AdminOnlyMiddleware(authHandler.DeleteEvent))

	//управление списком почт для мероприятия
	mux.HandleFunc("POST /admin/events/allowed-emails", middleware.AdminOnlyMiddleware(authHandler.AddAllowedEmail))
	mux.HandleFunc("DELETE /admin/events/allowed-emails", middleware.AdminOnlyMiddleware(authHandler.DeleteAllowedEmail))

	//доступ к картам
	mux.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(LocalStorageDir))))

	//CRUD для карт
	mux.HandleFunc("PUT /admin/events/map", middleware.AdminOnlyMiddleware(authHandler.UpdateEventMap))
	mux.HandleFunc("GET /events/{eventID}/map", middleware.AuthMiddleware(authHandler.GetEventMap))
	mux.HandleFunc("DELETE /admin/events/{eventID}/map", middleware.AdminOnlyMiddleware(authHandler.DeleteEventMap))

	//CRUD для точек/таймлайнов
	mux.HandleFunc("POST /admin/events/points/simple", middleware.AdminOnlyMiddleware(authHandler.CreateSimplePoint))
	mux.HandleFunc("POST /admin/events/points/timeline", middleware.AdminOnlyMiddleware(authHandler.CreateTimelinePoint))
	mux.HandleFunc("PATCH /admin/events/points/simple", middleware.AdminOnlyMiddleware(authHandler.UpdateSimplePoint))
	mux.HandleFunc("PATCH /admin/events/points/timeline", middleware.AdminOnlyMiddleware(authHandler.UpdateTimelinePoint))
	mux.HandleFunc("GET /events/{eventID}/points", middleware.AuthMiddleware(authHandler.GetPointsByEvent))
	mux.HandleFunc("DELETE /admin/events/{eventID}/points/{pointID}", middleware.AdminOnlyMiddleware(authHandler.DeletePoint))

	mux.Handle("/swagger/", httpSwagger.WrapHandler)

	log.Println("Swagger UI доступен по адресу: http://localhost:8080/swagger/index.html")

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	err = server.ListenAndServe()
	if err != nil {
		log.Fatal("Server startup error:", err)
	}
}
