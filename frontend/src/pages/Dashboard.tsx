import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { User } from '../types';
import EventDashboard from '../components/events/EventDashboard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/ToastContainer';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showError, showSuccess } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
        showError(error instanceof Error ? error.message : '사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [showError]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      showSuccess('로그아웃되었습니다.');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      showError(error instanceof Error ? error.message : '로그아웃에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <LoadingSpinner size="large" />
        <p style={styles.loadingText}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>행사 관리 대시보드</h1>
        <div style={styles.headerRight}>
          {user && (
            <span style={styles.userName}>{user.name}</span>
          )}
          <button onClick={handleLogout} style={styles.logoutButton}>
            로그아웃
          </button>
        </div>
      </div>
      
      <div style={styles.content}>
        <EventDashboard />
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '14px',
    color: '#666',
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  content: {
    margin: '20px 40px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '16px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
};
