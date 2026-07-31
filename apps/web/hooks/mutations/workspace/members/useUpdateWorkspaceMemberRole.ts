import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceMemberService } from '@/services/workspace-member.service';

export function useUpdateWorkspaceMemberRole(workspaceId: string, memberId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) =>
      workspaceMemberService.updateMemberRole(workspaceId, memberId, roleId),

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
    },
  });
}
