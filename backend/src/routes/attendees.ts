import { Router, Request, Response } from 'express';
import multer from 'multer';
import { AttendeeService } from '../services/AttendeeService';
import { EventService } from '../services/EventService';
import { AuthenticationService } from '../services/AuthenticationService';
import { requireAuth } from '../middleware/auth';
import { AttendanceStatus } from '../models/Attendee';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept Excel files only
    const allowedMimes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Excel 파일만 업로드 가능합니다.'));
    }
  }
});

// Helper function to get AttendeeService with OAuth2Client from session
const getAttendeeService = (req: Request): AttendeeService => {
  const oauth2Client = AuthenticationService.getInstance().getOAuth2Client();
  
  // Set credentials from session if available
  if (req.session && (req.session as any).accessToken) {
    oauth2Client.setCredentials({ access_token: (req.session as any).accessToken, refresh_token: (req.session as any).refreshToken });
  }
  const attendeeService = AttendeeService.getInstance();
  attendeeService.setOAuth2Client(oauth2Client);
  return attendeeService;
};

// Helper function to get EventService
const getEventService = (req: Request): EventService => {
  const oauth2Client = AuthenticationService.getInstance().getOAuth2Client();
  const eventService = EventService.getInstance();
  eventService.setOAuth2Client(oauth2Client);
  return eventService;
};

/**
 * POST /api/events/:id/attendees
 * Add single attendee to event
 * Requires authentication
 */
router.post('/events/:id/attendees', requireAuth, async (req: Request, res: Response) => {
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

    // Verify event exists and belongs to user
    const eventService = getEventService(req);
    const event = await eventService.getEvent(eventId);

    if (event.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    // Validate request body
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '이메일 주소를 입력해주세요.'
      });
    }

    // Add attendee
    const attendeeService = getAttendeeService(req);
    const attendee = await attendeeService.addAttendee(eventId, user.eventSheetId, email);

    res.status(201).json({
      message: '참석자가 추가되었습니다.',
      attendee: {
        id: attendee.id,
        eventId: attendee.eventId,
        email: attendee.email,
        name: attendee.name,
        attendanceStatus: attendee.attendanceStatus,
        responseDate: attendee.responseDate,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Error adding attendee:', error);
    
    if (error.message === 'Invalid email format') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 이메일 형식입니다.'
      });
    }
    
    if (error.message === 'Attendee already registered for this event') {
      return res.status(409).json({
        error: 'Conflict',
        message: '이미 등록된 참석자입니다.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: '참석자 추가 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/events/:id/attendees/from-excel
 * Add multiple attendees from Excel file
 * Requires authentication
 */
router.post('/events/:id/attendees/from-excel', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
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

    // Verify event exists and belongs to user
    const eventService = getEventService(req);
    const event = await eventService.getEvent(eventId);

    if (event.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Excel 파일을 업로드해주세요.'
      });
    }

    // Add attendees from Excel
    const attendeeService = getAttendeeService(req);
    const attendees = await attendeeService.addAttendeesFromExcel(
      eventId,
      user.eventSheetId,
      req.file.buffer
    );

    res.status(201).json({
      message: `${attendees.length}명의 참석자가 추가되었습니다.`,
      count: attendees.length,
      attendees: attendees.map(attendee => ({
        id: attendee.id,
        eventId: attendee.eventId,
        email: attendee.email,
        name: attendee.name,
        attendanceStatus: attendee.attendanceStatus,
        responseDate: attendee.responseDate,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Error adding attendees from Excel:', error);
    
    if (error.message === 'Excel file is empty') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Excel 파일이 비어있습니다.'
      });
    }
    
    if (error.message === 'No valid email addresses found in Excel file') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Excel 파일에서 유효한 이메일 주소를 찾을 수 없습니다.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Excel 파일에서 참석자 추가 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/events/:id/attendees/from-sheets
 * Add multiple attendees from Google Sheets
 * Requires authentication
 */
router.post('/events/:id/attendees/from-sheets', requireAuth, async (req: Request, res: Response) => {
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

    // Verify event exists and belongs to user
    const eventService = getEventService(req);
    const event = await eventService.getEvent(eventId);

    if (event.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    // Validate request body
    const { sheetUrl } = req.body;

    if (!sheetUrl) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Google Sheets URL을 입력해주세요.'
      });
    }

    // Add attendees from Google Sheets
    const attendeeService = getAttendeeService(req);
    const attendees = await attendeeService.addAttendeesFromSheets(
      eventId,
      user.eventSheetId,
      sheetUrl
    );

    res.status(201).json({
      message: `${attendees.length}명의 참석자가 추가되었습니다.`,
      count: attendees.length,
      attendees: attendees.map(attendee => ({
        id: attendee.id,
        eventId: attendee.eventId,
        email: attendee.email,
        name: attendee.name,
        attendanceStatus: attendee.attendanceStatus,
        responseDate: attendee.responseDate,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Error adding attendees from Google Sheets:', error);
    
    if (error.message === 'Invalid Google Sheets URL') {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 Google Sheets URL입니다.'
      });
    }
    
    if (error.message === 'No valid email addresses found in Google Sheet') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Google Sheets에서 유효한 이메일 주소를 찾을 수 없습니다.'
      });
    }
    
    if (error.message.includes('not found') || error.message.includes('Access denied')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Google Sheets에서 참석자 추가 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/events/:id/attendees
 * Get all attendees for an event
 * Requires authentication
 */
router.get('/events/:id/attendees', requireAuth, async (req: Request, res: Response) => {
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

    // Verify event exists and belongs to user
    const eventService = getEventService(req);
    const event = await eventService.getEvent(eventId);

    if (event.organizerId !== user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '이 행사에 접근할 권한이 없습니다.'
      });
    }

    // Get attendees
    const attendeeService = getAttendeeService(req);
    const attendees = await attendeeService.getAttendees(eventId);

    res.json({
      count: attendees.length,
      attendees: attendees.map(attendee => ({
        id: attendee.id,
        eventId: attendee.eventId,
        email: attendee.email,
        name: attendee.name,
        attendanceStatus: attendee.attendanceStatus,
        responseDate: attendee.responseDate,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt
      }))
    });
  } catch (error: any) {
    console.error('Error getting attendees:', error);

    res.status(500).json({
      error: 'Internal Server Error',
      message: '참석자 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
});

/**
 * PUT /api/attendees/:id/status
 * Update attendance status for an attendee
 * Requires authentication
 */
router.put('/attendees/:id/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.session as any).userId;
    const user = AuthenticationService.getInstance().getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    const attendeeId = req.params.id;

    // Validate request body
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '참석 상태를 입력해주세요.'
      });
    }

    // Validate status value
    const validStatuses = Object.values(AttendanceStatus);
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '유효하지 않은 참석 상태입니다.'
      });
    }

    // Update attendance status
    const attendeeService = getAttendeeService(req);
    await attendeeService.updateAttendanceStatus(attendeeId, user.eventSheetId, status);

    res.json({
      message: '참석 상태가 업데이트되었습니다.',
      attendeeId,
      status
    });
  } catch (error: any) {
    console.error('Error updating attendance status:', error);
    
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: '참석자를 찾을 수 없습니다.'
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: '참석 상태 업데이트 중 오류가 발생했습니다.'
    });
  }
});

export default router;
