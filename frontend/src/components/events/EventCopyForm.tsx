import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { Event } from '../../types';

interface FormData {
  name: string;
  location: string;
  description: string;
  instructor: string;
  date: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  description?: string;
  instructor?: string;
  date?: string;
}

export default function EventCopyForm() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [originalEvent, setOriginalEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    description: '',
    instructor: '',
    date: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadOriginalEvent();
    }
  }, [eventId]);

  const loadOriginalEvent = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const event = await eventService.getEvent(eventId);
      setOriginalEvent(event);
      
      // Pre-fill form with original event data
      const eventDate = new Date(event.date);
      const dateString = eventDate.toISOString().split('T')[0];
      
      setFormData({
        name: `${event.name} (복사본)`,
        location: event.location,
        description: event.description,
        instructor: event.instructor,
        date: dateString,
      });
    } catch (error) {
      console.error('Failed to load event:', error);
      setSubmitError('원본 행사를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '행사 이름을 입력해주세요.';
    }

    if (!formData.location.trim()) {
      newErrors.location = '장소를 입력해주세요.';
    }

    if (!formData.description.trim()) {
      newErrors.description = '설명을 입력해주세요.';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = '강사를 입력해주세요.';
    }

    if (!formData.date) {
      newErrors.date = '날짜를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !eventId) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const copiedEvent = await eventService.copyEvent(eventId, {
        name: formData.name,
        location: formData.location,
        description: formData.description,
        instructor: formData.instructor,
        date: new Date(formData.date),
      });

      // Navigate to the new event detail page
      navigate(`/events/${copiedEvent.id}`);
    } catch (error) {
      console.error('Failed to copy event:', error);
      setSubmitError('행사 복사에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (eventId) {
      navigate(`/events/${eventId}`);
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>행사 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!originalEvent) {
    return (
      <div style={styles.error}>
        <p>원본 행사를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
          대시보드로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>행사 복사</h2>
        <p style={styles.subtitle}>
          원본: <strong>{originalEvent.name}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {submitError && (
          <div style={styles.errorAlert}>
            {submitError}
          </div>
        )}

        <div style={styles.formGroup}>
          <label htmlFor="name" style={styles.label}>
            행사 이름 <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.name ? styles.inputError : {}),
            }}
            placeholder="예: 2024년 1월 정기 모임"
          />
          {errors.name && <span style={styles.errorText}>{errors.name}</span>}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="date" style={styles.label}>
            날짜 <span style={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.date ? styles.inputError : {}),
            }}
          />
          {errors.date && <span style={styles.errorText}>{errors.date}</span>}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="location" style={styles.label}>
            장소 <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.location ? styles.inputError : {}),
            }}
            placeholder="예: 서울시 강남구 테헤란로 123"
          />
          {errors.location && (
            <span style={styles.errorText}>{errors.location}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="instructor" style={styles.label}>
            강사 <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(errors.instructor ? styles.inputError : {}),
            }}
            placeholder="예: 홍길동"
          />
          {errors.instructor && (
            <span style={styles.errorText}>{errors.instructor}</span>
          )}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>
            설명 <span style={styles.required}>*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            style={{
              ...styles.textarea,
              ...(errors.description ? styles.inputError : {}),
            }}
            placeholder="행사에 대한 자세한 설명을 입력해주세요."
          />
          {errors.description && (
            <span style={styles.errorText}>{errors.description}</span>
          )}
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            ℹ️ 참석자 목록도 함께 복사됩니다. 복사된 참석자들의 참석 상태는 "대기 중"으로 초기화됩니다.
          </p>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleCancel}
            style={styles.cancelButton}
            disabled={submitting}
          >
            취소
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={submitting}
          >
            {submitting ? '복사 중...' : '행사 복사하기'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },
  form: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
  backButton: {
    marginTop: '16px',
    padding: '8px 16px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  errorAlert: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '24px',
    fontSize: '14px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '8px',
  },
  required: {
    color: '#d32f2f',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    transition: 'border-color 0.2s',
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  errorText: {
    display: 'block',
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '4px',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '24px',
  },
  infoText: {
    fontSize: '14px',
    color: '#1565c0',
    margin: 0,
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px',
  },
  cancelButton: {
    padding: '10px 24px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  submitButton: {
    padding: '10px 24px',
    backgroundColor: '#4285f4',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
};
