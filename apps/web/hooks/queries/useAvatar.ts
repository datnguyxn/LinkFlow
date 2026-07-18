import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export function useAvatar() {
  return useQuery({
    queryKey: ['avatar'],
    queryFn: async () => {
      const response = await userService.getAvatar();

      return URL.createObjectURL(response);
    },
    staleTime: 1000 * 60 * 10,
  });
}
