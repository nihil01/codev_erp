package sales_handlers

import (
	"codev_erp/db"
	"codev_erp/db/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetSales(ctx *gin.Context) {

	var Sales []models.Sales
	db.DB.Preload("Lead").Preload("Course").Find(&Sales)

	ctx.JSON(http.StatusOK, Sales)
}

func UpdateSales(ctx *gin.Context) {

	type UpdateRequest struct {
		Id       uint    `json:"id" binding:"required"`
		LastCall *string `json:"lastCall"`
		Result   *string `json:"result"`
		Payed    *bool   `json:"payed"`
		Note     *string `json:"note"`
	}

	var updateRequest UpdateRequest

	err := ctx.BindJSON(&updateRequest)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var Sales models.Sales

	if updateRequest.LastCall != nil {
		Sales.LastCall = *updateRequest.LastCall
		db.DB.Model(&Sales).Where("id = ?", updateRequest.Id).
			Update("last_call", *updateRequest.LastCall)

	} else if updateRequest.Result != nil {
		Sales.Result = *updateRequest.Result
		db.DB.Model(&Sales).Where("id = ?", updateRequest.Id).
			Update("result", *updateRequest.Result)

	} else if updateRequest.Payed != nil {
		Sales.Paid = *updateRequest.Payed
		db.DB.Model(&Sales).Where("id = ?", updateRequest.Id).
			Update("payed", *updateRequest.Payed)

	} else if updateRequest.Note != nil {
		Sales.Note = *updateRequest.Note
		db.DB.Model(&Sales).Where("id = ?", updateRequest.Id).
			Update("note", *updateRequest.Note)

	}

	ctx.Status(http.StatusOK)

}
