package course_handlers

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
	"gorm.io/gorm"
)

func GetCoursesHandler(ctx *gin.Context) {
	session := sessions.Default(ctx)
	user, ok := session.Get("user").(dto.UserResponse)

	courseId := ctx.Param("id")

	if courseId != "" {

		courseIdInt, err := strconv.Atoi(courseId)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
			return

		}

		var course models.Course
		err = db.DB.Preload("Teacher").Where("id = ?", courseIdInt).First(&course).Error

		if err != nil {
			logger.Log("Failed to get course: "+err.Error(), slog.LevelError)
		}

		ctx.JSON(http.StatusOK, course)
		return

	}

	if !ok {
		logger.Log("Failed to get user from session!", slog.LevelError)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user from session"})
		return
	}

	var courses []models.Course
	var err error

	switch user.Role {
	case "student":
		err = db.DB.
			Preload("Teacher"). // 👈 загрузить преподавателя
			Joins("JOIN enrolled_courses ON enrolled_courses.course_id = courses.id").
			Where("enrolled_courses.user_id = ?", user.ID).
			Find(&courses).Error

	case "teacher":
		err = db.DB.
			Preload("Teacher").
			Where("teacher_id = ?", user.ID).
			Find(&courses).Error

	default: // admin
		err = db.DB.
			Preload("Teacher").
			Find(&courses).Error
	}

	if err != nil {
		logger.Log("Failed to get courses for "+user.Role+" "+user.Email+"! Error: "+err.Error(), slog.LevelError)
		ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to get courses"})
		return
	}

	ctx.JSON(http.StatusOK, courses)
}

//Administrator-specific handlers

func AddCourseHandler(ctx *gin.Context) {
	form, _ := ctx.MultipartForm()
	logger.Log("Form: ", slog.LevelDebug)

	if form == nil || form.Value["name"] == nil || form.Value["description"] == nil || form.Value["duration"] == nil ||
		form.Value["teacher_id"] == nil || form.File["preview_image"] == nil || form.Value["price"] == nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	filename := endpoints.ProcessImageFile(form.File["preview_image"][0], ctx, false)
	teacherIdInt, err := strconv.Atoi(form.Value["teacher_id"][0])

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher ID"})
		return
	}

	teacherId := uint(teacherIdInt)

	course := models.Course{
		Name:         form.Value["name"][0],
		Description:  form.Value["description"][0],
		PreviewImage: filename,
		Duration:     form.Value["duration"][0],
		TeacherID:    &teacherId,
		Price:        form.Value["price"][0],
	}

	if err := db.DB.Create(&course).Error; err != nil {
		logger.Log("Failed to create course: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create course"})
		return
	}

	courseResponse := dto.CourseResponse{
		ID:           course.ID,
		Name:         course.Name,
		Description:  course.Description,
		PreviewImage: course.PreviewImage,
		Duration:     course.Duration,
		Teacher:      dto.UserResponse{},
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Course created successfully", "course": courseResponse})
}

func DeleteCourseHandler(ctx *gin.Context) {
	idParam := ctx.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 64)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course ID"})
		return
	}

	if err := db.DB.Delete(&models.Course{}, id).Error; err != nil {
		logger.Log("Failed to delete course: "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete course"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Course deleted successfully"})
}

func GetCourseParticipantsHandler(ctx *gin.Context) {
	courseID := ctx.Param("id")

	var participants []dto.ParticipantResponse

	err := db.DB.
		Table("users").
		Joins("JOIN enrolled_courses ON enrolled_courses.user_id = users.id").
		Where("enrolled_courses.course_id = ?", courseID).
		Select("users.id, users.first_name, users.last_name, users.email, users.avatar, enrolled_courses.paid, " +
			"enrolled_courses.start_date, enrolled_courses.end_date").
		Scan(&participants).Error

	if err != nil {
		logger.Log("Failed to fetch participants! "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants"})
		return
	}

	ctx.JSON(http.StatusOK, participants)
}

func AddParticipantHandler(ctx *gin.Context) {
	courseID, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)

	var body struct {
		StudentID      uint   `json:"student_id"`
		CourseDuration string `json:"course_duration"`
	}

	if err := ctx.ShouldBindJSON(&body); err != nil || body.StudentID == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student ID"})
		return
	}

	var existing models.EnrolledCourse
	err := db.DB.Where("user_id = ? AND course_id = ?", body.StudentID, courseID).First(&existing).Error
	if err == nil {
		ctx.JSON(http.StatusConflict, gin.H{"error": "Student already enrolled"})
		return
	}

	duration, err := strconv.ParseUint(body.CourseDuration, 10, 64)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid course duration"})
		return
	}

	enrollment := models.EnrolledCourse{
		UserID:    body.StudentID,
		CourseID:  uint(courseID),
		StartDate: time.Now(),
		EndDate:   time.Now().AddDate(0, int(duration), 0),
		Paid:      false,
	}

	if err := db.DB.Create(&enrollment).Error; err != nil {
		logger.Log("Failed to enroll student! "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to enroll student"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Student added successfully"})
}

func RemoveParticipantHandler(ctx *gin.Context) {

	courseID := ctx.Param("id")
	studentID := ctx.Param("studentId")

	err := db.DB.
		Where("course_id = ? AND user_id = ?", courseID, studentID, studentID).
		Delete(&models.EnrolledCourse{}).Error

	if err != nil {
		logger.Log("Failed to remove participant! "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove participant"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Student removed successfully"})
}

func GetStudentCoursesHandler(ctx *gin.Context) {
	userId := ctx.Param("id")
	var enrolledCourses []models.EnrolledCourse

	userIdInt, err := strconv.Atoi(userId)

	err = db.DB.
		Select("enrolled_courses.paid, enrolled_courses.paid_date, enrolled_courses.course_id, enrolled_courses.id").
		Where("enrolled_courses.user_id = ?", userIdInt).
		Preload("Course", func(db *gorm.DB) *gorm.DB {
			return db.Select("id, name")
		}).
		Find(&enrolledCourses).Error

	if err != nil {
		logger.Log("Failed to get student courses for admin! "+err.Error(), slog.LevelError)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get student courses"})
		return
	}

	courseResponse := struct {
		UserID  uint                    `json:"user_id"`
		Courses []models.EnrolledCourse `json:"courses"`
	}{
		UserID:  uint(userIdInt),
		Courses: enrolledCourses,
	}

	ctx.JSON(http.StatusOK, courseResponse)
}

func UpdateStudentPayments(ctx *gin.Context) {

	type PaymentRequest struct {
		UserID   uint `json:"user_id"`
		CourseID uint `json:"course_id"`
		Paid     bool `json:"paid"`
	}

	var request []PaymentRequest

	if ctx.ShouldBindJSON(&request) != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	for _, payment := range request {
		tmstmp := time.Now().In(time.Local)

		DbPaymentRequest := models.EnrolledCourse{
			ID:       0,
			UserID:   payment.UserID,
			CourseID: payment.CourseID,
			Paid:     payment.Paid,
			PaidDate: tmstmp,
		}

		db.DB.Where("user_id = ? AND course_id = ?",
			payment.UserID, payment.CourseID).Updates(&DbPaymentRequest)

	}

	ctx.JSON(http.StatusOK, gin.H{"success": "Payments updated successfully"})
}
