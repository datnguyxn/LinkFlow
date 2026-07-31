import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

export function useSignOutAllOtherSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signOutAllOtherSessions.bind(authService),

    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['active-sessions'],
      });
    },
  });
}
