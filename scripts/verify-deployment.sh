#!/bin/bash

# Deployment Verification Script
# This script checks if the deployment is successful

set -e

echo "=========================================="
echo "Deployment Verification"
echo "=========================================="
echo ""

# Check if environment variables are provided
if [ -z "$BACKEND_URL" ]; then
    read -p "Backend URL (e.g., https://api.yourdomain.com): " BACKEND_URL
fi

if [ -z "$FRONTEND_URL" ]; then
    read -p "Frontend URL (e.g., https://yourdomain.com): " FRONTEND_URL
fi

echo ""
echo "🔍 Checking backend health..."

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/health")

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo "✅ Backend is healthy (HTTP $BACKEND_HEALTH)"
else
    echo "❌ Backend health check failed (HTTP $BACKEND_HEALTH)"
    exit 1
fi

echo ""
echo "🔍 Checking frontend..."

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend check failed (HTTP $FRONTEND_STATUS)"
    exit 1
fi

echo ""
echo "🔍 Checking CORS configuration..."

# Check CORS headers
CORS_HEADERS=$(curl -s -I -X OPTIONS "${BACKEND_URL}/api/events" \
    -H "Origin: ${FRONTEND_URL}" \
    -H "Access-Control-Request-Method: GET" | grep -i "access-control")

if [ -n "$CORS_HEADERS" ]; then
    echo "✅ CORS headers are present"
    echo "$CORS_HEADERS"
else
    echo "⚠️  CORS headers not found (this might be expected)"
fi

echo ""
echo "🔍 Checking SSL/HTTPS..."

if [[ $BACKEND_URL == https://* ]]; then
    echo "✅ Backend is using HTTPS"
else
    echo "⚠️  Backend is not using HTTPS (not recommended for production)"
fi

if [[ $FRONTEND_URL == https://* ]]; then
    echo "✅ Frontend is using HTTPS"
else
    echo "⚠️  Frontend is not using HTTPS (not recommended for production)"
fi

echo ""
echo "=========================================="
echo "✅ Deployment verification completed!"
echo "=========================================="
echo ""
echo "📋 Summary:"
echo "  Backend URL: $BACKEND_URL"
echo "  Frontend URL: $FRONTEND_URL"
echo "  Backend Status: Healthy"
echo "  Frontend Status: Accessible"
echo ""
echo "🎉 Your application is ready to use!"
