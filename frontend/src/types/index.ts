export interface User {
  id: string;
  name: string;
  email: string;
  eventSheetId: string;
}

export interface Event {
  id: string;
  organizerId: string;
  name: string;
  location: string;
  description: string;
  instructor: string;
  date: Date;
  formId?: string;
  formUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum AttendanceStatus {
  PENDING = 'pending',
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
  MAYBE = 'maybe'
}

export interface Attendee {
  id: string;
  eventId: string;
  email: string;
  name?: string;
  attendanceStatus: AttendanceStatus;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
