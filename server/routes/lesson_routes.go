package routes

import (
	"codev_erp/endpoints/lesson_handlers"
	"codev_erp/endpoints/middleware"

	"github.com/gin-gonic/gin"
)

func LessonRoutes(r *gin.Engine) {

	r.GET("/lessons/:id", lesson_handlers.GetLessonsHandler)
	r.DELETE("/lessons/:id", middleware.ValidateUser("teacher"), lesson_handlers.DeleteLessonHandler)
	r.POST("/lessons", middleware.ValidateUser("teacher"), lesson_handlers.AddLessonHandler)

	r.POST("/lesson_tasks", middleware.ValidateUser("teacher"), lesson_handlers.AddTasksHandler)
	r.POST("/lesson_tasks/screenrecord", middleware.ValidateUser("teacher"), lesson_handlers.ScreenRecordHandler)
	r.GET("/lesson_tasks/:id", lesson_handlers.GetLessonTasksHandler)
	r.GET("/lesson_tasks/download/:file", lesson_handlers.FileDownloadHandler)

	r.POST("/lesson_tasks/homework", lesson_handlers.SubmitHomeworkHandler)
	r.GET("/lesson_tasks/list_homeworks/:id", middleware.ValidateUser("teacher"), lesson_handlers.ListHomeworkHandler)
	r.POST("/lesson_tasks/submissions/:id", middleware.ValidateUser("teacher"), lesson_handlers.GradeHomeworkHandler)

	r.GET("/lesson_tasks/get_grades", lesson_handlers.ViewGradesHandler)
}
