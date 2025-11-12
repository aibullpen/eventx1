import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { useToast } from '../common/ToastContainer';

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

export default function EventCreateForm() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    description: '',
    instructor: '',
    date: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

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
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const event = await eventService.createEvent({
        name: formData.name,
        location: formData.location,
        description: formData.description,
        instructor: formData.instructor,
        date: new Date(formData.date),
      });

      showSuccess('행사가 성공적으로 생성되었습니다.');
      // Navigate to event detail page
      navigate(`/events/${event.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      showError(error instanceof Error ? error.message : '행사 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>새 행사 만들기</h2>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
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
            {submitting ? '생성 중...' : '행사 만들기'}
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
  },
  form: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
