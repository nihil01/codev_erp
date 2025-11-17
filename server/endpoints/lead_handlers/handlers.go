package lead_handlers

import (
	"codev_erp/db"
	"codev_erp/db/models"
	"codev_erp/dto"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func AddLead(ctx *gin.Context) {

	type LeadRequest = struct {
		Description string `json:"description"`
		Date        string `json:"date"`
		Name        string `json:"name"`
		Phone       string `json:"phone"`
		IgNick      string `json:"igNick"`
		Status      string `json:"status"`
		Source      string `json:"source"`
		Author      string `json:"author"`
		Course      string `json:"course"`
	}

	var req LeadRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var LeadModel models.Lead

	t, err := time.Parse("2006-01-02", req.Date)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	session := sessions.Default(ctx)

	userData := session.Get("user")
	user, ok := userData.(dto.UserResponse)

	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if req.Author == "" || req.Author != user.Email {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	LeadModel.Date = t
	LeadModel.Name = req.Name
	LeadModel.Description = req.Description
	LeadModel.Source = req.Source
	LeadModel.Nickname = req.IgNick
	LeadModel.Phone = req.Phone
	LeadModel.Status = req.Status
	LeadModel.Author = req.Author
	LeadModel.Course = req.Course

	var ExistingModel models.Lead
	if err := db.DB.Where("phone = ?", req.Phone).First(&ExistingModel).Error; err == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Lead with this phone already exists"})
		return
	}

	db.DB.Create(&LeadModel)

	//also create sales model
	var Course models.Course
	db.DB.Where("name = ?", req.Course).First(&Course)

	if Course.ID == 0 {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Course not found by provided name"})
		return
	}

	var Sales models.Sales

	Sales.Lead = LeadModel
	Sales.LeadID = LeadModel.ID
	Sales.Course = Course
	Sales.GroupID = Course.ID

	db.DB.Create(&Sales)

	ctx.JSON(http.StatusCreated, gin.H{"success": "Lead & Sales created successfully"})
}

func GetLeads(ctx *gin.Context) {
	var leads []models.Lead
	db.DB.Find(&leads)
	ctx.JSON(http.StatusOK, leads)
}

func DeleteLeads(ctx *gin.Context) {

	Id := ctx.Param("id")

	if Id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	db.DB.Delete(&models.Lead{}, Id)
}
