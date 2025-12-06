package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type LocalStorage struct {
	BaseDir string
	BaseURL string
}

func NewLocalStorage(baseDir, baseURL string) *LocalStorage {
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		log.Fatalf("Failed to create storage directory %s: %v", baseDir, err)
	}

	mapsDir := filepath.Join(baseDir, "maps")
	if err := os.MkdirAll(mapsDir, 0755); err != nil {
		log.Fatalf("Failed to create maps subdirectory %s: %v", mapsDir, err)
	}

	return &LocalStorage{BaseDir: baseDir, BaseURL: baseURL}
}

func (s *LocalStorage) Upload(ctx context.Context, file multipart.File, filename string) (publicURL string, storagePath string, err error) {
	fileExt := filepath.Ext(filename)
	uniqueName := uuid.New().String() + "_" + fmt.Sprintf("%d", time.Now().UnixNano()) + fileExt

	storagePath = filepath.Join("maps", uniqueName)
	fullPath := filepath.Join(s.BaseDir, storagePath)

	absPath, _ := filepath.Abs(fullPath)
	log.Printf("DEBUG: Absolute path attempted: %s", absPath)

	dst, err := os.Create(fullPath)
	if err != nil {
		return "", "", fmt.Errorf("failed to create local file: %w", err)
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return "", "", fmt.Errorf("failed to copy file data: %w", err)
	}

	publicURL = s.BaseURL + storagePath
	return publicURL, storagePath, nil
}

func (s *LocalStorage) Delete(ctx context.Context, storagePath string) error {
	fullPath := filepath.Join(s.BaseDir, storagePath)

	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		return nil
	}

	return os.Remove(fullPath)
}
