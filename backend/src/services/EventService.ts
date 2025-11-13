import { Event, EventData } from '../models/Event';
import { GoogleSheetsService } from './GoogleSheetsService';
import { OAuth2Client } from 'google-auth-library';

export class EventService {
  private static instance: EventService;
  private events: Map<string, Event> = new Map(); // In-memory storage for now
  private oauth2Client: OAuth2Client | null = null;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  // OAuth2Client를 외부에서 주입받도록 변경
  public setOAuth2Client(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
  }

  /**
   * Create new event
   * Creates event record and stores it in Google Sheets
   */
  async createEvent(organizerId: string, eventSheetId: string, eventData: EventData): Promise<Event> {
    try {
      if (!this.oauth2Client) {
        throw new Error('OAuth2Client is not set in EventService.');
      }

      // Generate unique event ID
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create event object
      const event: Event = {
        id: eventId,
        organizerId,
        name: eventData.name,
        location: eventData.location,
        description: eventData.description,
        instructor: eventData.instructor,
        date: eventData.date,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in memory
      this.events.set(eventId, event);

      // Store in Google Sheets
      const sheetsService = GoogleSheetsService.getInstance();
      sheetsService.setOAuth2Client(this.oauth2Client);
      await sheetsService.storeEvent(eventSheetId, event);

      console.log(`Created event ${eventId} for organizer ${organizerId}`);
      return event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  }

  /**
   * Get all events for organizer
   * Returns list of events created by the specified organizer
   */
  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    try {
      const organizerEvents: Event[] = [];
      
      for (const event of this.events.values()) {
        if (event.organizerId === organizerId) {
          organizerEvents.push(event);
        }
      }

      // Sort by date (most recent first)
      organizerEvents.sort((a, b) => b.date.getTime() - a.date.getTime());

      console.log(`Retrieved ${organizerEvents.length} events for organizer ${organizerId}`);
      return organizerEvents || []; // 항상 배열을 반환하도록 보장합니다.
    } catch (error) {
      console.error('Error getting events by organizer:', error);
      throw new Error('Failed to retrieve events');
    }
  }

  /**
   * Get single event by ID
   * Returns event details if found, throws error if not found
   */
  async getEvent(eventId: string): Promise<Event> {
    try {
      const event = this.events.get(eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      console.log(`Retrieved event ${eventId}`);
      return event;
    } catch (error) {
      console.error('Error getting event:', error);
      throw error;
    }
  }

  /**
   * Update event details
   * Updates event record in memory and Google Sheets
   */
  async updateEvent(eventId: string, eventSheetId: string, eventData: Partial<EventData>): Promise<Event> {
    try {
      const event = this.events.get(eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      // Update event fields
      if (eventData.name !== undefined) event.name = eventData.name;
      if (eventData.location !== undefined) event.location = eventData.location;
      if (eventData.description !== undefined) event.description = eventData.description;
      if (eventData.instructor !== undefined) event.instructor = eventData.instructor;
      if (eventData.date !== undefined) event.date = eventData.date;
      
      event.updatedAt = new Date();

      // Update in memory
      this.events.set(eventId, event);

      // Note: For Google Sheets update, we would need to find and update the specific row
      // This is a simplified implementation - full implementation would update the sheet

      console.log(`Updated event ${eventId}`);
      return event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Copy existing event
   * Creates a new event with details copied from the original
   */
  async copyEvent(eventId: string, eventSheetId: string, newEventData: Partial<EventData>): Promise<Event> {
    try {
      const originalEvent = await this.getEvent(eventId);
      
      // Merge original event data with new data
      const eventData: EventData = {
        name: newEventData.name || originalEvent.name,
        location: newEventData.location || originalEvent.location,
        description: newEventData.description || originalEvent.description,
        instructor: newEventData.instructor || originalEvent.instructor,
        date: newEventData.date || originalEvent.date
      };

      // Create new event with copied data
      const newEvent = await this.createEvent(originalEvent.organizerId, eventSheetId, eventData);

      console.log(`Copied event ${eventId} to new event ${newEvent.id}`);
      return newEvent;
    } catch (error) {
      console.error('Error copying event:', error);
      throw new Error('Failed to copy event');
    }
  }

  /**
   * Update event with form information
   * Updates event with Google Form ID and URL
   */
  async updateEventForm(eventId: string, formId: string, formUrl: string): Promise<Event> {
    try {
      const event = this.events.get(eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      // Update form information
      event.formId = formId;
      event.formUrl = formUrl;
      event.updatedAt = new Date();

      // Update in memory
      this.events.set(eventId, event);

      console.log(`Updated event ${eventId} with form ${formId}`);
      return event;
    } catch (error) {
      console.error('Error updating event form:', error);
      throw error;
    }
  }

  /**
   * Delete event
   * Removes event from memory (and would remove from Google Sheets in full implementation)
   */
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const event = this.events.get(eventId);
      
      if (!event) {
        throw new Error(`Event ${eventId} not found`);
      }

      this.events.delete(eventId);

      // Note: Full implementation would also delete from Google Sheets

      console.log(`Deleted event ${eventId}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}
