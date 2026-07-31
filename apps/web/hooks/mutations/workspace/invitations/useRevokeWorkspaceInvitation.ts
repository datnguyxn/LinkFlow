import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceInvitationService } from '@/services/workspace-invitation.service';
import { appToast } from '@/lib/toast';

export function useRevokeWorkspaceInvitation(
  workspaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceInvitationService.revokeInvitation(
        workspaceId,
        invitationId,
      ),

    onSuccess: (_, invitationId) => {
      queryClient.invalidateQueries({
        queryKey: [
          'workspace-invitations',
          workspaceId,
        ],
      })
        appToast.success('Invitation revoked successfully')
      ;

      queryClient.invalidateQueries({
        queryKey: [
          'workspace-invitation',
          workspaceId,
          invitationId,
        ],
      });
    },
  });
}