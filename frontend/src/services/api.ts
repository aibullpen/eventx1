import axios, { AxiosError } from 'axios';

// VITE_API_URL은 'http://localhost:5000'과 같은 순수 서버 주소여야 합니다.
// '/api' 접두사는 여기서 추가합니다.
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout');
        return Promise.reject(new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.'));
      }
      if (error.message === 'Network Error') {
        console.error('Network error');
        return Promise.reject(new Error('네트워크 연결을 확인해주세요.'));
      }
      return Promise.reject(new Error('서버에 연결할 수 없습니다.'));
    }

    // Handle 401 Unauthorized
    if (error.response.status === 401) {
      // Clear any stored auth data
      sessionStorage.removeItem('user');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('인증이 만료되었습니다. 다시 로그인해주세요.'));
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      return Promise.reject(new Error('접근 권한이 없습니다.'));
    }

    // Handle 404 Not Found
    if (error.response.status === 404) {
      return Promise.reject(new Error('요청한 리소스를 찾을 수 없습니다.'));
    }

    // Handle 500 Server Error
    if (error.response.status >= 500) {
      return Promise.reject(new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'));
    }

    // Handle other errors with server message if available
    const serverMessage = error.response.data?.message || error.response.data?.error;
    if (serverMessage) {
      return Promise.reject(new Error(serverMessage));
    }

    return Promise.reject(error);
  }
);

export default api;
