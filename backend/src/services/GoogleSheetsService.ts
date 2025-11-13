import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Event } from '../models/Event';
import { Attendee, AttendanceStatus } from '../models/Attendee';

export class GoogleSheetsService {
  private static instance: GoogleSheetsService;
  private sheets: sheets_v4.Sheets | null = null;
  private oauth2Client: OAuth2Client | null = null;

  private constructor() {}

  public static getInstance(): GoogleSheetsService {
    if (!GoogleSheetsService.instance) {
      GoogleSheetsService.instance = new GoogleSheetsService();
    }
    return GoogleSheetsService.instance;
  }

  public setOAuth2Client(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client });
  }

  /**
   * Create Event Sheet for new user
   * Creates a new Google Spreadsheet with Events and Attendees tabs
   * Returns the sheet ID
   */
  async createEventSheet(userId: string, userName: string): Promise<string> {
    try {
      if (!this.sheets) {
        throw new Error('GoogleSheetsService is not initialized. Call setOAuth2Client first.');
      }

      // Create new spreadsheet
      const spreadsheet = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `행사 관리 시스템 - ${userName}`
          },
          sheets: [
            {
              properties: {
                title: 'Events',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            },
            {
              properties: {
                title: 'Attendees',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            }
          ]
        }
      });

      const sheetId = spreadsheet.data.spreadsheetId!;

      // Get the actual sheet IDs from the response instead of hardcoding 0 and 1
      const eventsSheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId;
      const attendeesSheetId = spreadsheet.data.sheets?.[1]?.properties?.sheetId;

      if (eventsSheetId === undefined || attendeesSheetId === undefined) {
        throw new Error('Failed to retrieve sheet IDs from newly created spreadsheet.');
      }

      // Initialize Events tab with headers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Events!A1:I1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Event ID',
            'Name',
            'Location',
            'Description',
            'Instructor',
            'Date',
            'Form ID',
            'Form URL',
            'Created At'
          ]]
        }
      });

      // Initialize Attendees tab with headers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: 'Attendees!A1:G1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[
            'Attendee ID',
            'Event ID',
            'Email',
            'Name',
            'Status',
            'Response Date',
            'Created At'
          ]]
        }
      });

      // Format headers (bold)
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: eventsSheetId, // Use dynamic sheet ID
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true
                    }
                  }
                },
                fields: 'userEnteredFormat.textFormat.bold'
              }
            },
            {
              repeatCell: {
                range: {
                  sheetId: attendeesSheetId, // Use dynamic sheet ID
                  startRowIndex: 0,
                  endRowIndex: 1
                },
                cell: {
                  userEnteredFormat: {
                    textFormat: {
                      bold: true
                    }
                  }
                },
                fields: 'userEnteredFormat.textFormat.bold'
              }
            }
          ]
        }
      });

      console.log(`Created Event Sheet for user ${userId}: ${sheetId}`);
      return sheetId;
    } catch (error) {
      console.error('Error creating Event Sheet:', error);
      throw new Error('Failed to create Event Sheet');
    }
  }

  /**
   * Store event data in Google Sheets
   */
  async storeEvent(sheetId: string, event: Event): Promise<void> {
    try {
      if (!this.sheets) {
        throw new Error('GoogleSheetsService is not initialized. Call setOAuth2Client first.');
      }

      const values = [[
        event.id,
        event.name,
        event.location,
        event.description,
        event.instructor,
        event.date.toISOString(),
        event.formId || '',
        event.formUrl || '',
        event.createdAt.toISOString()
      ]];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Events!A:I',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      console.log(`Stored event ${event.id} in sheet ${sheetId}`);
    } catch (error) {
      console.error('Error storing event:', error);
      throw new Error('Failed to store event in Google Sheets');
    }
  }

  /**
   * Store attendee data in Google Sheets
   */
  async storeAttendees(sheetId: string, eventId: string, attendees: Attendee[]): Promise<void> {
    try {
      if (!this.sheets) {
        throw new Error('GoogleSheetsService is not initialized. Call setOAuth2Client first.');
      }

      if (!attendees || attendees.length === 0) {
        return;
      }

      const values = attendees.map(attendee => [
        attendee.id,
        attendee.eventId,
        attendee.email,
        attendee.name || '',
        attendee.attendanceStatus,
        attendee.responseDate ? attendee.responseDate.toISOString() : '',
        attendee.createdAt.toISOString()
      ]);

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Attendees!A:G',
        valueInputOption: 'RAW',
        requestBody: {
          values
        }
      });

      console.log(`Stored ${attendees.length} attendees for event ${eventId} in sheet ${sheetId}`);
    } catch (error) {
      console.error('Error storing attendees:', error);
      throw new Error('Failed to store attendees in Google Sheets');
    }
  }

  /**
   * Update attendance status in Google Sheets
   */
  async updateAttendanceStatus(
    sheetId: string,
    attendeeId: string,
    status: AttendanceStatus,
    name?: string,
    responseDate?: Date
  ): Promise<void> {
    try {
      if (!this.sheets) {
        throw new Error('GoogleSheetsService is not initialized. Call setOAuth2Client first.');
      }

      // Get all attendees to find the row
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Attendees!A:G'
      });

      const rows = response.data.values;
      if (!rows || rows.length <= 1) {
        throw new Error('No attendees found in sheet');
      }

      // Find the row with matching attendee ID (skip header row)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][0] === attendeeId) {
          rowIndex = i + 1; // +1 because sheets are 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        throw new Error(`Attendee ${attendeeId} not found in sheet`);
      }

      // Prepare values to update
      const currentName = rows[rowIndex - 1][3]; // Get current name from sheet
      const valuesToUpdate = [
        name || currentName, // Update name if provided, otherwise keep current
        status,
        responseDate ? responseDate.toISOString() : new Date().toISOString()
      ];

      // Update name (column D), status (column E), and response date (column F)
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Attendees!D${rowIndex}:F${rowIndex}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [valuesToUpdate]
        }
      });

      console.log(`Updated attendance status for attendee ${attendeeId} to ${status}`);
    } catch (error) {
      console.error('Error updating attendance status:', error);
      throw new Error('Failed to update attendance status in Google Sheets');
    }
  }

  /**
   * Read attendees from external Google Sheet
   * Extracts sheet ID from URL and reads email addresses
   */
  async readAttendeesFromSheet(sheetUrl: string): Promise<string[]> {
    try {
      if (!this.sheets) {
        throw new Error('GoogleSheetsService is not initialized. Call setOAuth2Client first.');
      }

      // Extract sheet ID from URL
      const sheetId = this.extractSheetIdFromUrl(sheetUrl);
      if (!sheetId) {
        throw new Error('Invalid Google Sheets URL');
      }

      // Read all data from the first sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A:Z' // Read all columns
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      // Parse email addresses from all cells
      const emails = this.parseEmailsFromRows(rows);
      
      console.log(`Read ${emails.length} email addresses from sheet ${sheetId}`);
      return emails;
    } catch (error: any) {
      console.error('Error reading attendees from sheet:', error);
      
      // Provide more specific error messages
      if (error.code === 404) {
        throw new Error('Google Sheet not found. Please check the URL and ensure the sheet is shared.');
      } else if (error.code === 403) {
        throw new Error('Access denied. Please ensure the sheet is shared with appropriate permissions.');
      } else if (error.message === 'Invalid Google Sheets URL') {
        throw error;
      } else {
        throw new Error('Failed to read attendees from Google Sheet');
      }
    }
  }

  /**
   * Extract sheet ID from various Google Sheets URL formats
   */
  private extractSheetIdFromUrl(url: string): string | null {
    // Handle different URL formats:
    // https://docs.google.com/spreadsheets/d/{id}/edit...
    // https://docs.google.com/spreadsheets/d/{id}
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/ // Direct ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Parse email addresses from sheet rows
   * Looks for valid email patterns in all cells
   */
  private parseEmailsFromRows(rows: any[][]): string[] {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emails = new Set<string>();

    for (const row of rows) {
      for (const cell of row) {
        if (cell && typeof cell === 'string') {
          const trimmed = cell.trim();
          if (emailRegex.test(trimmed)) {
            emails.add(trimmed.toLowerCase());
          }
        }
      }
    }

    return Array.from(emails);
  }
}
