import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

import { authEvents } from '@/events/auth.event';

import { AUTH_EVENT, createAuthChannel } from '@/lib/auth-broadcast';

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout.bind(authService),

    onSuccess() {
      queryClient.clear();

      authEvents.emit('logout');

      const channel = createAuthChannel();

      channel?.postMessage({
        type: AUTH_EVENT.LOGOUT,
      });

      channel?.close();
    },
  });
}
