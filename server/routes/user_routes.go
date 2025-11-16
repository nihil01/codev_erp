package routes

import (
	"codev_erp/endpoints/middleware"
	"codev_erp/endpoints/user_handlers"

	"github.com/gin-gonic/gin"
)

func UserRoutes(r *gin.Engine) {

	r.GET("/profile/:id", user_handlers.GetProfileHandler)
	r.PUT("/avatar_update", user_handlers.AvatarUpdateHandler)
	r.GET("/get_users", middleware.ValidateUser("admin"), user_handlers.GetAllUsersHandler)

}
