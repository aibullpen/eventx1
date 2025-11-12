# Google Cloud Project Setup Guide

This guide walks you through configuring your Google Cloud Project for the Event Management System.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter project name: `event-management-system` (or your preferred name)
5. Click "Create"
6. Wait for the project to be created and select it

## Step 2: Enable Required APIs

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for and enable each of the following APIs:

### Google OAuth 2.0 API
- Search for "Google+ API" or "Google Identity"
- Click on it and click "Enable"

### Google Sheets API
- Search for "Google Sheets API"
- Click on it and click "Enable"

### Google Forms API
- Search for "Google Forms API"
- Click on it and click "Enable"

### Gmail API
- Search for "Gmail API"
- Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services > OAuth consent screen**
2. Select **External** user type (unless you have a Google Workspace account)
3. Click "Create"

### App Information
- **App name**: Event Management System
- **User support email**: Your email address
- **App logo**: (Optional) Upload a logo
- **Application home page**: Your frontend URL (e.g., `http://localhost:3000` for development)
- **Application privacy policy link**: (Optional for testing)
- **Application terms of service link**: (Optional for testing)

### Developer Contact Information
- **Email addresses**: Your email address

4. Click "Save and Continue"

### Scopes
5. Click "Add or Remove Scopes"
6. Add the following scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/forms.body`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/drive.file`

7. Click "Update" and then "Save and Continue"

### Test Users (for development)
8. Click "Add Users"
9. Add your email address and any other test users
10. Click "Save and Continue"

11. Review the summary and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Client Credentials

1. Go to **APIs & Services > Credentials**
2. Click "Create Credentials" > "OAuth client ID"
3. Select **Application type**: Web application
4. **Name**: Event Management System Web Client

### Authorized JavaScript origins
Add the following origins:
- `http://localhost:3000` (for frontend development)
- `http://localhost:5000` (for backend development)
- Your production frontend URL (when deploying)

### Authorized redirect URIs
Add the following redirect URIs:
- `http://localhost:5000/api/auth/google/callback` (for backend development)
- Your production backend URL + `/api/auth/google/callback` (when deploying)

5. Click "Create"

### Save Your Credentials
6. A dialog will appear with your **Client ID** and **Client Secret**
7. **IMPORTANT**: Copy these values immediately and store them securely
8. You can also download the JSON file for backup

## Step 5: Set Up Environment Variables

Create a `.env` file in your backend directory with the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_random_session_secret_here

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Node Environment
NODE_ENV=development
```

**Generate a secure session secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 6: Verify Configuration

After completing the setup:

1. ✅ Google Cloud Project created
2. ✅ OAuth 2.0 API enabled
3. ✅ Google Sheets API enabled
4. ✅ Google Forms API enabled
5. ✅ Gmail API enabled
6. ✅ OAuth consent screen configured
7. ✅ OAuth 2.0 client credentials created
8. ✅ Environment variables configured

## Important Notes

### Development vs Production

- **Development**: Use `http://localhost` URLs
- **Production**: Update OAuth consent screen and credentials with production URLs

### API Quotas

- Google APIs have usage quotas
- Monitor usage in Google Cloud Console > APIs & Services > Dashboard
- Request quota increases if needed

### Security Best Practices

- Never commit `.env` files to version control
- Add `.env` to `.gitignore`
- Use different credentials for development and production
- Rotate credentials periodically
- Restrict API key usage by IP address in production

### Testing OAuth Flow

Before proceeding to the next task, test that:
1. You can access the OAuth consent screen
2. The redirect URI works correctly
3. You receive the client ID and secret

## Troubleshooting

### "Access blocked: This app's request is invalid"
- Check that all redirect URIs are correctly configured
- Ensure the OAuth consent screen is properly set up

### "Error 403: access_denied"
- Add your email to test users in OAuth consent screen
- Verify all required scopes are added

### "redirect_uri_mismatch"
- Ensure the redirect URI in your code matches exactly what's configured in Google Cloud Console
- Check for trailing slashes and http vs https

## Next Steps

Once you've completed this setup, you can proceed to task 2.2: Implement authentication service and endpoints.
