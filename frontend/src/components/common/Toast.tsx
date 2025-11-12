import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyles = () => {
    const baseStyles = {
      ...styles.toast,
    };

    switch (type) {
      case 'success':
        return { ...baseStyles, ...styles.success };
      case 'error':
        return { ...baseStyles, ...styles.error };
      case 'warning':
        return { ...baseStyles, ...styles.warning };
      case 'info':
      default:
        return { ...baseStyles, ...styles.info };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div style={getStyles()}>
      <span style={styles.icon}>{getIcon()}</span>
      <span style={styles.message}>{message}</span>
      <button onClick={onClose} style={styles.closeButton}>
        ✕
      </button>
    </div>
  );
}

const styles = {
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    minWidth: '300px',
    maxWidth: '500px',
    animation: 'slideIn 0.3s ease-out',
  },
  success: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  error: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  warning: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  info: {
    backgroundColor: '#2196f3',
    color: 'white',
  },
  icon: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: '14px',
    lineHeight: '1.4',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
};
