package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const lsActivateURL   = "https://api.lemonsqueezy.com/v1/licenses/activate"
const lsValidateURL   = "https://api.lemonsqueezy.com/v1/licenses/validate"
const lsDeactivateURL = "https://api.lemonsqueezy.com/v1/licenses/deactivate"

// storedLicense is the on-disk representation saved after successful activation.
type storedLicense struct {
	LicenseKey    string `json:"licenseKey"`
	InstanceID    string `json:"instanceId"`
	CustomerName  string `json:"customerName"`
	CustomerEmail string `json:"customerEmail"`
	ActivatedAt   string `json:"activatedAt"`
}

// LicenseStatus is returned to the frontend.
type LicenseStatus struct {
	Activated     bool   `json:"activated"`
	CustomerName  string `json:"customerName"`
	CustomerEmail string `json:"customerEmail"`
	MaskedKey     string `json:"maskedKey"`
	Error         string `json:"error,omitempty"`
}

// licensePath returns the path to the stored license file.
func licensePath() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	appDir := filepath.Join(dir, "PolyField-Track")
	if err := os.MkdirAll(appDir, 0755); err != nil {
		return "", err
	}
	return filepath.Join(appDir, "license.json"), nil
}

func loadStoredLicense() (*storedLicense, error) {
	path, err := licensePath()
	if err != nil {
		return nil, err
	}
	data, err := os.ReadFile(path)
	if os.IsNotExist(err) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var lic storedLicense
	if err := json.Unmarshal(data, &lic); err != nil {
		return nil, err
	}
	return &lic, nil
}

func saveStoredLicense(lic *storedLicense) error {
	path, err := licensePath()
	if err != nil {
		return err
	}
	data, err := json.MarshalIndent(lic, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0644)
}

// maskKey shows only the first segment, masks the rest.
// e.g. "ABCD-1234-EFGH-5678" → "ABCD-****-****-****"
func maskKey(key string) string {
	parts := strings.Split(key, "-")
	if len(parts) < 2 {
		if len(key) <= 4 {
			return "****"
		}
		return key[:4] + strings.Repeat("*", len(key)-4)
	}
	masked := make([]string, len(parts))
	for i, p := range parts {
		if i == 0 {
			masked[i] = p
		} else {
			masked[i] = strings.Repeat("*", len(p))
		}
	}
	return strings.Join(masked, "-")
}

func instanceName() string {
	host, err := os.Hostname()
	if err != nil {
		return "PolyField-Track"
	}
	return host
}

// GetLicenseStatus returns the current license state from the local store.
// Called on startup — no network required.
func (app *App) GetLicenseStatus() LicenseStatus {
	lic, err := loadStoredLicense()
	if err != nil || lic == nil {
		return LicenseStatus{Activated: false}
	}
	return LicenseStatus{
		Activated:     true,
		CustomerName:  lic.CustomerName,
		CustomerEmail: lic.CustomerEmail,
		MaskedKey:     maskKey(lic.LicenseKey),
	}
}

// ActivateLicense validates the key with LemonSqueezy and saves it locally.
func (app *App) ActivateLicense(key string) LicenseStatus {
	key = strings.TrimSpace(key)
	if key == "" {
		return LicenseStatus{Error: "Please enter a license key"}
	}

	type lsInstance struct {
		ID string `json:"id"`
	}
	type lsMeta struct {
		CustomerName  string `json:"customer_name"`
		CustomerEmail string `json:"customer_email"`
	}
	type lsResponse struct {
		Activated bool       `json:"activated"`
		Error     string     `json:"error"`
		Instance  lsInstance `json:"instance"`
		Meta      lsMeta     `json:"meta"`
	}

	resp, err := http.PostForm(lsActivateURL, url.Values{
		"license_key":   {key},
		"instance_name": {instanceName()},
	})
	if err != nil {
		return LicenseStatus{Error: "Could not reach activation server — check your internet connection and try again"}
	}
	defer resp.Body.Close()

	var result lsResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return LicenseStatus{Error: "Unexpected response from activation server"}
	}

	if !result.Activated {
		msg := result.Error
		if msg == "" {
			msg = "License key not recognised"
		}
		return LicenseStatus{Error: msg}
	}

	lic := &storedLicense{
		LicenseKey:    key,
		InstanceID:    result.Instance.ID,
		CustomerName:  result.Meta.CustomerName,
		CustomerEmail: result.Meta.CustomerEmail,
		ActivatedAt:   time.Now().Format(time.RFC3339),
	}
	if err := saveStoredLicense(lic); err != nil {
		return LicenseStatus{Error: "Activated but could not save license file: " + err.Error()}
	}

	return LicenseStatus{
		Activated:     true,
		CustomerName:  lic.CustomerName,
		CustomerEmail: lic.CustomerEmail,
		MaskedKey:     maskKey(key),
	}
}

// DeactivateLicense notifies LemonSqueezy and removes the local license file.
func (app *App) DeactivateLicense() LicenseStatus {
	lic, err := loadStoredLicense()
	if err != nil || lic == nil {
		return LicenseStatus{Activated: false}
	}

	// Best-effort — don't block on network failure
	http.PostForm(lsDeactivateURL, url.Values{ //nolint:errcheck
		"license_key": {lic.LicenseKey},
		"instance_id": {lic.InstanceID},
	})

	path, _ := licensePath()
	os.Remove(path) //nolint:errcheck
	return LicenseStatus{Activated: false}
}
