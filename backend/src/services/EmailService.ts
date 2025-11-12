import { google, gmail_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Event } from '../models/Event';
import { Attendee } from '../models/Attendee';

export interface EmailResult {
  email: string;
  success: boolean;
  error?: string;
}

export class EmailService {
  private gmail: gmail_v1.Gmail;
  private oauth2Client: OAuth2Client;

  constructor(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  /**
   * Generate invitation email content
   * Creates HTML email with event details and form link
   */
  generateInvitationEmail(event: Event, formUrl: string): string {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    const formattedTime = eventDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #4285f4;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .event-details {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .detail-row {
      margin: 12px 0;
      display: flex;
      align-items: flex-start;
    }
    .detail-label {
      font-weight: bold;
      min-width: 80px;
      color: #555;
    }
    .detail-value {
      flex: 1;
    }
    .cta-button {
      display: inline-block;
      background-color: #4285f4;
      color: white;
      padding: 15px 30px;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #357ae8;
    }
    .footer {
      text-align: center;
      color: #777;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📧 행사 초대장</h1>
  </div>
  
  <div class="content">
    <p>안녕하세요,</p>
    <p><strong>${event.name}</strong> 행사에 초대합니다.</p>
    
    <div class="event-details">
      <h2 style="margin-top: 0; color: #4285f4;">📋 행사 정보</h2>
      
      <div class="detail-row">
        <span class="detail-label">📅 날짜:</span>
        <span class="detail-value">${formattedDate} ${formattedTime}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">📍 장소:</span>
        <span class="detail-value">${event.location}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">👨‍🏫 강사:</span>
        <span class="detail-value">${event.instructor}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">📝 내용:</span>
        <span class="detail-value">${event.description}</span>
      </div>
    </div>
    
    <p style="text-align: center; margin: 30px 0;">
      아래 버튼을 클릭하여 참석 여부를 알려주세요.
    </p>
    
    <div style="text-align: center;">
      <a href="${formUrl}" class="cta-button">
        ✅ 참석 여부 응답하기
      </a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      참석 여부를 빠른 시일 내에 알려주시면 감사하겠습니다.<br>
      궁금하신 사항이 있으시면 언제든지 문의해 주세요.
    </p>
  </div>
  
  <div class="footer">
    <p>이 이메일은 행사 관리 시스템에서 자동으로 발송되었습니다.</p>
  </div>
</body>
</html>
    `.trim();

    return emailHtml;
  }

  /**
   * Send invitation emails to attendees
   * Sends email to each attendee with event details and form link
   * Returns array of results indicating success/failure for each email
   */
  async sendInvitations(
    attendees: Attendee[],
    event: Event,
    formUrl: string
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    const emailContent = this.generateInvitationEmail(event, formUrl);

    for (const attendee of attendees) {
      try {
        await this.sendEmail(
          attendee.email,
          `[${event.name}] 행사 초대`,
          emailContent
        );

        results.push({
          email: attendee.email,
          success: true
        });

        console.log(`Successfully sent invitation to ${attendee.email}`);
      } catch (error: any) {
        console.error(`Failed to send invitation to ${attendee.email}:`, error);
        
        results.push({
          email: attendee.email,
          success: false,
          error: error.message || 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    console.log(`Sent ${successCount} invitations successfully, ${failureCount} failed`);

    return results;
  }

  /**
   * Send a single email using Gmail API
   * Creates and sends an email message
   */
  private async sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    try {
      // Get sender email from OAuth2 credentials
      const userInfo = await this.gmail.users.getProfile({ userId: 'me' });
      const fromEmail = userInfo.data.emailAddress;

      // Create email message in RFC 2822 format
      const message = [
        `From: ${fromEmail}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        htmlContent
      ].join('\n');

      // Encode message in base64url format
      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // Send email
      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage
        }
      });

      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }
}
