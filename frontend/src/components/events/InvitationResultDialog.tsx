interface InvitationResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    message: string;
    total: number;
    sent: number;
    failed: number;
    failures: Array<{ email: string; error: string }>;
  } | null;
}

export default function InvitationResultDialog({
  isOpen,
  onClose,
  results,
}: InvitationResultDialogProps) {
  if (!isOpen || !results) return null;

  const hasFailures = results.failed > 0;

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <div style={styles.header}>
          <span style={styles.icon}>{hasFailures ? '⚠️' : '✅'}</span>
          <h2 style={styles.title}>
            {hasFailures ? '일부 발송 실패' : '발송 완료'}
          </h2>
        </div>

        <p style={styles.message}>{results.message}</p>

        <div style={styles.stats}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>전체</span>
            <span style={styles.statValue}>{results.total}명</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>성공</span>
            <span style={{ ...styles.statValue, color: '#34a853' }}>
              {results.sent}명
            </span>
          </div>
          {hasFailures && (
            <div style={styles.statItem}>
              <span style={styles.statLabel}>실패</span>
              <span style={{ ...styles.statValue, color: '#ea4335' }}>
                {results.failed}명
              </span>
            </div>
          )}
        </div>

        {hasFailures && results.failures.length > 0 && (
          <div style={styles.failureSection}>
            <h3 style={styles.failureTitle}>발송 실패 목록</h3>
            <div style={styles.failureList}>
              {results.failures.map((failure, index) => (
                <div key={index} style={styles.failureItem}>
                  <span style={styles.failureEmail}>{failure.email}</span>
                  <span style={styles.failureError}>{failure.error}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button onClick={onClose} style={styles.closeButton}>
            확인
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  icon: {
    fontSize: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
  },
  message: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '24px',
  },
  stats: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
  },
  failureSection: {
    marginBottom: '24px',
  },
  failureTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '12px',
  },
  failureList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    maxHeight: '200px',
    overflow: 'auto',
  },
  failureItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    padding: '12px',
    backgroundColor: '#fef7f7',
    borderLeft: '3px solid #ea4335',
    borderRadius: '4px',
  },
  failureEmail: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  failureError: {
    fontSize: '12px',
    color: '#666',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeButton: {
    padding: '10px 24px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
};
