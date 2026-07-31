import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceMemberService } from '@/services/workspace-member.service';

export function useRemoveWorkspaceMember(
  workspaceId: string,
  memberId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workspaceMemberService.removeMember(workspaceId, memberId),

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