import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceInvitationService } from '@/services/workspace-invitation.service';

type AcceptInvitationPayload = {
  workspaceId: string;
  invitationId: string;
  token: string;
};

export function useAcceptWorkspaceInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AcceptInvitationPayload) =>
      workspaceInvitationService.acceptInvitation(
        payload.workspaceId,
        payload.invitationId,
        payload.token,
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['workspaces'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['workspace-invitations'],
        }),
      ]);
    },
  });
}
