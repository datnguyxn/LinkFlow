import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { userService } from '@/services/user.service';

const DEFAULT_AVATAR = '/avatars/default-avt.jpg';

export function useAvatar(avatarUrl?: string, authenticated = false) {
  console.log('Avatar query', {
    avatarUrl,
    authenticated,
  });

  const isExternalAvatar = avatarUrl?.startsWith('http://') || avatarUrl?.startsWith('https://');

  const query = useQuery({
    queryKey: ['avatar', avatarUrl],

    enabled: authenticated && !!avatarUrl && !isExternalAvatar,

    queryFn: async () => {
      const blob = await userService.getAvatar();

      if (!blob || blob.size === 0) {
        return DEFAULT_AVATAR;
      }

      return URL.createObjectURL(blob);
    },

    staleTime: 10 * 60 * 1000,
  });

  return {
    ...query,
    data: isExternalAvatar ? avatarUrl : (query.data ?? DEFAULT_AVATAR),
  };
}
