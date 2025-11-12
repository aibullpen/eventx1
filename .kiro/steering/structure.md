# Project Structure

## Monorepo Organization

The project uses a monorepo structure with separate frontend and backend directories.

```
/
├── frontend/          # React SPA
├── backend/           # Node.js/Express API
├── .env.example       # Environment variable template
├── .gitignore         # Git ignore rules
└── .kiro/
    ├── specs/         # Project specifications
    └── steering/      # AI assistant guidance
```

## Backend Structure

```
backend/
├── src/
│   ├── services/      # Business logic layer
│   │   ├── AuthenticationService.ts
│   │   ├── EventService.ts
│   │   ├── AttendeeService.ts
│   │   ├── GoogleSheetsService.ts
│   │   ├── GoogleFormsService.ts
│   │   └── EmailService.ts
│   ├── routes/        # API endpoints
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── attendees.ts
│   │   └── webhooks.ts
│   ├── middleware/    # Express middleware
│   ├── models/        # TypeScript interfaces
│   └── index.ts       # Application entry point
├── package.json
└── tsconfig.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── components/    # React components
│   │   ├── auth/      # Authentication components
│   │   ├── events/    # Event management components
│   │   └── attendees/ # Attendee management components
│   ├── pages/         # Page-level components
│   ├── services/      # API client and utilities
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript types
│   └── App.tsx        # Root component
├── package.json
└── tsconfig.json
```

## Key Conventions

- Use TypeScript for all code files
- Service layer handles business logic and external API integration
- API routes are thin controllers that delegate to services
- Components are organized by feature domain
- Shared types/interfaces are defined in dedicated model/type files
- Environment variables are never committed (use .env.example as template)
