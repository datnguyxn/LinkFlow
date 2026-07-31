import { useQuery } from '@tanstack/react-query';

import { workspaceService } from '@/services/workspace.service';

export function useWorkspaceDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: ['workspace', 'detail', id],

    queryFn: () => workspaceService.getById(id),

    enabled: enabled && !!id,

    staleTime: 5 * 60 * 1000,
  });
}
