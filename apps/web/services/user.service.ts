import { userApi } from '@/lib/apis/user.api';
import { useAuthStore } from '@/stores/auth.store';
import { ApiResponse } from '@/types/api';
import type { UserProfile } from '@/types/auth';

class UserService {
  /**
   * Get user avatar
   */
  async getAvatar(user: UserProfile): Promise<void> {
    const response = await userApi.getAvatar();

    const blob = response.data;
    const imageUrl = URL.createObjectURL(blob);
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setAvatarUrl(imageUrl);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updatedProfile: Partial<UserProfile>): Promise<void> {
    await userApi.updateProfile(updatedProfile);
  }

  /**
   * Change user password
   */
  async changePassword(
    oldPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await userApi.changePassword({ oldPassword, newPassword });
    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    await userApi.deleteAccount();
  }

  /**
   * Get user profile
   */
  async getProfile() {
    const response = await userApi.getProfile();
    return response.data.data;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<{ data: ApiResponse<{ objectKey: string }> }> {
    const response = await userApi.uploadAvatar(file);
    return response;
  }
}

export const userService = new UserService();
