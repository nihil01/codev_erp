package routes

import (
	"codev_erp/endpoints/course_handlers"
	"codev_erp/endpoints/middleware"

	"github.com/gin-gonic/gin"
)

func CourseRoutes(r *gin.Engine) {

	r.GET("/courses/:id", course_handlers.GetCoursesHandler)
	r.GET("/courses", course_handlers.GetCoursesHandler)
	r.POST("/courses", middleware.CheckAdmin(), course_handlers.AddCourseHandler)
	r.DELETE("/courses/:id", middleware.CheckAdmin(), course_handlers.DeleteCourseHandler)
	r.GET("/courses/:id/participants", middleware.CheckAdmin(), course_handlers.GetCourseParticipantsHandler)
	r.POST("/courses/:id/participants", middleware.CheckAdmin(), course_handlers.AddParticipantHandler)
	r.DELETE("/courses/:id/participants/:studentId", middleware.CheckAdmin(), course_handlers.RemoveParticipantHandler)

}
