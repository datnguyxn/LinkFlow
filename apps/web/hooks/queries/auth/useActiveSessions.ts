import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useActiveSessions(authenticated = false) {
  return useQuery({
    queryKey: ['active-sessions'],

    enabled: authenticated,

    queryFn: authService.listActiveSessions.bind(authService),
  });
}
