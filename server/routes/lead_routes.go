package routes

import (
	"codev_erp/endpoints/lead_handlers"
	"codev_erp/endpoints/middleware"

	"github.com/gin-gonic/gin"
)

func LeadRoutes(r *gin.Engine) {

	r.POST("/leads", middleware.ValidateUser("lead"), lead_handlers.AddLead)
	r.GET("/leads", middleware.ValidateUser("lead"), lead_handlers.GetLeads)
	r.DELETE("/leads/:id", middleware.ValidateUser("lead"), lead_handlers.DeleteLeads)

}
