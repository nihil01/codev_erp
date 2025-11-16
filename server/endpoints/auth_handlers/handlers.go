package auth_handlers

import (
	"codev_erp/db"
	"codev_erp/db/models"
	"codev_erp/dto"
	"codev_erp/endpoints"
	"codev_erp/logger"
	"log/slog"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func LoginHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)

	var pendingUser dto.AuthRequest
	var user models.User
	var resUser dto.UserResponse

	if err := ctx.ShouldBindJSON(&pendingUser); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	db.DB.Where("email = ?", pendingUser.Email).First(&user)

	hashMatched := endpoints.CheckPasswordHash(pendingUser.Password, user.Password)

	if !hashMatched || user.Role != pendingUser.Role {
		errMessage := "Invalid role or password for user " + user.Email + " from IP: " + ctx.ClientIP() + ""
		logger.Log(errMessage, slog.LevelError)
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid role or password"})
		return

	}

	db.DB.Model(&user).Update("last_login", time.Now().Local())

	resUser.ID = user.ID
	resUser.Email = user.Email
	resUser.FirstName = user.FirstName
	resUser.LastName = user.LastName
	resUser.Role = user.Role
	resUser.Registered = user.Registered
	resUser.LastLogin = user.LastLogin
	resUser.Avatar = user.Avatar

	session.Set("user", resUser)

	err := session.Save()
	if err != nil {
		logger.Log("Failed to save session! "+err.Error(), slog.LevelError)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": resUser,
	})

}

func AuthHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)

	userData := session.Get("user")
	if userData == nil {
		ctx.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	sessionUser, ok := userData.(dto.UserResponse)
	if !ok {
		ctx.JSON(500, gin.H{"error": "Invalid session data"})
		return
	}

	ctx.JSON(200, gin.H{
		"message": "Authenticated",
		"user":    sessionUser,
	})
}

func ChangePasswordHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)
	userData := session.Get("user")

	type PasswordChangeRequest struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if userData == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	sessionUser, ok := userData.(dto.UserResponse)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req PasswordChangeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	logger.Log("Password change request from "+sessionUser.Email+" ("+ctx.ClientIP()+")", slog.LevelInfo)

	// Получаем текущий пароль
	var currentUser models.User
	err := db.DB.Model(&models.User{}).
		Select("password").
		Where("id = ?", sessionUser.ID).
		First(&currentUser).Error
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get current password"})
		return
	}

	// Проверяем старый пароль
	if !endpoints.CheckPasswordHash(req.OldPassword, currentUser.Password) {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid old password"})
		return
	}

	// Проверяем, чтобы новый пароль отличался
	if req.OldPassword == req.NewPassword {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "New password cannot be the same as old password"})
		return
	}

	// Хэшируем новый пароль
	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash new password"})
		return
	}

	// Обновляем пароль
	err = db.DB.Model(&models.User{}).
		Where("id = ?", sessionUser.ID).
		Update("password", string(newHash)).Error
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Password changed successfully"})
}

//Administrator-specific endpoint

func RegisterHandler(ctx *gin.Context) {
	var pendingUser dto.RegisterRequest
	var userToBeSaved models.User

	session := sessions.Default(ctx)

	sessionUser, ok := session.Get("user").(dto.UserResponse)
	if !ok || sessionUser.Role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := ctx.ShouldBindJSON(&pendingUser); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	userToBeSaved.Email = pendingUser.Email
	userToBeSaved.Password = pendingUser.Password
	userToBeSaved.FirstName = pendingUser.FirstName
	userToBeSaved.LastName = pendingUser.LastName
	userToBeSaved.Role = pendingUser.Role

	err := db.DB.Create(&userToBeSaved).Error

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"success": "User created",
	})

}

func DeleteHandler(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	if err := db.DB.Delete(&models.User{}, id).Error; err != nil {
		logger.Log("Failed to delete user: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "User deleted successfully"})
}

func LogoutHandler(ctx *gin.Context) {

	session := sessions.Default(ctx)
	session.Clear()

	if err := session.Save(); err != nil {
		logger.Log("Failed to save session! "+err.Error(), slog.LevelError)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to save session"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Logged out"})

}
