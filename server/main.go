package main

import (
	"codev_erp/db"
	"codev_erp/dto"
	"codev_erp/logger"
	"codev_erp/routes"
	"encoding/gob"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func main() {

	PORT := 8080

	fmt.Printf("Starting server on port %v", PORT)

	//set up logging once the app starts
	logger.SetupDatabaseLogger()

	//connect to database
	db.Connect()
	db.GenerateTables()

	gob.Register(dto.UserResponse{})

	r := gin.Default()
	r.Static("/static", "./static")
	gin.SetMode(gin.DebugMode)

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // или "*" если тестируешь
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	store := cookie.NewStore([]byte("OHF74385BK05MHQW9MPFZYE347DF8"))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   60 * 60 * 24, // 1 день
		HttpOnly: true,
		SameSite: http.SameSiteNoneMode, // SameSiteDefaultMode, можно Lax или None
		Secure:   true,                  // true если HTTPS
	}) // expire in a day

	r.Use(sessions.Sessions("session", store))

	authLimiter := rate.NewLimiter(2, 6)

	//set up routes conveniently
	routes.AuthRoutes(r, authLimiter)
	routes.CourseRoutes(r)
	routes.UserRoutes(r)
	routes.LessonRoutes(r)

	err := r.Run(":8080")

	if err != nil {
		panic(err)
		return
	}

}
