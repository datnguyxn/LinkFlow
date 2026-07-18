import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useActiveSessions() {
  return useQuery({
    queryKey: ['active-sessions'],
    queryFn: authService.listActiveSessions.bind(authService),
  });
}
