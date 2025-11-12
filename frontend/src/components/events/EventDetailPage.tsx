import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { attendeeService } from '../../services/attendeeService';
import { Event, Attendee, AttendanceStatus } from '../../types';
import AttendeeRegistration from '../attendees/AttendeeRegistration';
import AttendeeList from '../attendees/AttendeeList';
import SendInvitationDialog from './SendInvitationDialog';
import InvitationResultDialog from './InvitationResultDialog';

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const [invitationResults, setInvitationResults] = useState<{
    message: string;
    total: number;
    sent: number;
    failed: number;
    failures: Array<{ email: string; error: string }>;
  } | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);
      const [eventData, attendeesData] = await Promise.all([
        eventService.getEvent(eventId),
        attendeeService.getAttendees(eventId),
      ]);
      setEvent(eventData);
      setAttendees(attendeesData);
    } catch (err) {
      console.error('Failed to load event data:', err);
      setError('행사 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendeeSuccess = () => {
    // Reload attendees after successful registration
    loadEventData();
  };

  const handleCopyEvent = () => {
    if (eventId) {
      navigate(`/events/${eventId}/copy`);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleSendInvitations = () => {
    if (attendees.length === 0) {
      alert('초대할 참석자가 없습니다. 먼저 참석자를 등록해주세요.');
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmSend = async () => {
    if (!eventId) return;

    try {
      setSendingInvitations(true);
      const results = await eventService.sendInvitations(eventId);
      
      setInvitationResults({
        message: results.message,
        total: results.results.total,
        sent: results.results.sent,
        failed: results.results.failed,
        failures: results.results.failures,
      });
      
      setShowConfirmDialog(false);
      setShowResultDialog(true);
      
      // Reload event data to get updated form URL
      await loadEventData();
    } catch (err: any) {
      console.error('Failed to send invitations:', err);
      const errorMessage = err.response?.data?.message || '초대 이메일 발송에 실패했습니다.';
      alert(errorMessage);
      setShowConfirmDialog(false);
    } finally {
      setSendingInvitations(false);
    }
  };

  const handleCancelSend = () => {
    setShowConfirmDialog(false);
  };

  const handleCloseResults = () => {
    setShowResultDialog(false);
    setInvitationResults(null);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>행사 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={styles.error}>
        <p>{error || '행사를 찾을 수 없습니다.'}</p>
        <button onClick={handleBackToDashboard} style={styles.backButton}>
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBackToDashboard} style={styles.backButton}>
          ← 대시보드
        </button>
        <div style={styles.actionButtons}>
          <button 
            onClick={handleSendInvitations} 
            style={styles.sendInvitationButton}
            disabled={attendees.length === 0}
          >
            📧 초대 이메일 발송
          </button>
          <button onClick={handleCopyEvent} style={styles.copyButton}>
            행사 복사
          </button>
        </div>
      </div>

      <div style={styles.eventCard}>
        <h1 style={styles.eventTitle}>{event.name}</h1>
        
        <div style={styles.eventDetails}>
          <div style={styles.detailRow}>
            <span style={styles.detailIcon}>📅</span>
            <div>
              <span style={styles.detailLabel}>날짜</span>
              <span style={styles.detailValue}>{formatDate(event.date)}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailIcon}>📍</span>
            <div>
              <span style={styles.detailLabel}>장소</span>
              <span style={styles.detailValue}>{event.location}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailIcon}>👤</span>
            <div>
              <span style={styles.detailLabel}>강사</span>
              <span style={styles.detailValue}>{event.instructor}</span>
            </div>
          </div>

          <div style={styles.detailRow}>
            <span style={styles.detailIcon}>📝</span>
            <div>
              <span style={styles.detailLabel}>설명</span>
              <span style={styles.detailValue}>{event.description}</span>
            </div>
          </div>
        </div>
      </div>

      <AttendeeRegistration
        eventId={eventId}
        onSuccess={handleAttendeeSuccess}
      />

      <AttendeeList
        eventId={eventId}
        attendees={attendees}
        onRefresh={loadEventData}
      />

      <SendInvitationDialog
        isOpen={showConfirmDialog}
        attendeeCount={attendees.length}
        onConfirm={handleConfirmSend}
        onCancel={handleCancelSend}
        loading={sendingInvitations}
      />

      <InvitationResultDialog
        isOpen={showResultDialog}
        onClose={handleCloseResults}
        results={invitationResults}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  },
  sendInvitationButton: {
    padding: '10px 20px',
    backgroundColor: '#34a853',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  },
  copyButton: {
    padding: '10px 20px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    fontSize: '16px',
    color: '#666',
  },
  error: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    color: '#d32f2f',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  eventTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '24px',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  detailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  detailIcon: {
    fontSize: '20px',
    marginTop: '2px',
  },
  detailLabel: {
    display: 'block',
    fontSize: '12px',
    color: '#999',
    marginBottom: '4px',
  },
  detailValue: {
    display: 'block',
    fontSize: '16px',
    color: '#333',
  },

};
