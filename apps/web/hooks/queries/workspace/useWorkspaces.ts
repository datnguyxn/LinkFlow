import { useQuery } from '@tanstack/react-query';

import { workspaceService } from '@/services/workspace.service';

import { Workspace } from '@/types/workspace.type';

export const workspaceKeys = {
  all: ['workspaces'] as const,
};

export function useWorkspaces(enabled = true) {
  return useQuery<Workspace[]>({
    queryKey: workspaceKeys.all,
    queryFn: () => workspaceService.getAll(),

    enabled,

    staleTime: 5 * 60 * 1000,
  });
}
