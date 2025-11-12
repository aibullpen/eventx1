# Production Environment Setup Script (PowerShell)
# This script helps set up production environment variables

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Event Management System - Production Setup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.production already exists
if (Test-Path ".env.production") {
    Write-Host "⚠️  .env.production already exists!" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Copy template
Copy-Item ".env.production.example" ".env.production"
Write-Host "✅ Created .env.production from template" -ForegroundColor Green
Write-Host ""

# Generate SESSION_SECRET
Write-Host "🔐 Generating secure SESSION_SECRET..." -ForegroundColor Cyan
$SESSION_SECRET = -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
Write-Host "✅ Generated SESSION_SECRET" -ForegroundColor Green
Write-Host ""

# Prompt for Google OAuth credentials
Write-Host "📝 Please enter your Google OAuth credentials:" -ForegroundColor Cyan
Write-Host "(You can find these in Google Cloud Console > APIs & Services > Credentials)"
Write-Host ""

$GOOGLE_CLIENT_ID = Read-Host "Google Client ID"
$GOOGLE_CLIENT_SECRET = Read-Host "Google Client Secret"
Write-Host ""

# Prompt for domain information
Write-Host "🌐 Please enter your domain information:" -ForegroundColor Cyan
$FRONTEND_URL = Read-Host "Frontend URL (e.g., https://yourdomain.com)"
$BACKEND_URL = Read-Host "Backend URL (e.g., https://api.yourdomain.com)"
Write-Host ""

# Calculate GOOGLE_REDIRECT_URI
$GOOGLE_REDIRECT_URI = "$BACKEND_URL/api/auth/google/callback"

# Calculate ALLOWED_ORIGINS
$ALLOWED_ORIGINS = $FRONTEND_URL
if ($FRONTEND_URL -match "^https://") {
    $DOMAIN = $FRONTEND_URL -replace "^https://", ""
    if ($DOMAIN -notmatch "^www\.") {
        $ALLOWED_ORIGINS = "$ALLOWED_ORIGINS,https://www.$DOMAIN"
    }
}

# Read and update .env.production
$content = Get-Content ".env.production"
$content = $content -replace "GOOGLE_CLIENT_ID=.*", "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
$content = $content -replace "GOOGLE_CLIENT_SECRET=.*", "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET"
$content = $content -replace "GOOGLE_REDIRECT_URI=.*", "GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI"
$content = $content -replace "SESSION_SECRET=.*", "SESSION_SECRET=$SESSION_SECRET"
$content = $content -replace "FRONTEND_URL=.*", "FRONTEND_URL=$FRONTEND_URL"
$content = $content -replace "BACKEND_URL=.*", "BACKEND_URL=$BACKEND_URL"
$content = $content -replace "ALLOWED_ORIGINS=.*", "ALLOWED_ORIGINS=$ALLOWED_ORIGINS"
$content | Set-Content ".env.production"

Write-Host ""
Write-Host "✅ Production environment configured successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  Frontend URL: $FRONTEND_URL"
Write-Host "  Backend URL: $BACKEND_URL"
Write-Host "  OAuth Redirect URI: $GOOGLE_REDIRECT_URI"
Write-Host "  Allowed Origins: $ALLOWED_ORIGINS"
Write-Host ""
Write-Host "⚠️  Important Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Add the OAuth Redirect URI to Google Cloud Console:"
Write-Host "     $GOOGLE_REDIRECT_URI"
Write-Host "  2. Add allowed origins to Google Cloud Console:"
Write-Host "     $ALLOWED_ORIGINS"
Write-Host "  3. Review and update .env.production if needed"
Write-Host "  4. Never commit .env.production to version control!"
Write-Host ""
Write-Host "🚀 Ready to deploy!" -ForegroundColor Green
