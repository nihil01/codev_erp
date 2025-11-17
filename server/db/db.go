package db

import (
	"codev_erp/db/models"
	"codev_erp/logger"
	"log/slog"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := "host=10.10.10.2 user=orxan password=orxan20052004 dbname=codev port=5432 sslmode=disable TimeZone=UTC"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		logger.Log("Failed to connect to database!", slog.LevelError)
	}

	DB = db

	logger.Log("Connected to database!", slog.LevelInfo)

}

func GenerateTables() {
	if DB != nil {
		logger.Log("Generating tables...", slog.LevelInfo)
		err := DB.AutoMigrate(&models.User{}, &models.Course{}, &models.EnrolledCourse{},
			&models.Lesson{}, &models.LessonTasks{}, &models.UsersHomework{},
			&models.Lead{}, &models.Sales{})

		if err != nil {
			logger.Log("Failed to generate tables! Error: "+err.Error(), slog.LevelError)
		}
	}
}
