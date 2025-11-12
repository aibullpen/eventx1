# Design Document

## Overview

행사 관리 웹서비스는 Google 생태계를 활용한 풀스택 웹 애플리케이션입니다. Google OAuth를 통한 인증, Google Sheets API를 데이터베이스로 활용, Google Forms API로 참석 확인 폼 생성, Gmail API로 초대 이메일 발송을 구현합니다.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React SPA (Single Page Application)          │   │
│  │  - Authentication UI                                 │   │
│  │  - Event Management Dashboard                        │   │
│  │  - Event Detail Pages                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Node.js + Express Server                │   │
│  │  - Authentication Service                            │   │
│  │  - Event Service                                     │   │
│  │  - Attendee Service                                  │   │
│  │  - Email Service                                     │   │
│  │  - Google Integration Service                        │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Google APIs
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Services Layer                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  OAuth   │  │  Sheets  │  │  Forms   │  │  Gmail   │   │
│  │   API    │  │   API    │  │   API    │  │   API    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18+ with TypeScript
- React Router for navigation
- Axios for API calls
- Material-UI or Tailwind CSS for UI components
- React Query for state management and caching

**Backend:**
- Node.js 18+ with Express
- TypeScript
- Google APIs Node.js Client
- Passport.js for OAuth authentication
- Express Session for session management

**External Services:**
- Google OAuth 2.0 for authentication
- Google Sheets API for data storage
- Google Forms API for attendance forms
- Gmail API for email sending

**Deployment:**
- Frontend: Vercel or Netlify
- Backend: Railway, Render, or Google Cloud Run
- Environment: Docker containers (optional)

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components

**LoginPage**
- Google login button
- Handles OAuth redirect flow
- Stores authentication token in session

**ProtectedRoute**
- Wraps authenticated pages
- Redirects to login if not authenticated

#### 2. Event Management Components

**EventDashboard**
- Lists all events for the logged-in organizer
- Shows "Create Event" button when no events exist
- Displays event cards with title, date, and attendee count

**EventCreateForm**
- Form fields: name, location, description, instructor, date
- Validation for required fields
- Submit handler to create event

**EventDetailPage**
- Displays event information
- Attendee list with status
- Add attendee section (single email, Excel upload, Google Sheets link)
- Send invitation button
- Copy event button

**AttendeeList**
- Table showing attendee email and attendance status
- Real-time updates when form responses received

**AttendeeRegistration**
- Input for single email
- File upload for Excel
- Input for Google Sheets link
- Validation and submission

### Backend Services

#### 1. AuthenticationService

```typescript
interface AuthenticationService {
  // Initialize Google OAuth flow
  initiateGoogleAuth(): string; // Returns auth URL
  
  // Handle OAuth callback
  handleGoogleCallback(code: string): Promise<UserSession>;
  
  // Create new user account
  createUser(googleProfile: GoogleProfile): Promise<User>;
  
  // Get existing user
  getUser(googleId: string): Promise<User | null>;
}
```

#### 2. EventService

```typescript
interface EventService {
  // Create new event
  createEvent(organizerId: string, eventData: EventData): Promise<Event>;
  
  // Get all events for organizer
  getEventsByOrganizer(organizerId: string): Promise<Event[]>;
  
  // Get single event
  getEvent(eventId: string): Promise<Event>;
  
  // Copy existing event
  copyEvent(eventId: string, newEventData: Partial<EventData>): Promise<Event>;
  
  // Update event
  updateEvent(eventId: string, eventData: Partial<EventData>): Promise<Event>;
}
```

#### 3. AttendeeService

```typescript
interface AttendeeService {
  // Add single attendee
  addAttendee(eventId: string, email: string): Promise<Attendee>;
  
  // Add multiple attendees from Excel
  addAttendeesFromExcel(eventId: string, file: Buffer): Promise<Attendee[]>;
  
  // Add attendees from Google Sheets
  addAttendeesFromSheets(eventId: string, sheetUrl: string): Promise<Attendee[]>;
  
  // Get attendees for event
  getAttendees(eventId: string): Promise<Attendee[]>;
  
  // Update attendance status
  updateAttendanceStatus(attendeeId: string, status: AttendanceStatus): Promise<void>;
}
```

#### 4. GoogleSheetsService

```typescript
interface GoogleSheetsService {
  // Create event sheet for new user
  createEventSheet(userId: string): Promise<string>; // Returns sheet ID
  
  // Store event data
  storeEvent(sheetId: string, event: Event): Promise<void>;
  
  // Store attendee data
  storeAttendees(sheetId: string, eventId: string, attendees: Attendee[]): Promise<void>;
  
  // Update attendance status
  updateAttendanceStatus(sheetId: string, attendeeId: string, status: AttendanceStatus): Promise<void>;
  
  // Read attendees from external sheet
  readAttendeesFromSheet(sheetUrl: string): Promise<string[]>; // Returns emails
  
  // Sync data from sheet
  syncFromSheet(sheetId: string): Promise<void>;
}
```

#### 5. GoogleFormsService

```typescript
interface GoogleFormsService {
  // Create attendance form
  createAttendanceForm(event: Event): Promise<GoogleForm>;
  
  // Get form responses
  getFormResponses(formId: string): Promise<FormResponse[]>;
  
  // Setup form response webhook
  setupFormWebhook(formId: string, webhookUrl: string): Promise<void>;
}
```

#### 6. EmailService

```typescript
interface EmailService {
  // Send invitation emails
  sendInvitations(
    attendees: Attendee[],
    event: Event,
    formUrl: string
  ): Promise<EmailResult[]>;
  
  // Generate email content
  generateInvitationEmail(event: Event, formUrl: string): string;
}
```

## Data Models

### User

```typescript
interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  eventSheetId: string; // Google Sheets ID
  createdAt: Date;
  updatedAt: Date;
}
```

### Event

```typescript
interface Event {
  id: string;
  organizerId: string;
  name: string;
  location: string;
  description: string;
  instructor: string;
  date: Date;
  formId?: string; // Google Form ID
  formUrl?: string; // Google Form URL
  createdAt: Date;
  updatedAt: Date;
}
```

### Attendee

```typescript
interface Attendee {
  id: string;
  eventId: string;
  email: string;
  name?: string;
  attendanceStatus: AttendanceStatus;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum AttendanceStatus {
  PENDING = 'pending',
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
  MAYBE = 'maybe'
}
```

### EventData (for creation/update)

```typescript
interface EventData {
  name: string;
  location: string;
  description: string;
  instructor: string;
  date: Date;
}
```

### GoogleProfile

```typescript
interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
}
```

## API Endpoints

### Authentication

```
POST   /api/auth/google          - Initiate Google OAuth
GET    /api/auth/google/callback - Handle OAuth callback
GET    /api/auth/me              - Get current user
POST   /api/auth/logout          - Logout user
```

### Events

```
POST   /api/events               - Create new event
GET    /api/events               - Get all events for current user
GET    /api/events/:id           - Get single event
POST   /api/events/:id/copy      - Copy event
PUT    /api/events/:id           - Update event
DELETE /api/events/:id           - Delete event
```

### Attendees

```
POST   /api/events/:id/attendees              - Add single attendee
POST   /api/events/:id/attendees/bulk         - Add multiple attendees
POST   /api/events/:id/attendees/from-excel   - Add from Excel file
POST   /api/events/:id/attendees/from-sheets  - Add from Google Sheets
GET    /api/events/:id/attendees              - Get all attendees
PUT    /api/attendees/:id/status              - Update attendance status
```

### Invitations

```
POST   /api/events/:id/send-invitations - Create form and send emails
```

### Webhooks

```
POST   /api/webhooks/form-response - Receive Google Form responses
```

## Google Sheets Structure

각 사용자의 Event Sheet는 다음과 같은 구조를 가집니다:

### Events Tab

| Event ID | Name | Location | Description | Instructor | Date | Form ID | Form URL | Created At |
|----------|------|----------|-------------|------------|------|---------|----------|------------|

### Attendees Tab

| Attendee ID | Event ID | Email | Name | Status | Response Date | Created At |
|-------------|----------|-------|------|--------|---------------|------------|

## Google Forms Structure

자동 생성되는 Google Form은 다음 필드를 포함합니다:

1. **이름** (Short answer, required)
2. **이메일** (Email, required, pre-filled from invitation)
3. **참석 여부** (Multiple choice, required)
   - 참석합니다
   - 불참합니다
   - 미정입니다
4. **추가 메시지** (Long answer, optional)

Form 제목: `[행사명] 참석 확인`
Form 설명: 행사 세부 정보 (날짜, 장소, 강사, 내용)

## Authentication Flow

1. User clicks "Google 로그인" button
2. Frontend redirects to `/api/auth/google`
3. Backend initiates OAuth flow with Google
4. User authenticates with Google
5. Google redirects to `/api/auth/google/callback` with auth code
6. Backend exchanges code for access token and refresh token
7. Backend retrieves user profile from Google
8. If new user:
   - Create user record
   - Create Event Sheet in user's Google Drive
   - Store sheet ID with user
9. Backend creates session and returns session token
10. Frontend stores token and redirects to dashboard

## Event Creation and Invitation Flow

1. User fills event creation form
2. Frontend sends POST to `/api/events`
3. Backend creates event record
4. Backend stores event in Google Sheets
5. Frontend navigates to event detail page
6. User adds attendees (single, Excel, or Sheets)
7. Backend stores attendees in Google Sheets
8. User clicks "행사 초대" button
9. Backend creates Google Form with event details
10. Backend generates invitation email with form link
11. Backend sends emails to all attendees via Gmail API
12. Attendees receive email and click form link
13. Attendees fill and submit form
14. Google Form triggers webhook to `/api/webhooks/form-response`
15. Backend updates attendance status in Google Sheets
16. Frontend polls or receives real-time update
17. Event detail page shows updated attendance status

## Error Handling

### Authentication Errors

- **OAuth failure**: Display error message, allow retry
- **Token expiration**: Refresh token automatically, retry request
- **Invalid session**: Redirect to login page

### Google API Errors

- **Sheets API failure**: Log error, display user-friendly message, suggest manual sheet access
- **Forms API failure**: Log error, provide manual form creation instructions
- **Gmail API failure**: Log failed emails, display list of failed recipients, allow retry

### Validation Errors

- **Invalid email format**: Display inline validation error
- **Missing required fields**: Highlight fields, prevent submission
- **Duplicate attendee**: Display warning, allow override

### Network Errors

- **Request timeout**: Display retry button
- **Connection lost**: Queue actions, sync when reconnected

## Testing Strategy

### Unit Tests

- Service layer methods (EventService, AttendeeService, etc.)
- Data validation functions
- Email template generation
- Excel parsing logic

### Integration Tests

- Google OAuth flow
- Google Sheets API integration
- Google Forms API integration
- Gmail API integration
- API endpoint responses

### End-to-End Tests

- Complete user registration flow
- Event creation and management
- Attendee registration (all methods)
- Invitation sending and form submission
- Attendance status updates

### Manual Testing

- Cross-browser compatibility
- Mobile responsiveness
- Email rendering in different clients
- Google Sheets external editing sync

## Security Considerations

1. **OAuth Tokens**: Store securely, use refresh tokens, implement token rotation
2. **API Keys**: Store in environment variables, never commit to repository
3. **Session Management**: Use secure, httpOnly cookies, implement CSRF protection
4. **Input Validation**: Sanitize all user inputs, validate email formats
5. **Rate Limiting**: Implement rate limits on API endpoints
6. **CORS**: Configure appropriate CORS policies
7. **Google API Scopes**: Request minimum necessary scopes
8. **Data Access**: Ensure users can only access their own events and attendees

## Performance Optimization

1. **Caching**: Cache Google Sheets data, invalidate on updates
2. **Batch Operations**: Batch Google API requests when possible
3. **Lazy Loading**: Load attendee lists on demand
4. **Pagination**: Paginate event lists and attendee lists
5. **Debouncing**: Debounce search and filter operations
6. **Connection Pooling**: Reuse Google API client connections

## Deployment Considerations

### Environment Variables

```
GOOGLE_CLIENT_ID=<OAuth client ID>
GOOGLE_CLIENT_SECRET=<OAuth client secret>
GOOGLE_REDIRECT_URI=<OAuth redirect URI>
SESSION_SECRET=<Session encryption key>
FRONTEND_URL=<Frontend application URL>
BACKEND_URL=<Backend API URL>
NODE_ENV=production
```

### Google Cloud Project Setup

1. Create Google Cloud Project
2. Enable APIs:
   - Google OAuth 2.0
   - Google Sheets API
   - Google Forms API
   - Gmail API
3. Create OAuth 2.0 credentials
4. Configure OAuth consent screen
5. Add authorized redirect URIs

### Database Migration Strategy

Since we're using Google Sheets as the database, no traditional migration is needed. However:

1. Define sheet structure version in metadata
2. Implement backward-compatible reads
3. Provide migration scripts for structure changes
4. Backup sheets before major updates
