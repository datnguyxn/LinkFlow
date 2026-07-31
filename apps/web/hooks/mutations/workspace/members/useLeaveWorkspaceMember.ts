import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceMemberService } from '@/services/workspace-member.service';

export function useLeaveWorkspaceMember(
  workspaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workspaceMemberService.leaveWorkspace(workspaceId),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['workspace-members', workspaceId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['workspace', 'detail', workspaceId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['workspaces'],
        }),
      ]);
    }
  });
}