package routes

import (
	"codev_erp/endpoints/auth_handlers"
	"codev_erp/endpoints/middleware"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func AuthRoutes(r *gin.Engine, rateLimiter *rate.Limiter) {

	//rate limiting for login and password change endpoints
	r.POST("/login", middleware.RateLimiter(rateLimiter), auth_handlers.LoginHandler)
	r.POST("/change_password", middleware.RateLimiter(rateLimiter), auth_handlers.ChangePasswordHandler)

	r.GET("/check_auth", auth_handlers.AuthHandler)
	r.GET("/logout", auth_handlers.LogoutHandler)
	r.POST("/register", middleware.ValidateUser("admin"), auth_handlers.RegisterHandler)
	r.DELETE("/users/:id", middleware.ValidateUser("admin"), auth_handlers.DeleteHandler)

}
