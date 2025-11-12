import api from './api';
import { Event } from '../types';

export const eventService = {
  /**
   * Get all events for the current user
   */
  async getEvents(): Promise<Event[]> {
    const response = await api.get<Event[]>('/events');
    return response.data;
  },

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string): Promise<Event> {
    const response = await api.get<Event>(`/events/${eventId}`);
    return response.data;
  },

  /**
   * Create a new event
   */
  async createEvent(eventData: {
    name: string;
    location: string;
    description: string;
    instructor: string;
    date: Date;
  }): Promise<Event> {
    const response = await api.post<Event>('/events', eventData);
    return response.data;
  },

  /**
   * Copy an existing event
   */
  async copyEvent(eventId: string, eventData: {
    name: string;
    location: string;
    description: string;
    instructor: string;
    date: Date;
  }): Promise<Event> {
    const response = await api.post<Event>(`/events/${eventId}/copy`, eventData);
    return response.data;
  },

  /**
   * Send invitation emails to all attendees
   */
  async sendInvitations(eventId: string): Promise<{
    message: string;
    formUrl: string;
    formId: string;
    results: {
      total: number;
      sent: number;
      failed: number;
      failures: Array<{ email: string; error: string }>;
    };
  }> {
    const response = await api.post(`/events/${eventId}/send-invitations`);
    return response.data;
  },
};
