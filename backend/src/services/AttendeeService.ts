import { Attendee, AttendanceStatus } from '../models/Attendee';
import { GoogleSheetsService } from './GoogleSheetsService';
import { OAuth2Client } from 'google-auth-library';
import * as XLSX from 'xlsx';

export class AttendeeService {
  private attendees: Map<string, Attendee> = new Map(); // In-memory storage
  private oauth2Client: OAuth2Client;

  constructor(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
  }

  /**
   * Add single attendee to an event
   * Creates attendee record and stores it in Google Sheets
   */
  async addAttendee(eventId: string, eventSheetId: string, email: string): Promise<Attendee> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      // Check for duplicate attendee
      const existingAttendee = this.findAttendeeByEventAndEmail(eventId, email);
      if (existingAttendee) {
        throw new Error('Attendee already registered for this event');
      }

      // Generate unique attendee ID
      const attendeeId = `attendee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create attendee object
      const attendee: Attendee = {
        id: attendeeId,
        eventId,
        email: email.toLowerCase().trim(),
        attendanceStatus: AttendanceStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store in memory
      this.attendees.set(attendeeId, attendee);

      // Store in Google Sheets
      const sheetsService = new GoogleSheetsService(this.oauth2Client);
      await sheetsService.storeAttendees(eventSheetId, eventId, [attendee]);

      console.log(`Added attendee ${attendeeId} to event ${eventId}`);
      return attendee;
    } catch (error) {
      console.error('Error adding attendee:', error);
      throw error;
    }
  }

  /**
   * Get all attendees for an event
   * Returns list of attendees registered for the specified event
   */
  async getAttendees(eventId: string): Promise<Attendee[]> {
    try {
      const eventAttendees: Attendee[] = [];
      
      for (const attendee of this.attendees.values()) {
        if (attendee.eventId === eventId) {
          eventAttendees.push(attendee);
        }
      }

      // Sort by creation date (oldest first)
      eventAttendees.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

      console.log(`Retrieved ${eventAttendees.length} attendees for event ${eventId}`);
      return eventAttendees;
    } catch (error) {
      console.error('Error getting attendees:', error);
      throw new Error('Failed to retrieve attendees');
    }
  }

  /**
   * Update attendance status for an attendee
   * Updates status in memory and Google Sheets
   */
  async updateAttendanceStatus(
    attendeeId: string,
    eventSheetId: string,
    status: AttendanceStatus
  ): Promise<void> {
    try {
      const attendee = this.attendees.get(attendeeId);
      
      if (!attendee) {
        throw new Error(`Attendee ${attendeeId} not found`);
      }

      // Update status
      attendee.attendanceStatus = status;
      attendee.responseDate = new Date();
      attendee.updatedAt = new Date();

      // Update in memory
      this.attendees.set(attendeeId, attendee);

      // Update in Google Sheets
      const sheetsService = new GoogleSheetsService(this.oauth2Client);
      await sheetsService.updateAttendanceStatus(eventSheetId, attendeeId, status);

      console.log(`Updated attendance status for attendee ${attendeeId} to ${status}`);
    } catch (error) {
      console.error('Error updating attendance status:', error);
      throw error;
    }
  }

  /**
   * Add multiple attendees from Excel file
   * Parses Excel file and adds all valid email addresses
   */
  async addAttendeesFromExcel(eventId: string, eventSheetId: string, fileBuffer: Buffer): Promise<Attendee[]> {
    try {
      // Parse Excel file
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      
      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error('Excel file is empty');
      }
      
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert sheet to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Extract emails from all cells
      const emails = this.parseEmailsFromData(data as any[][]);
      
      if (emails.length === 0) {
        throw new Error('No valid email addresses found in Excel file');
      }

      // Add attendees
      const addedAttendees: Attendee[] = [];
      const errors: string[] = [];

      for (const email of emails) {
        try {
          // Check if already exists
          const existing = this.findAttendeeByEventAndEmail(eventId, email);
          if (existing) {
            console.log(`Skipping duplicate attendee: ${email}`);
            continue;
          }

          const attendee = await this.addAttendee(eventId, eventSheetId, email);
          addedAttendees.push(attendee);
        } catch (error: any) {
          errors.push(`${email}: ${error.message}`);
        }
      }

      console.log(`Added ${addedAttendees.length} attendees from Excel file to event ${eventId}`);
      
      if (errors.length > 0) {
        console.warn(`Failed to add ${errors.length} attendees:`, errors);
      }

      return addedAttendees;
    } catch (error) {
      console.error('Error adding attendees from Excel:', error);
      throw error;
    }
  }

  /**
   * Add multiple attendees from Google Sheets
   * Reads external Google Sheet and adds all valid email addresses
   */
  async addAttendeesFromSheets(eventId: string, eventSheetId: string, sheetUrl: string): Promise<Attendee[]> {
    try {
      // Read emails from external sheet
      const sheetsService = new GoogleSheetsService(this.oauth2Client);
      const emails = await sheetsService.readAttendeesFromSheet(sheetUrl);
      
      if (emails.length === 0) {
        throw new Error('No valid email addresses found in Google Sheet');
      }

      // Add attendees
      const addedAttendees: Attendee[] = [];
      const errors: string[] = [];

      for (const email of emails) {
        try {
          // Check if already exists
          const existing = this.findAttendeeByEventAndEmail(eventId, email);
          if (existing) {
            console.log(`Skipping duplicate attendee: ${email}`);
            continue;
          }

          const attendee = await this.addAttendee(eventId, eventSheetId, email);
          addedAttendees.push(attendee);
        } catch (error: any) {
          errors.push(`${email}: ${error.message}`);
        }
      }

      console.log(`Added ${addedAttendees.length} attendees from Google Sheets to event ${eventId}`);
      
      if (errors.length > 0) {
        console.warn(`Failed to add ${errors.length} attendees:`, errors);
      }

      return addedAttendees;
    } catch (error) {
      console.error('Error adding attendees from Google Sheets:', error);
      throw error;
    }
  }

  /**
   * Parse email addresses from Excel data
   * Looks for valid email patterns in all cells
   */
  private parseEmailsFromData(data: any[][]): string[] {
    const emails = new Set<string>();

    for (const row of data) {
      for (const cell of row) {
        if (cell && typeof cell === 'string') {
          const trimmed = cell.trim();
          if (this.isValidEmail(trimmed)) {
            emails.add(trimmed.toLowerCase());
          }
        }
      }
    }

    return Array.from(emails);
  }

  /**
   * Validate email format
   * Returns true if email is valid, false otherwise
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Find attendee by event ID and email
   * Returns attendee if found, undefined otherwise
   */
  private findAttendeeByEventAndEmail(eventId: string, email: string): Attendee | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    
    for (const attendee of this.attendees.values()) {
      if (attendee.eventId === eventId && attendee.email === normalizedEmail) {
        return attendee;
      }
    }
    
    return undefined;
  }
}
