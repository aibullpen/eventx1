import { Router, Request, Response } from 'express';
import { AttendeeService } from '../services/AttendeeService';
import { EventService } from '../services/EventService';
import { AuthenticationService } from '../services/AuthenticationService';
import { AttendanceStatus } from '../models/Attendee';

const router = Router();
const authService = new AuthenticationService();

/**
 * POST /api/webhooks/form-response
 * Receive Google Form responses and update attendance status
 * This endpoint is called by Google Forms when a response is submitted
 */
router.post('/form-response', async (req: Request, res: Response) => {
  try {
    console.log('Received form response webhook:', JSON.stringify(req.body, null, 2));

    // Parse form response data
    // Google Forms sends data in various formats depending on configuration
    // We'll handle the most common format
    const { formId, email, name, attendanceStatus, eventId } = req.body;

    // Validate required fields
    if (!formId || !email || !attendanceStatus) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: formId, email, or attendanceStatus'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Map Korean attendance status to enum
    const statusMap: { [key: string]: AttendanceStatus } = {
      '참석합니다': AttendanceStatus.ATTENDING,
      '불참합니다': AttendanceStatus.NOT_ATTENDING,
      '미정입니다': AttendanceStatus.MAYBE
    };

    const mappedStatus = statusMap[attendanceStatus];
    if (!mappedStatus) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Invalid attendance status: ${attendanceStatus}`
      });
    }

    // Find the event by form ID
    // We need to search through all users' events to find the matching form
    // In a production system, this would be optimized with a database index
    let targetEvent = null;
    let targetUser = null;
    let oauth2Client = null;

    // Get all users and search for the event
    const users = authService.getAllUsers();
    
    for (const user of users) {
      // Create OAuth2Client for this user
      oauth2Client = authService.getOAuth2Client();
      oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken
      });

      const eventService = new EventService(oauth2Client);
      const events = await eventService.getEventsByOrganizer(user.id);
      
      const event = events.find(e => e.formId === formId);
      if (event) {
        targetEvent = event;
        targetUser = user;
        break;
      }
    }

    if (!targetEvent || !targetUser || !oauth2Client) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Event with form ID ${formId} not found`
      });
    }

    // Find the attendee by email
    const attendeeService = new AttendeeService(oauth2Client);
    const attendees = await attendeeService.getAttendees(targetEvent.id);
    
    const attendee = attendees.find(a => a.email === normalizedEmail);
    
    if (!attendee) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Attendee with email ${normalizedEmail} not found for this event`
      });
    }

    // Update attendance status
    await attendeeService.updateAttendanceStatus(
      attendee.id,
      targetUser.eventSheetId,
      mappedStatus
    );

    // Update attendee name if provided and not already set
    if (name && !attendee.name) {
      attendee.name = name;
      attendee.updatedAt = new Date();
    }

    console.log(`Updated attendance status for ${normalizedEmail} to ${mappedStatus}`);

    res.json({
      message: '참석 여부가 업데이트되었습니다.',
      attendee: {
        id: attendee.id,
        email: attendee.email,
        name: attendee.name,
        attendanceStatus: mappedStatus,
        responseDate: new Date()
      }
    });
  } catch (error) {
    console.error('Error processing form response:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '폼 응답 처리 중 오류가 발생했습니다.'
    });
  }
});

export default router;
