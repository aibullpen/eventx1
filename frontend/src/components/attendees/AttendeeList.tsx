import { useEffect, useState } from 'react';
import { Attendee, AttendanceStatus } from '../../types';
import { attendeeService } from '../../services/attendeeService';

interface AttendeeListProps {
  eventId: string;
  attendees: Attendee[];
  onRefresh: () => void;
}

export default function AttendeeList({
  eventId,
  attendees,
  onRefresh,
}: AttendeeListProps) {
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Set up polling for real-time updates - 주석 처리하여 비활성화
  // useEffect(() => { ... });

  const getStatusText = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.ATTENDING:
        return '참석';
      case AttendanceStatus.NOT_ATTENDING:
        return '불참';
      case AttendanceStatus.MAYBE:
        return '미정';
      case AttendanceStatus.PENDING:
      default:
        return '대기 중';
    }
  };

  const getStatusColor = (status: AttendanceStatus): string => {
    switch (status) {
      case AttendanceStatus.ATTENDING:
        return '#4caf50';
      case AttendanceStatus.NOT_ATTENDING:
        return '#f44336';
      case AttendanceStatus.MAYBE:
        return '#ff9800';
      case AttendanceStatus.PENDING:
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getAttendanceStats = () => {
    const attending = attendees.filter(
      (a) => a.attendanceStatus === AttendanceStatus.ATTENDING
    ).length;
    const notAttending = attendees.filter(
      (a) => a.attendanceStatus === AttendanceStatus.NOT_ATTENDING
    ).length;
    const maybe = attendees.filter(
      (a) => a.attendanceStatus === AttendanceStatus.MAYBE
    ).length;
    const pending = attendees.filter(
      (a) => a.attendanceStatus === AttendanceStatus.PENDING
    ).length;

    return { attending, notAttending, maybe, pending, total: attendees.length };
  };

  const stats = getAttendanceStats();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>참석자 목록</h2>
        <button onClick={onRefresh} style={styles.refreshButton}>
          🔄 새로고침
        </button>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statItem}>
          <span style={styles.statNumber}>{stats.total}</span>
          <span style={styles.statLabel}>전체</span>
        </div>
        <div style={styles.statItem}>
          <span style={{ ...styles.statNumber, color: '#4caf50' }}>
            {stats.attending}
          </span>
          <span style={styles.statLabel}>참석</span>
        </div>
        <div style={styles.statItem}>
          <span style={{ ...styles.statNumber, color: '#f44336' }}>
            {stats.notAttending}
          </span>
          <span style={styles.statLabel}>불참</span>
        </div>
        <div style={styles.statItem}>
          <span style={{ ...styles.statNumber, color: '#ff9800' }}>
            {stats.maybe}
          </span>
          <span style={styles.statLabel}>미정</span>
        </div>
        <div style={styles.statItem}>
          <span style={{ ...styles.statNumber, color: '#9e9e9e' }}>
            {stats.pending}
          </span>
          <span style={styles.statLabel}>대기</span>
        </div>
      </div>

      {attendees.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>아직 등록된 참석자가 없습니다.</p>
          <p style={styles.emptySubtext}>
            위의 참석자 등록 섹션에서 참석자를 추가해주세요.
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>번호</th>
                <th style={styles.th}>이메일</th>
                <th style={styles.th}>이름</th>
                <th style={styles.th}>참석 상태</th>
                <th style={styles.th}>응답 날짜</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((attendee, index) => (
                <tr key={attendee.id} style={styles.tr}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{attendee.email}</td>
                  <td style={styles.td}>{attendee.name || '-'}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(
                          attendee.attendanceStatus
                        ),
                      }}
                    >
                      {getStatusText(attendee.attendanceStatus)}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(attendee.responseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '4px',
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#999',
  },
  tableContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '12px',
    borderBottom: '2px solid #e0e0e0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#fafafa',
  },
  tr: {
    borderBottom: '1px solid #f0f0f0',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px',
    fontSize: '14px',
    color: '#333',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  },
};
