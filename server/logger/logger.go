package logger

import (
	"github.com/natefinch/lumberjack"
	"log/slog"
)

var logger *slog.Logger

func SetupDatabaseLogger() {
	rotator := &lumberjack.Logger{
		Filename:   "./database.log",
		MaxSize:    5,
		MaxBackups: 3,
		MaxAge:     30,
		Compress:   true,
	}

	customLogger := slog.New(slog.NewJSONHandler(rotator, &slog.HandlerOptions{Level: slog.LevelInfo}))
	logger = customLogger

	logger.LogAttrs(nil, slog.LevelInfo, "Logger initialized successfully !")

}

func Log(message string, level slog.Level) {
	if logger != nil {
		logger.LogAttrs(nil, level, message)
	}

}
