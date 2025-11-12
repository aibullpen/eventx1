# Deployment Verification Script (PowerShell)
# This script checks if the deployment is successful

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deployment Verification" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if environment variables are provided
if (-not $env:BACKEND_URL) {
    $BACKEND_URL = Read-Host "Backend URL (e.g., https://api.yourdomain.com)"
} else {
    $BACKEND_URL = $env:BACKEND_URL
}

if (-not $env:FRONTEND_URL) {
    $FRONTEND_URL = Read-Host "Frontend URL (e.g., https://yourdomain.com)"
} else {
    $FRONTEND_URL = $env:FRONTEND_URL
}

Write-Host ""
Write-Host "🔍 Checking backend health..." -ForegroundColor Cyan

# Check backend health
try {
    $backendResponse = Invoke-WebRequest -Uri "$BACKEND_URL/health" -UseBasicParsing
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy (HTTP $($backendResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed (HTTP $($backendResponse.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Checking frontend..." -ForegroundColor Cyan

# Check frontend
try {
    $frontendResponse = Invoke-WebRequest -Uri $FRONTEND_URL -UseBasicParsing
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible (HTTP $($frontendResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend check failed (HTTP $($frontendResponse.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Checking SSL/HTTPS..." -ForegroundColor Cyan

if ($BACKEND_URL -match "^https://") {
    Write-Host "✅ Backend is using HTTPS" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend is not using HTTPS (not recommended for production)" -ForegroundColor Yellow
}

if ($FRONTEND_URL -match "^https://") {
    Write-Host "✅ Frontend is using HTTPS" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend is not using HTTPS (not recommended for production)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment verification completed!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  Backend URL: $BACKEND_URL"
Write-Host "  Frontend URL: $FRONTEND_URL"
Write-Host "  Backend Status: Healthy"
Write-Host "  Frontend Status: Accessible"
Write-Host ""
Write-Host "🎉 Your application is ready to use!" -ForegroundColor Green
