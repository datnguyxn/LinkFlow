import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

export function useSignOutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => authService.signOutSession(sessionId),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['active-sessions'],
      });
    },
  });
}
