import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useMe({
  enabled = true,
}: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}