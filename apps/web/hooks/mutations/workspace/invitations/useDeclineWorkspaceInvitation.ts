import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceInvitationService } from '@/services/workspace-invitation.service';

type DeclineInvitationPayload = {
  workspaceId: string;
  token: string;
};

export function useDeclineWorkspaceInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DeclineInvitationPayload) =>
      workspaceInvitationService.declineInvitation(payload.workspaceId, payload.token),

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
