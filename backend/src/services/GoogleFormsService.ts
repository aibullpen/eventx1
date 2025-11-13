import { google, forms_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Event } from '../models/Event';

export interface GoogleForm {
  formId: string;
  formUrl: string;
}

export class GoogleFormsService {
  private static instance: GoogleFormsService;
  private forms: forms_v1.Forms | null = null;
  private oauth2Client: OAuth2Client | null = null;

  private constructor() {}

  public static getInstance(): GoogleFormsService {
    if (!GoogleFormsService.instance) {
      GoogleFormsService.instance = new GoogleFormsService();
    }
    return GoogleFormsService.instance;
  }

  public setOAuth2Client(oauth2Client: OAuth2Client) {
    this.oauth2Client = oauth2Client;
    this.forms = google.forms({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * Create attendance form for an event
   * Generates a Google Form with event details and attendance confirmation fields
   * Returns form ID and public URL
   */
  async createAttendanceForm(event: Event): Promise<GoogleForm> {
    try {
      if (!this.forms) {
        throw new Error('GoogleFormsService is not initialized. Call setOAuth2Client first.');
      }

      // Format event date for display
      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });

      // Create form with title and description
      const form = await this.forms.forms.create({
        requestBody: {
          info: {
            title: `[${event.name}] 참석 확인`,
            documentTitle: `[${event.name}] 참석 확인`
          }
        }
      });

      const formId = form.data.formId!;

      // Build form structure with event details and questions
      await this.forms.forms.batchUpdate({
        formId: formId,
        requestBody: {
          requests: [
            // Add form description with event details
            {
              updateFormInfo: {
                info: {
                  title: `[${event.name}] 참석 확인`,
                  description: `행사 정보:\n\n` +
                    `📅 날짜: ${formattedDate}\n` +
                    `📍 장소: ${event.location}\n` +
                    `👨‍🏫 강사: ${event.instructor}\n` +
                    `📝 내용: ${event.description}\n\n` +
                    `아래 양식을 작성하여 참석 여부를 알려주세요.`
                },
                updateMask: 'title,description'
              }
            },
            // Question 1: Name (required)
            {
              createItem: {
                item: {
                  title: '이름',
                  questionItem: {
                    question: {
                      required: true,
                      textQuestion: {
                        paragraph: false
                      }
                    }
                  }
                },
                location: {
                  index: 0
                }
              }
            },
            // Question 2: Email (required)
            {
              createItem: {
                item: {
                  title: '이메일',
                  questionItem: {
                    question: {
                      required: true,
                      textQuestion: {
                        paragraph: false
                      }
                    }
                  }
                },
                location: {
                  index: 1
                }
              }
            },
            // Question 3: Attendance status (required, multiple choice)
            {
              createItem: {
                item: {
                  title: '참석 여부',
                  questionItem: {
                    question: {
                      required: true,
                      choiceQuestion: {
                        type: 'RADIO',
                        options: [
                          { value: '참석합니다' },
                          { value: '불참합니다' },
                          { value: '미정입니다' }
                        ]
                      }
                    }
                  }
                },
                location: {
                  index: 2
                }
              }
            },
            // Question 4: Additional message (optional)
            {
              createItem: {
                item: {
                  title: '추가 메시지 (선택사항)',
                  questionItem: {
                    question: {
                      required: false,
                      textQuestion: {
                        paragraph: true
                      }
                    }
                  }
                },
                location: {
                  index: 3
                }
              }
            }
          ]
        }
      });

      // Get the published form URL
      const formUrl = `https://docs.google.com/forms/d/${formId}/viewform`;

      console.log(`Created attendance form for event ${event.id}: ${formId}`);
      
      return {
        formId,
        formUrl
      };
    } catch (error) {
      console.error('Error creating attendance form:', error);
      throw new Error('Failed to create attendance form');
    }
  }
}
