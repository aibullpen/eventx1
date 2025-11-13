import { Router, Request, Response } from 'express';
import { AttendeeService } from '../services/AttendeeService';
import { EventService } from '../services/EventService';
import { GoogleFormsService } from '../services/GoogleFormsService';
import { AuthenticationService } from '../services/AuthenticationService';
import { AttendanceStatus } from '../models/Attendee';

const router = Router();

/**
 * POST /api/webhooks/form-response
 * Receive Google Form responses and update attendance status
 * This endpoint is called by Google Forms when a response is submitted
 */
router.post('/form-response', async (req: Request, res: Response) => {
  try {
    console.log('Received form response webhook:', JSON.stringify(req.body, null, 2));

    // Google Form Webhook은 formId를 직접 제공하지 않습니다.
    // 대신, 요청 본문에서 응답 데이터를 파싱해야 합니다.
    // Google Form 응답 구조는 설정에 따라 다를 수 있습니다.
    // 여기서는 일반적인 '질문-답변' 구조를 파싱하는 예시입니다.
    // 실제 Form 응답 구조에 맞게 key(질문 제목)를 조정해야 합니다.
    const responses = req.body.responses || (req.body.answers ? Object.values(req.body.answers) : []);
    
    const getAnswer = (questionTitle: string): string | undefined => {
      // 실제 Form의 질문 제목과 일치해야 합니다.
      const response = responses.find((r: any) => r.question === questionTitle || r.title === questionTitle);
      return response?.answer?.[0] || response?.textAnswers?.answers?.[0]?.value;
    };

    const email = getAnswer('이메일') || req.body.emailAddress; // Form 생성 시 사용한 "이메일" 제목과 일치시킵니다.
    const name = getAnswer('이름');
    const attendanceStatus = getAnswer('참석 여부');
    const eventId = req.body.eventId; // 커스텀 필드로 eventId를 전달했을 경우

    // Validate required fields
    if (!email || !attendanceStatus) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields from form response: email or attendanceStatus'
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

    // eventId가 응답에 포함되어 있다면 더 효율적으로 이벤트를 찾을 수 있습니다.
    // Google Form 생성 시 숨겨진 필드에 eventId를 포함하거나,
    // Webhook URL에 파라미터로 추가하는 방법을 고려할 수 있습니다.
    // 예: /api/webhooks/form-response?eventId=...
    const queryEventId = req.query.eventId as string || eventId;
    if (!queryEventId) {
      console.warn('eventId not found in webhook payload or query. Falling back to searching all events.');
    }

    // Find the event by form ID
    // We need to search through all users' events to find the matching form
    // In a production system, this would be optimized with a database index
    let targetEvent = null;
    let targetUser = null;
    let oauth2Client = null;

    // TODO: 이 로직은 매우 비효율적입니다.
    // 1. Webhook URL에 eventId를 포함시키거나 (추천)
    // 2. formId와 eventId를 매핑하는 DB 테이블을 만들어 최적화해야 합니다.
    // 아래는 임시 방편으로 모든 사용자와 이벤트를 순회하는 로직입니다.
    const users = AuthenticationService.getInstance().getAllUsers();

    for (const user of users) {
      try {
        oauth2Client = AuthenticationService.getInstance().getOAuth2Client();
        oauth2Client.setCredentials({
          access_token: user.accessToken,
          refresh_token: user.refreshToken
        });

        const eventService = EventService.getInstance();
        eventService.setOAuth2Client(oauth2Client);
        const events = await eventService.getEventsByOrganizer(user.id);
        
        // eventId가 있다면 바로 찾고, 없다면 formId로 추측합니다.
        const foundEvent = queryEventId 
          ? events.find(e => e.id === queryEventId)
          : events.find(e => e.formUrl && req.body.formUrl && e.formUrl.includes(new URL(req.body.formUrl).pathname));

        if (foundEvent) {
          targetEvent = foundEvent;
          targetUser = user;
          break;
        }
      } catch (e) {
        console.error(`Error processing events for user ${user.id}`, e);
        continue; // 다음 사용자로 계속 진행
      }
    }

    if (!targetEvent || !targetUser || !oauth2Client) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Matching event for the form response not found.`
      });
    }

    // Find the attendee by email
    const attendeeService = AttendeeService.getInstance();
    attendeeService.setOAuth2Client(oauth2Client);
    const attendees = await attendeeService.getAttendees(targetEvent.id);
    
    const attendee = attendees.find(a => a.email.toLowerCase().trim() === normalizedEmail);
    
    if (!attendee) {
      // 옵션: 이벤트에 없는 사람이라도 응답을 남길 수 있도록 처리
      console.warn(`Attendee with email ${normalizedEmail} not found for this event. You may want to add them.`);
      return res.status(404).json({
        error: 'Not Found',
        message: `Attendee with email ${normalizedEmail} not found for this event`
      });
    }

    // Update attendance status
    await attendeeService.updateAttendanceStatus(
      attendee.id,
      targetUser.eventSheetId,
      mappedStatus,
      name || attendee.name, // 이름도 함께 업데이트
      new Date() // 응답 날짜 업데이트
    );

    console.log(`Updated attendance status for ${normalizedEmail} to ${mappedStatus}`);

    res.json({
      message: '참석 여부가 업데이트되었습니다.',
      attendee: {
        id: attendee.id,
        email: attendee.email,
        name: name || attendee.name,
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
