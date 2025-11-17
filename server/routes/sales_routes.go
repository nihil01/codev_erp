package routes

import (
	"codev_erp/endpoints/middleware"
	"codev_erp/endpoints/sales_handlers"

	"github.com/gin-gonic/gin"
)

func SalesRoutes(r *gin.Engine) {

	r.GET("/sales", middleware.ValidateUser("sales"), sales_handlers.GetSales)
	r.PUT("/sales/:id", middleware.ValidateUser("sales"), sales_handlers.UpdateSales)

}
