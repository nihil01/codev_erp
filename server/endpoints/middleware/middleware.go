package middleware

import (
	"codev_erp/dto"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

func RateLimiter(limiter *rate.Limiter) gin.HandlerFunc {

	return func(c *gin.Context) {
		if limiter.Allow() {

			c.Next()

		} else {

			c.AbortWithStatusJSON(429, gin.H{"error": "Too many requests"})
			return

		}

	}

}

func CheckAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userData := session.Get("user")

		if userData == nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: no session"})
			return
		}

		sessionUser, ok := userData.(dto.UserResponse)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: invalid session format"})
			return
		}

		if sessionUser.Role != "admin" {
			c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden: admin only"})
			return
		}

		c.Next()
	}
}

func CheckStaff() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userData := session.Get("user")

		if userData == nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: no session"})
			return
		}

		sessionUser, ok := userData.(dto.UserResponse)
		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized: invalid session format"})
			return
		}

		if sessionUser.Role != "staff" {
			c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden: admin only"})
			return
		}

		c.Next()
	}
}
