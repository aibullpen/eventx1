import { Router, Request, Response } from 'express';
import { EventService } from '../services/EventService';
import { AttendeeService } from '../services/AttendeeService';
import { GoogleFormsService } from '../services/GoogleFormsService';
import { EmailService } from '../services/EmailService';
import { AuthenticationService } from '../services/AuthenticationService';
import { requireAuth } from '../middleware/auth';
import { EventData } from '../models/Event';

const router = Router();

// Helper function to get OAuth2Client with credentials from session
const getOAuth2Client = (req: Request) => {
  const oauth2Client = AuthenticationService.getInstance().getOAuth2Client();
  
  // Set credentials from session if available
  if (req.session && (req.session as any).accessToken) {
    oauth2Client.setCredentials({
      access_token: (req.session as any).accessToken,
      refresh_token: (req.session as any).refreshToken
    });
  }
  
  return oauth2Client;
};

// Helper function to get EventService with OAuth2Client from session
const getEventService = (req: Request): EventService => {
  const eventService = EventService.getInstance();
  eventService.setOAuth2Client(getOAuth2Client(req));
  return eventService;
};

// Helper function to get AttendeeService with OAuth2Client from session
const getAttendeeService = (req: Request): AttendeeService => {
  const attendeeService = AttendeeService.getInstance();
  attendeeService.setOAuth2Client(getOAuth2Client(req));
  return attendeeService;
};

// Helper function to get GoogleFormsService with OAuth2Client from session
const getGoogleFormsService = (req: Request): GoogleFormsService => {
  const formsService = GoogleFormsService.getInstance();
  formsService.setOAuth2Client(getOAuth2Client(req));
  return formsService;
};

// Helper function to get EmailService with OAuth2Client from session
const getEmailService = (req: Request): EmailService => {
  const emailService = EmailService.getInstance();
  emailService.setOAuth2Client(getOAuth2Client(req));
  return emailService;
};

/**
 * POST /api/events
 * Create new event
 * Requires authentication
 */
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = AuthenticationService.getInstance().getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // Validate request body
    const { name, location, description, instructor, date } = req.body;

    if (!name || !location || !description || !instructor || !date) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '모든 필수 필드를 입력해주세요.'
      });
    }

    // Create event data
    const eventData: EventData = {
      name,
      location,
      description,
      instructor,
      date: new Date(date)
    };

    // Create event
    const eventService = getEventService(req);
    const event = await eventService.createEvent(user.id, user.eventSheetId, eventData);

    // 생성된 이벤트 객체를 바로 반환하여 프론트엔드에서 id를 쉽게 사용하도록 합니다.
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '행사 생성 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/events
 * Get all events for current user
 * Requires authentication
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = AuthenticationService.getInstance().getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // Get events for user
    const eventService = getEventService(req);
    const events = await eventService.getEventsByOrganizer(user.id);

    res.json({ events }); // 이미 올바르게 되어 있다면 변경사항이 없습니다.
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: '행사 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/events/:id
 * Get single event by ID
 * Requires authentication
 */
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = AuthenticationService.getInstance().getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const eventId = req.params.id;

    // Get event
    const eventService = getEventService(req);
    const event = await eventService.getEvent(eventId);

    // Verify event belongs to user
    if (event.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    res.json({
      event: {
        id: event.id,
        organizerId: event.organizerId,
        name: event.name,
        location: event.location,
        description: event.description,
        instructor: event.instructor,
        date: event.date,
        formId: event.formId,
        formUrl: event.formUrl,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error getting event:', error);
    
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: '행사를 찾을 수 없습니다.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: '행사 정보를 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/events/:id/copy
 * Copy existing event with optional modifications
 * Requires authentication
 */
router.post('/:id/copy', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = AuthenticationService.getInstance().getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const eventId = req.params.id;

    // Get original event to verify ownership
    const eventService = getEventService(req);
    const originalEvent = await eventService.getEvent(eventId);

    // Verify event belongs to user
    if (originalEvent.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    // Get optional modifications from request body
    const { name, location, description, instructor, date } = req.body;

    // Create new event data with modifications
    const newEventData: Partial<EventData> = {};
    if (name !== undefined) newEventData.name = name;
    if (location !== undefined) newEventData.location = location;
    if (description !== undefined) newEventData.description = description;
    if (instructor !== undefined) newEventData.instructor = instructor;
    if (date !== undefined) newEventData.date = new Date(date);

    // Copy event
    const copiedEvent = await eventService.copyEvent(eventId, user.eventSheetId, newEventData);

    // Note: Attendee list copying will be handled by AttendeeService when implemented (Task 5)

    res.status(201).json({
      message: '행사가 복사되었습니다.',
      event: {
        id: copiedEvent.id,
        organizerId: copiedEvent.organizerId,
        name: copiedEvent.name,
        location: copiedEvent.location,
        description: copiedEvent.description,
        instructor: copiedEvent.instructor,
        date: copiedEvent.date,
        formId: copiedEvent.formId,
        formUrl: copiedEvent.formUrl,
        createdAt: copiedEvent.createdAt,
        updatedAt: copiedEvent.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error copying event:', error);
    
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: '행사를 찾을 수 없습니다.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: '행사 복사 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/events/:id/send-invitations
 * Create Google Form and send invitation emails to all attendees
 * Requires authentication
 */
router.post('/:id/send-invitations', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = AuthenticationService.getInstance().getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const eventId = req.params.id;

    // Get event and verify ownership
    const eventService = getEventService(req);
    const event = await eventService.getEvent(eventId);

    if (event.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    // Get attendees for the event
    const attendeeService = getAttendeeService(req);
    const attendees = await attendeeService.getAttendees(eventId);

    if (attendees.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '초대할 참석자가 없습니다. 먼저 참석자를 등록해주세요.'
      });
    }

    // Create Google Form for attendance confirmation
    const formsService = getGoogleFormsService(req);
    let formUrl: string;
    let formId: string;

    if (event.formUrl && event.formId) {
      // Use existing form if already created
      formUrl = event.formUrl;
      formId = event.formId;
      console.log(`Using existing form for event ${eventId}: ${formId}`);
    } else {
      // Create new form
      const form = await formsService.createAttendanceForm(event);
      formUrl = form.formUrl;
      formId = form.formId;

      // Update event with form information
      await eventService.updateEventForm(eventId, formId, formUrl);

      console.log(`Created new form for event ${eventId}: ${formId}`);
    }

    // Send invitation emails
    const emailService = getEmailService(req);
    const emailResults = await emailService.sendInvitations(attendees, event, formUrl);

    // Count successes and failures
    const successCount = emailResults.filter(r => r.success).length;
    const failureCount = emailResults.filter(r => !r.success).length;
    const failedEmails = emailResults.filter(r => !r.success);

    // Log failures
    if (failureCount > 0) {
      console.error(`Failed to send ${failureCount} invitations:`, failedEmails);
    }

    // Return response with results
    res.json({
      message: `${successCount}명에게 초대 이메일을 발송했습니다.`,
      formUrl,
      formId,
      results: {
        total: attendees.length,
        sent: successCount,
        failed: failureCount,
        failures: failedEmails.map(f => ({
          email: f.email,
          error: f.error
        }))
      }
    });
  } catch (error: any) {
    console.error('Error sending invitations:', error);

    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: '행사를 찾을 수 없습니다.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: '초대 이메일 발송 중 오류가 발생했습니다.'
    });
  }
});

export default router;
