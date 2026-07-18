import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useMe } from '@/hooks/queries/useMe';

export function useActiveSessions() {
  const { data: user } = useMe();

  return useQuery({
    queryKey: ['active-sessions'],
    queryFn: authService.listActiveSessions.bind(authService),
    enabled: !!user,
  });
}
