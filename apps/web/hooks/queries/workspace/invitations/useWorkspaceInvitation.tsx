import { useQuery } from '@tanstack/react-query';

import { workspaceInvitationService } from '@/services/workspace-invitation.service';

import { WorkspaceInvitation } from '@/types/workspace.type';

export function useWorkspaceInvitation(
  workspaceId: string,
  invitationId: string | null,
) {
  return useQuery({
    queryKey: [
      'workspace-invitation',
      workspaceId,
      invitationId,
    ],

    enabled: Boolean(workspaceId && invitationId),

    queryFn: async (): Promise<WorkspaceInvitation> => {
      const response =
        await workspaceInvitationService.getInvitationById(
          workspaceId,
          invitationId!,
        );

      return response.data.data;
    },
  });
}