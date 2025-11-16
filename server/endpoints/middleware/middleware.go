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

func ValidateUser(userRole string) gin.HandlerFunc {

	return func(c *gin.Context) {

		session := sessions.Default(c)

		userData := session.Get("user")

		if userData == nil {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			return
		}

		user, ok := userData.(dto.UserResponse)

		if !ok {
			c.AbortWithStatusJSON(401, gin.H{"error": "Unauthorized"})
			return
		}

		if user.Role == userRole {
			c.Next()

		} else {
			c.AbortWithStatusJSON(403, gin.H{"error": "Forbidden"})
			return

		}

	}

}
