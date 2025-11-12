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

export enum AttendanceStatus {
  PENDING = 'pending',
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
  MAYBE = 'maybe'
}
