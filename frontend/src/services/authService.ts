import api from './api';
import { User } from '../types';

export const authService = {
  /**
   * Initiate Google OAuth flow
   */
  async initiateGoogleAuth(): Promise<string> {
    const response = await api.post<{ authUrl: string }>('/auth/google');
    return response.data.authUrl;
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    sessionStorage.removeItem('user');
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  },
};
