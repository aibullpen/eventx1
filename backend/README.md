# Event Management System - Backend

Node.js/Express backend with Google OAuth authentication and Google APIs integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` from the root directory and configure:
```bash
cp ../.env.example .env
```

3. Configure Google Cloud Project:
   - Enable Google OAuth 2.0, Sheets API, Forms API, and Gmail API
   - Create OAuth 2.0 credentials
   - Add redirect URI: `http://localhost:5000/api/auth/google/callback`

4. Update `.env` with your Google credentials

## Development

Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Health Check

- `GET /health` - Server health check

## Project Structure

```
src/
├── services/          # Business logic
│   └── AuthenticationService.ts
├── routes/            # API endpoints
│   └── auth.ts
├── middleware/        # Express middleware
│   └── auth.ts
├── models/            # TypeScript interfaces
│   └── User.ts
└── index.ts           # Application entry point
```
