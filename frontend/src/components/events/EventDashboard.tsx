import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { Event } from '../../types';
import SkeletonLoader from '../common/SkeletonLoader';
import { useToast } from '../common/ToastContainer';

export default function EventDashboard() {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();

      // --- [디버깅 로그 추가] ---
      console.log('프론트엔드: /events API 응답 전체:', data);
      // --------------------------

      // 백엔드는 { events: [...] } 형태로 응답하므로, data.events 배열을 상태에 저장해야 합니다.
      // data가 배열이 아니면 data.map()에서 오류가 발생합니다.
      // data.events가 존재하고 배열인 경우에만 상태를 업데이트합니다.
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
      showError(err instanceof Error ? err.message : '행사 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    navigate('/events/create');
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>내 행사</h2>
        <button onClick={handleCreateEvent} style={styles.createButton}>
          + 행사 만들기
        </button>
      </div>

      {loading ? (
        <div style={styles.eventGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={styles.skeletonCard}>
              <SkeletonLoader height="24px" width="70%" />
              <SkeletonLoader height="16px" count={3} gap="8px" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>아직 생성된 행사가 없습니다.</p>
          <button onClick={handleCreateEvent} style={styles.createButtonLarge}>
            첫 행사 만들기
          </button>
        </div>
      ) : (
        <div style={styles.eventGrid}>
          {events.map((event) => (
            <div
              key={event.id}
              style={styles.eventCard}
              onClick={() => handleEventClick(event.id)}
            >
              <h3 style={styles.eventTitle}>{event.name}</h3>
              <div style={styles.eventInfo}>
                <p style={styles.eventDate}>
                  <span style={styles.icon}>📅</span>
                  {formatDate(event.date)}
                </p>
                <p style={styles.eventLocation}>
                  <span style={styles.icon}>📍</span>
                  {event.location}
                </p>
                <p style={styles.eventInstructor}>
                  <span style={styles.icon}>👤</span>
                  {event.instructor}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  skeletonCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    textAlign: 'center' as const,
  },
  emptyText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '24px',
  },
  createButtonLarge: {
    padding: '16px 32px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '500',
  },
  eventGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  eventCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  eventTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '16px',
  },
  eventInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  eventDate: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  eventLocation: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  eventInstructor: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  icon: {
    fontSize: '16px',
  },
};
