package routes

import (
	"codev_erp/endpoints/auth_handlers"
	"codev_erp/endpoints/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func AuthRoutes(r *gin.Engine, rateLimiter *rate.Limiter) {

	r.POST("/login", middleware.RateLimiter(rateLimiter), auth_handlers.LoginHandler)
	r.POST("/change_password", auth_handlers.ChangePasswordHandler)
	r.GET("/check_auth", auth_handlers.AuthHandler)
	r.GET("/logout", auth_handlers.LogoutHandler)
	r.POST("/register", middleware.CheckAdmin(), auth_handlers.RegisterHandler)
	r.DELETE("/users/:id", middleware.CheckAdmin(), auth_handlers.DeleteHandler)

}
