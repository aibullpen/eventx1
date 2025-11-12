import { useState } from 'react';

interface SendInvitationDialogProps {
  isOpen: boolean;
  attendeeCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function SendInvitationDialog({
  isOpen,
  attendeeCount,
  onConfirm,
  onCancel,
  loading,
}: SendInvitationDialogProps) {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={styles.title}>초대 이메일 발송</h2>
        
        <p style={styles.message}>
          {attendeeCount}명의 참석자에게 초대 이메일을 발송하시겠습니까?
        </p>
        
        <p style={styles.description}>
          Google Form이 자동으로 생성되어 이메일에 포함됩니다.
        </p>

        <div style={styles.buttonContainer}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.cancelButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              ...styles.button,
              ...styles.confirmButton,
              ...(loading ? styles.disabledButton : {}),
            }}
          >
            {loading ? '발송 중...' : '발송하기'}
          </button>
        </div>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '16px',
  },
  message: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '12px',
  },
  description: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  button: {
    padding: '10px 24px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#4285f4',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
};
