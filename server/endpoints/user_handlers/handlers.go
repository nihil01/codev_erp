package user_handlers

import (
	"codev_erp/db"
	"codev_erp/db/models"
	"codev_erp/dto"
	"codev_erp/endpoints"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func GetProfileHandler(ctx *gin.Context) {
	id := ctx.Param("id")

	if id == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	UserResponse := dto.UserResponse{}
	User := models.User{}

	db.DB.Where("id = ?", id).First(&User)

	UserResponse.ID = User.ID
	UserResponse.Email = User.Email
	UserResponse.FirstName = User.FirstName
	UserResponse.LastName = User.LastName
	UserResponse.Role = User.Role
	UserResponse.Registered = User.Registered
	UserResponse.LastLogin = User.LastLogin
	UserResponse.Avatar = User.Avatar

	ctx.JSON(http.StatusOK, UserResponse)

}

func AvatarUpdateHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)

	el, ok := session.Get("user").(dto.UserResponse)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	file, err := ctx.FormFile("avatar")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	filename := endpoints.ProcessImageFile(file, ctx, false)

	if err := db.DB.Model(&models.User{}).Where("id = ?", el.ID).Update("avatar", filename).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": filename})
}

//Administrator-specific endpoints

func GetAllUsersHandler(ctx *gin.Context) {
	var usersDto []dto.UserResponse
	var userModel []models.User

	fetchStudents := ctx.Query("students") == "true"

	if fetchStudents {
		err := db.DB.Where("role = ?", "student").Find(&userModel).Error

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get students by admin request"})
			return
		}
	} else {
		err := db.DB.Where("role = ?", "staff").Find(&userModel).Error

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get teachers by admin request"})
			return
		}
	}

	for _, user := range userModel {
		usersDto = append(usersDto, dto.UserResponse{
			ID:         user.ID,
			Email:      user.Email,
			FirstName:  user.FirstName,
			LastName:   user.LastName,
			Role:       user.Role,
			Registered: user.Registered,
			LastLogin:  user.LastLogin,
			Avatar:     user.Avatar,
		})
	}

	ctx.JSON(http.StatusOK, usersDto)
}
