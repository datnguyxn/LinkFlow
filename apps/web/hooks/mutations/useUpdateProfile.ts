import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userService } from '@/services/user.service';

import type { UserProfile } from '@/types/auth';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Partial<UserProfile>) => userService.updateUserProfile(profile),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['me'],
      });
    },
  });
}
