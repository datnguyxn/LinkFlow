import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userService } from '@/services/user.service';

import type { UserProfile } from '@/types/auth.type';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: Partial<UserProfile>) => userService.updateUserProfile(profile),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['me'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspace-members'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspace-member'],
      });
    },
  });
}
