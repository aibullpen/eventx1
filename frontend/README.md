# Event Management System - Frontend

React SPA for the Event Management System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
copy .env.example .env
```

3. Start development server:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues

## Authentication Flow

1. User clicks "Google로 로그인" button on login page
2. Frontend calls `/api/auth/google` to get OAuth URL
3. User is redirected to Google for authentication
4. Google redirects back to `/api/auth/google/callback`
5. Backend creates session and redirects to `/dashboard`
6. Protected routes check authentication status via `/api/auth/me`

## Project Structure

```
src/
├── components/
│   └── auth/          # Authentication components
├── pages/             # Page components
├── services/          # API client and services
├── types/             # TypeScript types
├── App.tsx            # Root component with routing
├── main.tsx           # Application entry point
└── index.css          # Global styles
```
