package endpoints

import (
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func ProcessImageFile(fh *multipart.FileHeader, ctx *gin.Context, ignoreUUID bool) string {

	ext := strings.ToLower(strings.TrimPrefix(filepath.Ext(fh.Filename), "."))
	allowedExtensions := []string{"jpg", "jpeg", "png", "webp"}

	if !ignoreUUID {
		valid := false
		for _, e := range allowedExtensions {
			if e == ext {
				valid = true
				break
			}
		}
		if !valid {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file extension"})
			return ""
		}
	}

	var filename string

	if !ignoreUUID {
		filename = uuid.New().String() + "." + ext

	} else {
		filename = strings.Trim(strings.ReplaceAll(fh.Filename, " ", "_"), " ")

	}

	savePath := filepath.Join("./static", filename)

	if err := ctx.SaveUploadedFile(fh, savePath); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return ""
	}

	return filename
}
