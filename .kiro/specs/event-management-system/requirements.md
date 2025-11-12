# Requirements Document

## Introduction

행사 관리 웹서비스는 매월 반복되는 행사를 준비하는 담당자가 참석자들에게 초대 이메일을 발송하고 참석 여부를 효율적으로 관리할 수 있도록 지원하는 시스템입니다. Google 계정 기반 인증, Google Sheets를 데이터베이스로 활용, Google Forms를 통한 참석 확인, 그리고 자동 이메일 발송 기능을 제공합니다.

## Glossary

- **Event Management System**: 행사 관리 웹서비스 전체 시스템
- **Event Organizer**: 행사를 준비하고 관리하는 담당자
- **Event Attendee**: 행사에 초대받은 참석자
- **Event Sheet**: Google Sheets에 자동 생성되는 행사 참여자 관리 시트
- **Invitation Email**: 행사 초대 내용과 Google Form 링크가 포함된 이메일
- **Google Form**: 참석 여부를 확인하기 위해 자동 생성되는 구글 폼
- **Attendance Status**: 참석자의 행사 참석 여부 상태

## Requirements

### Requirement 1

**User Story:** As an Event Organizer, I want to sign in with my Google account, so that I can access the event management system without creating a separate account

#### Acceptance Criteria

1. WHEN an Event Organizer clicks the Google login button on the main page, THE Event Management System SHALL initiate Google OAuth authentication flow
2. WHEN a new Event Organizer completes Google authentication for the first time, THE Event Management System SHALL create a new user account using the Google account name as the username and Google email as the email address
3. WHEN a new Event Organizer account is created, THE Event Management System SHALL automatically create an Event Sheet in the Event Organizer's Google Sheets
4. WHEN an existing Event Organizer completes Google authentication, THE Event Management System SHALL log the Event Organizer into their existing account
5. WHEN Google authentication fails, THE Event Management System SHALL display an error message to the Event Organizer

### Requirement 2

**User Story:** As an Event Organizer, I want to create a new event with details, so that I can manage event information and invite attendees

#### Acceptance Criteria

1. WHEN an Event Organizer has no existing events, THE Event Management System SHALL display only the create event button on the main page
2. WHEN an Event Organizer has existing events, THE Event Management System SHALL display the titles of all existing events on the main page
3. WHEN an Event Organizer clicks the create event button, THE Event Management System SHALL display a form with fields for event name, location, description, instructor, and date
4. WHEN an Event Organizer submits the event creation form with all required fields filled, THE Event Management System SHALL create a new event record
5. WHEN an Event Organizer submits the event creation form with missing required fields, THE Event Management System SHALL display validation error messages

### Requirement 3

**User Story:** As an Event Organizer, I want to view event details on a dedicated page, so that I can see all information about a specific event

#### Acceptance Criteria

1. WHEN an event is successfully created, THE Event Management System SHALL navigate to the event detail page
2. WHEN an Event Organizer accesses an event detail page, THE Event Management System SHALL display the event name, location, description, instructor, and date
3. WHEN an Event Organizer accesses an event detail page, THE Event Management System SHALL display an attendee registration section
4. WHEN an Event Organizer accesses an event detail page, THE Event Management System SHALL display a list of registered attendees
5. WHEN an Event Organizer accesses an event detail page for a non-existent event, THE Event Management System SHALL display an error message

### Requirement 4

**User Story:** As an Event Organizer, I want to add attendees to an event using multiple methods, so that I can efficiently register participants

#### Acceptance Criteria

1. WHEN an Event Organizer enters a single email address in the attendee registration form, THE Event Management System SHALL add the attendee to the event attendee list
2. WHEN an Event Organizer uploads an Excel file containing email addresses, THE Event Management System SHALL parse the file and add all valid email addresses to the event attendee list
3. WHEN an Event Organizer provides a Google Sheets link containing email addresses, THE Event Management System SHALL access the sheet and add all valid email addresses to the event attendee list
4. WHEN an Event Organizer adds attendees through any method, THE Event Management System SHALL store the attendee information in the Event Sheet
5. WHEN an Event Organizer attempts to add an invalid email address, THE Event Management System SHALL display a validation error message

### Requirement 5

**User Story:** As an Event Organizer, I want to send invitation emails with an automatically generated Google Form, so that attendees can confirm their participation

#### Acceptance Criteria

1. WHEN an Event Organizer clicks the send invitation button on the event detail page, THE Event Management System SHALL automatically create a Google Form with event details
2. WHEN the Google Form is created, THE Event Management System SHALL include fields for attendee name, email, and attendance confirmation
3. WHEN the Google Form is created, THE Event Management System SHALL generate an Invitation Email containing the event details and Google Form link
4. WHEN the Invitation Email is generated, THE Event Management System SHALL send the email to all registered attendees
5. WHEN the email sending process fails for any attendee, THE Event Management System SHALL log the error and continue sending to remaining attendees

### Requirement 6

**User Story:** As an Event Organizer, I want to see updated attendance status when attendees respond to the invitation, so that I can track who will attend the event

#### Acceptance Criteria

1. WHEN an Event Attendee submits the Google Form with their attendance confirmation, THE Event Management System SHALL receive the form response
2. WHEN a form response is received, THE Event Management System SHALL update the Attendance Status in the Event Sheet
3. WHEN a form response is received, THE Event Management System SHALL update the Attendance Status on the event detail page attendee list
4. WHEN an Event Organizer views the event detail page, THE Event Management System SHALL display the current Attendance Status for each attendee
5. WHEN an Event Attendee submits multiple responses, THE Event Management System SHALL update the Attendance Status with the most recent response

### Requirement 7

**User Story:** As an Event Organizer, I want to copy an existing event to create a new one, so that I can reuse event details for recurring monthly events

#### Acceptance Criteria

1. WHEN an Event Organizer views an event detail page, THE Event Management System SHALL display a copy event button
2. WHEN an Event Organizer clicks the copy event button, THE Event Management System SHALL create a new event with all details copied from the original event
3. WHEN an event is copied, THE Event Management System SHALL allow the Event Organizer to modify the event name, location, description, instructor, and date before saving
4. WHEN an event is copied, THE Event Management System SHALL copy the attendee list from the original event to the new event
5. WHEN a copied event is saved, THE Event Management System SHALL create a new event record with the modified details and copied attendee list

### Requirement 8

**User Story:** As an Event Organizer, I want the system to integrate with Google Sheets as a database, so that I can access and manage event data directly in my Google account

#### Acceptance Criteria

1. WHEN an Event Organizer creates an event, THE Event Management System SHALL store event details in the Event Sheet
2. WHEN an Event Organizer adds attendees, THE Event Management System SHALL append attendee records to the Event Sheet
3. WHEN attendee Attendance Status is updated, THE Event Management System SHALL modify the corresponding row in the Event Sheet
4. WHEN the Event Sheet is modified externally by the Event Organizer, THE Event Management System SHALL reflect the changes on the event detail page within 5 minutes
5. WHEN the Event Management System cannot access the Event Sheet, THE Event Management System SHALL display an error message to the Event Organizer
