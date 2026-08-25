import { useQuery } from '@tanstack/react-query';

import { urlService } from '@/services/url.service';

import { UrlListResponse } from '@/types/url.type';

export const workspaceLinkKeys = {
  all: (workspaceId: string | undefined) => ['workspaces', workspaceId, 'links'] as const,
};

export function useWorkspaceLinks(
  workspaceId: string | undefined,
  page: number,
  limit: number,
  search?: string,
  enabled = true
) {
  return useQuery<UrlListResponse>({
    queryKey: workspaceLinkKeys.all(workspaceId),
    queryFn: () => urlService.getAll(workspaceId, page, limit, search),

    enabled,

    staleTime: 5 * 60 * 1000,
  });
}