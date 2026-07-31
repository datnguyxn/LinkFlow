import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  workspaceInvitationService
} from '@/services/workspace-invitation.service';

export function useInviteWorkspaceMember(
  workspaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      payload: {
        email: string;
        roleId: string;
      },
    ) =>
      workspaceInvitationService.inviteMember(
            workspaceId,
            payload.email,
            payload.roleId
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'workspace-invitations',
          workspaceId,
        ],
      });
    },
  });
}