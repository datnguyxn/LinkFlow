// hooks/queries/useWorkspaceMember.ts

import { useQuery } from '@tanstack/react-query';

import { workspaceMemberService } from '@/services/workspace-member.service';

export function useWorkspaceMember(workspaceId?: string, memberId?: string) {
  return useQuery({
    queryKey: ['workspace-member', workspaceId, memberId],

    queryFn: () => workspaceMemberService.getById(workspaceId!, memberId!),

    enabled: Boolean(workspaceId) && Boolean(memberId),
  });
}
