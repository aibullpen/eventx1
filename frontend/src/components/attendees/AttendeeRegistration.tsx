import { useState } from 'react';
import { attendeeService } from '../../services/attendeeService';
import { useToast } from '../common/ToastContainer';

interface AttendeeRegistrationProps {
  eventId: string;
  onSuccess: () => void;
}

export default function AttendeeRegistration({
  eventId,
  onSuccess,
}: AttendeeRegistrationProps) {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'single' | 'excel' | 'sheets'>(
    'single'
  );
  const [email, setEmail] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSingleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showError('이메일을 입력해주세요.');
      return;
    }

    if (!validateEmail(email)) {
      showError('올바른 이메일 형식이 아닙니다.');
      return;
    }

    try {
      setLoading(true);
      await attendeeService.addAttendee(eventId, email);
      showSuccess('참석자가 추가되었습니다.');
      setEmail('');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : '참석자 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      showError('파일을 선택해주세요.');
      return;
    }

    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      showError('Excel 파일(.xlsx, .xls)만 업로드 가능합니다.');
      return;
    }

    try {
      setLoading(true);
      const attendees = await attendeeService.addAttendeesFromExcel(eventId, file);
      showSuccess(`${attendees.length}명의 참석자가 추가되었습니다.`);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('excel-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Excel 파일 업로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSheetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sheetUrl.trim()) {
      showError('Google Sheets 링크를 입력해주세요.');
      return;
    }

    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      showError('올바른 Google Sheets 링크가 아닙니다.');
      return;
    }

    try {
      setLoading(true);
      const attendees = await attendeeService.addAttendeesFromSheets(eventId, sheetUrl);
      showSuccess(`${attendees.length}명의 참석자가 추가되었습니다.`);
      setSheetUrl('');
      onSuccess();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Google Sheets 가져오기에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>참석자 등록</h2>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'single' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('single')}
        >
          단일 이메일
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'excel' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('excel')}
        >
          Excel 업로드
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'sheets' ? styles.activeTab : {}),
          }}
          onClick={() => setActiveTab('sheets')}
        >
          Google Sheets
        </button>
      </div>

      <div style={styles.tabContent}>
        {activeTab === 'single' && (
          <form onSubmit={handleSingleEmailSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>이메일 주소</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={styles.input}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? '추가 중...' : '참석자 추가'}
            </button>
          </form>
        )}

        {activeTab === 'excel' && (
          <form onSubmit={handleExcelUpload} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Excel 파일</label>
              <input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                style={styles.fileInput}
                disabled={loading}
              />
              <p style={styles.helpText}>
                이메일 주소가 포함된 Excel 파일(.xlsx, .xls)을 업로드하세요.
              </p>
            </div>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading || !file}
            >
              {loading ? '업로드 중...' : '파일 업로드'}
            </button>
          </form>
        )}

        {activeTab === 'sheets' && (
          <form onSubmit={handleSheetsSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Google Sheets 링크</label>
              <input
                type="text"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                style={styles.input}
                disabled={loading}
              />
              <p style={styles.helpText}>
                이메일 주소가 포함된 Google Sheets의 공유 링크를 입력하세요.
              </p>
            </div>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? '가져오는 중...' : 'Sheets에서 가져오기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginTop: 0,
    marginBottom: '16px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '24px',
  },
  tab: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s',
    marginBottom: '-2px',
  },
  activeTab: {
    color: '#4285f4',
    borderBottomColor: '#4285f4',
  },
  tabContent: {
    minHeight: '200px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  fileInput: {
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  helpText: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
  submitButton: {
    padding: '12px 24px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
};
