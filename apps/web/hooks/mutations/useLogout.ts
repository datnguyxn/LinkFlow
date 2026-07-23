import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

import { authEvents } from '@/events/auth.event';

import { AUTH_EVENT, createAuthChannel } from '@/lib/auth-broadcast';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout.bind(authService),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['me'],
      });

      // Immediately mark user as unauthenticated
      queryClient.setQueryData(['me'], null);

      // Stop queries related to the old user
      queryClient.cancelQueries({
        queryKey: ['avatar'],
      });

      queryClient.removeQueries({
        queryKey: ['avatar'],
      });

      authEvents.emit('logout');
    },

    onSuccess() {
      queryClient.clear();

      const channel = createAuthChannel();

      channel?.postMessage({
        type: AUTH_EVENT.LOGOUT,
      });

      channel?.close();
    },
  });
}
