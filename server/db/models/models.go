package models

import (
	"codev_erp/logger"
	"log/slog"
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID         uint       `gorm:"primaryKey" json:"id"`
	Email      string     `gorm:"unique;not null" json:"email"`
	FirstName  string     `gorm:"not null" json:"firstName"`
	LastName   string     `gorm:"not null" json:"lastName"`
	Password   string     `gorm:"not null" json:"-"`
	Role       string     `gorm:"check: role in ('teacher', 'student', 'admin', 'lead', 'sales')" json:"role"`
	Registered time.Time  `gorm:"default:CURRENT_TIMESTAMP" json:"registered"`
	LastLogin  *time.Time `json:"lastLogin"`
	Avatar     *string    `json:"avatar"`

	// Связи
	CoursesTaught   []Course         `gorm:"foreignKey:TeacherID"` // 1:N (User → Courses)
	EnrolledCourses []EnrolledCourse `gorm:"foreignKey:UserID"`    // 1:N (User → EnrolledCourses)
}

type Course struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	Name         string `gorm:"not null" json:"name"`
	Description  string `gorm:"not null" json:"description"`
	PreviewImage string `gorm:"not null" json:"previewImage"`
	Duration     string `gorm:"not null" json:"duration"`
	Price        string `gorm:"not null" json:"price"`

	TeacherID *uint // внешний ключ
	Teacher   User  `gorm:"foreignKey:TeacherID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;" json:"teacher"`

	Enrolled []EnrolledCourse `gorm:"foreignKey:CourseID"` // связь с EnrolledCourses
}

type EnrolledCourse struct {
	ID        uint `gorm:"primaryKey" json:"-"`
	UserID    uint `gorm:"not null" json:"-"`
	CourseID  uint `gorm:"not null" json:"-"`
	StartDate time.Time
	EndDate   time.Time
	Paid      bool      `json:"paid"`
	PaidDate  time.Time `json:"paid_date"`

	// Референсы (внешние ключи)
	User   User   `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Course Course `gorm:"foreignKey:CourseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type Lesson struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CourseID    uint      `gorm:"not null" json:"courseID"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"not null" json:"description"`
	StartDate   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"startDate"`

	Course Course        `gorm:"foreignKey:CourseID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"course"`
	Tasks  []LessonTasks `gorm:"foreignKey:LessonID" json:"tasks"` // привязка по LessonID
}

type LessonTasks struct {
	ID        uint     `gorm:"primaryKey"`
	LessonID  uint     `gorm:"not null"`
	Homework  []string `gorm:"type:json;serializer:json" json:"homework"`
	Classwork []string `gorm:"type:json;serializer:json" json:"classwork"`

	Lesson Lesson `gorm:"foreignKey:LessonID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"lesson"`
}

type UsersHomework struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null" json:"userID"`
	LessonID  uint      `gorm:"not null" json:"lessonID"`
	Homework  []string  `gorm:"type:json;serializer:json" json:"homework"`
	StartDate time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"startDate"`

	Points  uint   `gorm:"not null;default:0" json:"points"`
	Checked bool   `gorm:"not null;default:false" json:"checked"`
	Comment string `gorm:"type:text" json:"comment"`

	User   User   `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"user"`
	Lesson Lesson `gorm:"foreignKey:LessonID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;" json:"lesson"`
}

type Lead struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Description string    `gorm:"not null;type:text" json:"description"`
	Name        string    `gorm:"not null;type:text" json:"name"`
	Date        time.Time `gorm:"not null;timestamp" json:"date"`
	Phone       string    `gorm:"not null;type:text" json:"phone"`
	Nickname    string    `gorm:"not null;type:text" json:"igNick"`
	Source      string    `gorm:"not null;type:text;check (source in ('dm', 'story', 'wp', 'ad'))" json:"source"`
	Status      string    `gorm:"not null;type:text;check (source in ('new', 'answered', 'awaiting', 'demo'))" json:"status"`
	Author      string    `gorm:"not null;type:text" json:"author"`
	Course      string    `gorm:"not null;type:text" json:"course"`
}

//automatically hash user's password

func (user *User) BeforeCreate(*gorm.DB) (err error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)

	if err != nil {
		logger.Log("Failed to hash password! Error: "+err.Error(), slog.LevelError)
		return err
	}

	user.Password = string(hash)

	return nil
}
