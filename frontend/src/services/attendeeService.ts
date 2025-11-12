import api from './api';
import { Attendee, AttendanceStatus } from '../types';

export const attendeeService = {
  /**
   * Get all attendees for an event
   */
  async getAttendees(eventId: string): Promise<Attendee[]> {
    const response = await api.get<Attendee[]>(`/events/${eventId}/attendees`);
    return response.data;
  },

  /**
   * Add a single attendee
   */
  async addAttendee(eventId: string, email: string): Promise<Attendee> {
    const response = await api.post<Attendee>(`/events/${eventId}/attendees`, {
      email,
    });
    return response.data;
  },

  /**
   * Add attendees from Excel file
   */
  async addAttendeesFromExcel(
    eventId: string,
    file: File
  ): Promise<Attendee[]> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Attendee[]>(
      `/events/${eventId}/attendees/from-excel`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Add attendees from Google Sheets
   */
  async addAttendeesFromSheets(
    eventId: string,
    sheetUrl: string
  ): Promise<Attendee[]> {
    const response = await api.post<Attendee[]>(
      `/events/${eventId}/attendees/from-sheets`,
      { sheetUrl }
    );
    return response.data;
  },

  /**
   * Update attendee status
   */
  async updateAttendanceStatus(
    attendeeId: string,
    status: AttendanceStatus
  ): Promise<void> {
    await api.put(`/attendees/${attendeeId}/status`, { status });
  },
};
