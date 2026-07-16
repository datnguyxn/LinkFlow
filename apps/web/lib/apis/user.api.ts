import { api } from '@/lib/axios';
import { ProfileResponse, UserProfile } from '@/types/auth';

const PREFIX = '/api/v1';

export const userApi = {
  /**
   * Get user avatar
   */
  getAvatar() {
    return api.get(`${PREFIX}/user/me/avatar`, {
      responseType: 'blob',
    });
  },

  /**
   * Update user profile
   */
  updateProfile(data: Partial<UserProfile>) {
    return api.patch(`${PREFIX}/user/me`, data);
  },

  /**
   * Change user password
   */
  changePassword(data: { oldPassword: string; newPassword: string }) {
    return api.patch(`${PREFIX}/user/me/password`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * Delete user account
   */
  deleteAccount() {
    return api.delete(`${PREFIX}/user/me`);
  },

  /**
   * Get user profile
   */
  getProfile() {
    return api.get<ProfileResponse>(`${PREFIX}/user/me`);
  },
};
