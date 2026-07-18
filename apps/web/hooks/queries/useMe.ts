import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.me.bind(authService),
    staleTime: 5 * 60 * 1000,
  });
}
