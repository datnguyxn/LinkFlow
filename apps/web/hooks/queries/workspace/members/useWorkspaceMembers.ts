// hooks/queries/useWorkspaceMembers.ts

import { useQuery } from '@tanstack/react-query';

import { workspaceMemberService } from '@/services/workspace-member.service';

export function useWorkspaceMembers(
  workspaceId?: string,
  page?: number,
  limit?: number,
  search?: string
) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId, page, limit, search],

    queryFn: () =>
      workspaceMemberService.getAll(workspaceId!, page, limit, search),

    enabled: Boolean(workspaceId),
  });
}