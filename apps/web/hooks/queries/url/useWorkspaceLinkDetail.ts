import { useQuery } from '@tanstack/react-query';

import { urlService } from '@/services/url.service';

import { UrlDetailResponse } from '@/types/url.type';

export function useWorkspaceLinkDetail(workspaceId: string, linkId: string, enabled = true) {
  return useQuery<UrlDetailResponse>({
    queryKey: ['workspaces', workspaceId, 'links', linkId],

    queryFn: () => urlService.getById(workspaceId, linkId),

    enabled: enabled && !!workspaceId && !!linkId,

    staleTime: 5 * 60 * 1000,
  });
}