import { Attendee, AttendanceStatus } from '../models/Attendee';
import { GoogleSheetsService } from './GoogleSheetsService';
import { OAuth2Client } from 'google-auth-library';
import * as ExcelJS from 'exceljs';

export class AttendeeService {
  private static instance: AttendeeService;
  private attendees: Map<string, Attendee> = new Map(); // In-memory storage
  private oauth2Client: OAuth2Client | null = null;

  private constructor() {}

  public static getInstance(): AttendeeService {
    if (!AttendeeService.instance) {
      AttendeeService.instance = new AttendeeService();
    }
    return AttendeeService.instance;
  }

  public setOAuth2Client(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
  }

  /**
   * Add single attendee to an event
   * Creates attendee record and stores it in Google Sheets
   */
  async addAttendee(eventId: string, eventSheetId: string, email: string): Promise<Attendee> {
    try {
      if (!this.oauth2Client) {
        throw new Error('OAuth2Client is not set in AttendeeService.');
      }

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
      const sheetsService = GoogleSheetsService.getInstance();
      sheetsService.setOAuth2Client(this.oauth2Client);
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
    status: AttendanceStatus,
    name?: string,
    responseDate?: Date
  ): Promise<void> {
    try {
      if (!this.oauth2Client) {
        throw new Error('OAuth2Client is not set in AttendeeService.');
      }

      const attendee = this.attendees.get(attendeeId);
      
      if (!attendee) {
        throw new Error(`Attendee ${attendeeId} not found`);
      }

      // Update status, name, and response date
      attendee.attendanceStatus = status;
      attendee.name = name || attendee.name; // Update name if provided
      attendee.responseDate = responseDate || new Date();
      attendee.updatedAt = new Date();

      // Update in memory
      this.attendees.set(attendeeId, attendee);

      // Update in Google Sheets
      const sheetsService = GoogleSheetsService.getInstance();
      sheetsService.setOAuth2Client(this.oauth2Client);

      // --- [디버깅 로그 추가] ---
      console.log('--- [GoogleSheetsService.updateAttendanceStatus] 호출 전 파라미터 확인 ---');
      console.log('1. eventSheetId:', eventSheetId);
      console.log('2. attendeeId:', attendeeId);
      console.log('3. status:', status);
      console.log('4. name:', name);
      console.log('5. responseDate:', responseDate);
      console.log('--------------------------------------------------------------------');

      await sheetsService.updateAttendanceStatus(eventSheetId, attendeeId, status, name, responseDate);

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
      // Parse Excel file using ExcelJS
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);
      
      // Get first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('Excel file is empty');
      }
      
      // Extract emails from all cells
      const emails = new Set<string>();
      
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          const value = cell.value;
          if (value && typeof value === 'string') {
            const trimmed = value.trim();
            if (this.isValidEmail(trimmed)) {
              emails.add(trimmed.toLowerCase());
            }
          }
        });
      });
      
      if (emails.size === 0) {
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
      const sheetsService = GoogleSheetsService.getInstance();
      sheetsService.setOAuth2Client(this.oauth2Client!);
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
