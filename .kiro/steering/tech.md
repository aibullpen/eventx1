# Technology Stack

## Architecture

Full-stack web application with React SPA frontend and Node.js/Express backend, integrated with Google services ecosystem.

## Frontend

- React 18+ with TypeScript
- React Router for navigation
- Axios for API communication
- Material-UI or Tailwind CSS for UI components
- React Query for state management and caching

## Backend

- Node.js 18+ with Express
- TypeScript
- Google APIs Node.js Client
- Passport.js for OAuth authentication
- Express Session for session management

## External Services

- Google OAuth 2.0 (authentication)
- Google Sheets API (data storage)
- Google Forms API (attendance forms)
- Gmail API (email sending)

## Development Tools

- ESLint and Prettier for code formatting
- TypeScript for type safety

## Common Commands

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start development server

# Build
npm run build        # Production build

# Testing
npm test            # Run tests
npm run test:watch  # Run tests in watch mode

# Linting
npm run lint        # Check code style
npm run lint:fix    # Fix code style issues
```

## Environment Setup

Copy `.env.example` to `.env` and configure:
- Google OAuth credentials (client ID, secret, redirect URI)
- Session secret
- Application URLs (frontend and backend)
- Port configuration

## Google Cloud Project Requirements

Enable the following APIs in Google Cloud Console:
- Google OAuth 2.0
- Google Sheets API
- Google Forms API
- Gmail API

Create OAuth 2.0 credentials and configure the consent screen with authorized redirect URIs.
