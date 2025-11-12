#!/bin/bash

# Production Environment Setup Script
# This script helps set up production environment variables

set -e

echo "=========================================="
echo "Event Management System - Production Setup"
echo "=========================================="
echo ""

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    echo "⚠️  .env.production already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Copy template
cp .env.production.example .env.production

echo "✅ Created .env.production from template"
echo ""

# Generate SESSION_SECRET
echo "🔐 Generating secure SESSION_SECRET..."
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "✅ Generated SESSION_SECRET"
echo ""

# Prompt for Google OAuth credentials
echo "📝 Please enter your Google OAuth credentials:"
echo "(You can find these in Google Cloud Console > APIs & Services > Credentials)"
echo ""

read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Prompt for domain information
echo "🌐 Please enter your domain information:"
read -p "Frontend URL (e.g., https://yourdomain.com): " FRONTEND_URL
read -p "Backend URL (e.g., https://api.yourdomain.com): " BACKEND_URL
echo ""

# Calculate GOOGLE_REDIRECT_URI
GOOGLE_REDIRECT_URI="${BACKEND_URL}/api/auth/google/callback"

# Calculate ALLOWED_ORIGINS
ALLOWED_ORIGINS="${FRONTEND_URL}"
if [[ $FRONTEND_URL == https://* ]]; then
    DOMAIN=$(echo $FRONTEND_URL | sed 's|https://||')
    if [[ $DOMAIN != www.* ]]; then
        ALLOWED_ORIGINS="${ALLOWED_ORIGINS},https://www.${DOMAIN}"
    fi
fi

# Update .env.production file
sed -i.bak "s|GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}|" .env.production
sed -i.bak "s|GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}|" .env.production
sed -i.bak "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=${GOOGLE_REDIRECT_URI}|" .env.production
sed -i.bak "s|SESSION_SECRET=.*|SESSION_SECRET=${SESSION_SECRET}|" .env.production
sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=${FRONTEND_URL}|" .env.production
sed -i.bak "s|BACKEND_URL=.*|BACKEND_URL=${BACKEND_URL}|" .env.production
sed -i.bak "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=${ALLOWED_ORIGINS}|" .env.production

# Remove backup file
rm .env.production.bak

echo ""
echo "✅ Production environment configured successfully!"
echo ""
echo "📋 Summary:"
echo "  Frontend URL: ${FRONTEND_URL}"
echo "  Backend URL: ${BACKEND_URL}"
echo "  OAuth Redirect URI: ${GOOGLE_REDIRECT_URI}"
echo "  Allowed Origins: ${ALLOWED_ORIGINS}"
echo ""
echo "⚠️  Important Next Steps:"
echo "  1. Add the OAuth Redirect URI to Google Cloud Console:"
echo "     ${GOOGLE_REDIRECT_URI}"
echo "  2. Add allowed origins to Google Cloud Console:"
echo "     ${ALLOWED_ORIGINS}"
echo "  3. Review and update .env.production if needed"
echo "  4. Never commit .env.production to version control!"
echo ""
echo "🚀 Ready to deploy!"
