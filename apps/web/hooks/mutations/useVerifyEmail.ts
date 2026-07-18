import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),

    onSuccess(user) {
      queryClient.setQueryData(['me'], user);
    },
  });
}
