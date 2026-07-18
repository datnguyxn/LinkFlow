import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { userService } from '@/services/user.service';

const DEFAULT_AVATAR = '/avatars/default-avt.jpg';

export function useAvatar(avatarUrl?: string) {
  return useQuery({
    queryKey: ['avatar', avatarUrl],

    queryFn: async () => {
      // Avatar Google hoặc URL ngoài
      if (avatarUrl?.startsWith('http')) {
        return avatarUrl;
      }

      try {
        const blob = await userService.getAvatar();

        // Phòng trường hợp service trả undefined/null khi 204
        if (!blob || blob.size === 0) {
          return DEFAULT_AVATAR;
        }

        return URL.createObjectURL(blob);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 204 || status === 404) {
            return DEFAULT_AVATAR;
          }
        }

        throw error;
      }
    },

    staleTime: 10 * 60 * 1000,
  });
}
