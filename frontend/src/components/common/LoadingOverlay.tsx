import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
}

export default function LoadingOverlay({ message = '로딩 중...' }: LoadingOverlayProps) {
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <LoadingSpinner size="large" />
        <p style={styles.message}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
  },
  content: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  message: {
    fontSize: '16px',
    color: '#333',
    margin: 0,
  },
};
