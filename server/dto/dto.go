package dto

import "time"

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Remember bool   `json:"remember"`
	Role     string `json:"role"`
}

type RegisterRequest struct {
	Email     string `json:"email"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Password  string `json:"password"`
	Role      string `json:"role"`
}

type LessonRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	CourseID    uint   `json:"courseId"`
}

////////////////////////////////////////

type UserResponse struct {
	ID         uint       `json:"id"`
	Email      string     `json:"email"`
	FirstName  string     `json:"firstName"`
	LastName   string     `json:"lastName"`
	Role       string     `json:"role"`
	Registered time.Time  `json:"registered"`
	LastLogin  *time.Time `json:"lastLogin"`
	Avatar     *string    `json:"avatar"`
}

type CourseResponse struct {
	ID           uint         `json:"id"`
	Name         string       `json:"name"`
	Description  string       `json:"description"`
	PreviewImage string       `json:"previewImage"`
	Duration     string       `json:"duration"`
	Teacher      UserResponse `json:"teacher"`
}

type ParticipantResponse struct {
	ID        uint      `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	Avatar    string    `json:"avatar"`
	Paid      bool      `json:"paid"`
	EndDate   time.Time `json:"end_date"`
	StartDate time.Time `json:"start_date"`
}
