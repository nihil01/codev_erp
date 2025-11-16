package lesson_handlers

import (
	"codev_erp/db"
	"codev_erp/db/models"
	"codev_erp/dto"
	"codev_erp/endpoints"
	"codev_erp/logger"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func AddLessonHandler(ctx *gin.Context) {
	var req dto.LessonRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	lesson := models.Lesson{
		CourseID:    req.CourseID,
		Name:        req.Name,
		Description: req.Description,
	}

	if err := db.DB.Create(&lesson).Error; err != nil {
		logger.Log("Failed to create lesson: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create lesson"})
		return
	}

	ctx.JSON(http.StatusOK, lesson)
}

func DeleteLessonHandler(ctx *gin.Context) {

	lessonId := ctx.Param("id")

	err := db.DB.Where("id = ?", lessonId).Delete(&models.Lesson{}).Error
	if err != nil {
		logger.Log("Failed to delete lesson: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete lesson"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Lesson deleted successfully"})
}

func GetLessonsHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)

	user := session.Get("user")
	if user == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userData, ok := user.(dto.UserResponse)
	if !ok {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	courseID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	isValid, reason := checkCourseEnrollment(int(userData.ID), courseID, userData.Role)
	if !isValid {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": reason})
		return
	}

	var lessons []models.Lesson
	if err := db.DB.Where("course_id = ?", courseID).Find(&lessons).Error; err != nil {
		logger.Log("Failed to get lessons: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get lessons"})
		return
	}

	ctx.JSON(http.StatusOK, lessons)
}

func checkCourseEnrollment(userID int, courseID int, role string) (bool, string) {
	if role == "teacher" {
		var course models.Course
		err := db.DB.Where("teacher_id = ? AND id = ?", userID, courseID).First(&course).Error
		if err != nil {
			logger.Log("Error while checking course enrollment: "+err.Error(), slog.LevelError)
			return false, "Course not found or you are not the teacher"
		}
		return true, ""
	}

	// Student check
	var enrolled models.EnrolledCourse
	err := db.DB.Where("user_id = ? AND course_id = ?", userID, courseID).First(&enrolled).Error
	if err != nil {
		logger.Log("Error while checking user enrollment: "+err.Error(), slog.LevelError)
		return false, "You are not enrolled in this course"
	}

	return true, ""
}

func AddTasksHandler(ctx *gin.Context) {
	form, err := ctx.MultipartForm()
	logger.Log("Teacher adding files ...", slog.LevelDebug)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	lessonID := form.Value["lessonId"]
	if len(lessonID) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "lessonId is required"})
		return
	}

	lessonIdInt, err := strconv.Atoi(lessonID[0])
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lessonId"})
		return
	}

	homeworkFiles := form.File["homework_files"]
	classworkFiles := form.File["classwork_files"]

	var tasks models.LessonTasks
	tasks.LessonID = uint(lessonIdInt)

	// Process Homework Files
	for _, file := range homeworkFiles {
		filename := endpoints.ProcessImageFile(file, ctx, true)
		tasks.Homework = append(tasks.Homework, filename)
	}

	// Process Classwork Files
	for _, file := range classworkFiles {
		filename := endpoints.ProcessImageFile(file, ctx, true)
		tasks.Classwork = append(tasks.Classwork, filename)
	}

	// ✅ GORM сам преобразует []string → JSON
	err = db.DB.Create(&tasks).Error
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save tasks", "details": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Tasks added successfully"})
}

func GetLessonTasksHandler(ctx *gin.Context) {

	lessonId := ctx.Param("id")
	lessonIdInt, err := strconv.Atoi(lessonId)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lessonId"})
		return
	}

	var lessontasks []models.LessonTasks

	err = db.DB.Where("lesson_id = ?", lessonIdInt).Find(&lessontasks).Error
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tasks", "details": err.Error()})
	}

	var newLessonTask models.LessonTasks

	newLessonTask.LessonID = uint(lessonIdInt)
	newLessonTask.ID = uint(lessonIdInt)

	for _, task := range lessontasks {

		if task.Homework != nil {

			for _, hometask := range task.Homework {

				newLessonTask.Homework = append(newLessonTask.Homework, hometask)

			}

		}

		if task.Classwork != nil {

			for _, classwork := range task.Classwork {

				newLessonTask.Classwork = append(newLessonTask.Classwork, classwork)

			}

		}

	}

	ctx.JSON(http.StatusOK, newLessonTask)

}

func FileDownloadHandler(ctx *gin.Context) {

	file := ctx.Param("file")

	if file == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file"})
		return
	}

	dir, err := os.Getwd()

	if err != nil {
		logger.Log("Failed to get working directory: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get working directory"})
		return
	}

	fullPath := filepath.Join(dir, "static", file)
	ctx.Header("Content-Disposition", "attachment; filename="+file)
	ctx.Header("Content-Type", "application/octet-stream")

	ctx.File(fullPath)
}

func ScreenRecordHandler(ctx *gin.Context) {
	form, err := ctx.MultipartForm()
	logger.Log("Teacher adding screenrecord ...", slog.LevelDebug)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	lessonID := form.Value["lessonId"]
	nativeFilename := form.Value["screenrecord_name"]

	if len(lessonID) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "lessonId is required"})
		return
	}
	lessonIdInt, err := strconv.Atoi(lessonID[0])

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lessonId"})
		return
	}

	file, err := ctx.FormFile("screenrecord")

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}

	file.Filename = nativeFilename[0]

	filename := endpoints.ProcessImageFile(file, ctx, true)

	var lesson models.LessonTasks

	// 1. Сначала получаем из БД
	if err := db.DB.Where("lesson_id = ?", lessonIdInt).First(&lesson).Error; err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Lesson not found"})
		return
	}

	// 2. Добавляем файл
	lesson.Classwork = append(lesson.Classwork, filename)

	// 3. Сохраняем
	if err := db.DB.Save(&lesson).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update lesson"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Screenrecord added successfully"})

}

func SubmitHomeworkHandler(ctx *gin.Context) {

	form, err := ctx.MultipartForm()

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form"})
		return
	}

	userID := form.Value["userId"]
	lessonID := form.Value["lessonId"]

	userIdInt, err := strconv.Atoi(userID[0])

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId"})
		return
	}

	lessonIdInt, err := strconv.Atoi(lessonID[0])

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lessonId"})
		return
	}

	var checkHwModel models.UsersHomework

	if err := db.DB.Where("user_id = ? and lesson_id = ?",
		userIdInt, lessonIdInt).First(&checkHwModel).Error; err == nil {

		ctx.JSON(http.StatusBadRequest, gin.H{"error": "You have already submitted homework for this lesson"})
		return

	}

	hwFile := form.File["homework_files"]

	if len(hwFile) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "homework_file is required"})
	}

	var userHw models.UsersHomework

	userHw.UserID = uint(userIdInt)
	userHw.LessonID = uint(lessonIdInt)

	for _, file := range hwFile {

		filename := endpoints.ProcessImageFile(file, ctx, true)
		userHw.Homework = append(userHw.Homework, filename)

	}

	db.DB.Create(&userHw)

	logger.Log("User with ID "+string(rune(userIdInt))+" submitted homewrork", slog.LevelDebug)
	ctx.JSON(http.StatusOK, gin.H{"success": "Homework submitted successfully"})

}

func ListHomeworkHandler(ctx *gin.Context) {

	lessonID := ctx.Param("id")

	if lessonID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	var homework []models.UsersHomework

	if err := db.DB.Preload("User").Where("lesson_id = ?", lessonID).Find(&homework).Error; err != nil {

		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get homework"})
		logger.Log("Failed to get homework: "+err.Error(), slog.LevelError)
		return
	}

	ctx.JSON(http.StatusOK, homework)
}

func GradeHomeworkHandler(ctx *gin.Context) {

	hwId := ctx.Param("id")

	if hwId == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return

	}

	type GradeRequest struct {
		Points  int    `json:"points"`
		Comment string `json:"comment"`
	}

	var req GradeRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {

		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return

	}

	var homework models.UsersHomework

	if err := db.DB.Where("id = ?", hwId).First(&homework).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get homework"})
		logger.Log("Failed to get homework: "+err.Error(), slog.LevelError)
		return
	}

	if homework.Checked {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Homework already graded"})
		return
	}

	homework.Points = uint(req.Points)
	homework.Comment = req.Comment
	homework.Checked = true

	db.DB.Save(&homework)

	ctx.JSON(http.StatusOK, gin.H{"success": "Homework graded successfully"})
}

func ViewGradesHandler(ctx *gin.Context) {

	lessonId := ctx.Query("lessonId")
	userId := ctx.Query("userId")

	lessonIdInt, err := strconv.Atoi(lessonId)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid lessonId"})
		return
	}

	userIdInt, err := strconv.Atoi(userId)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userId"})
		return
	}

	var grades models.UsersHomework

	if lessonId != "" {
		if err := db.DB.Where("lesson_id = ? and user_id = ?", lessonIdInt, userIdInt).First(&grades).Error; err != nil {
			logger.Log("Failed to get lesson: "+err.Error(), slog.LevelError)
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get lesson"})
			return
		}
	}

	ctx.JSON(http.StatusOK, grades)
}
