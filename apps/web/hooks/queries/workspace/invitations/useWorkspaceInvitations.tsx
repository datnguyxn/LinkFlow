import { useQuery } from '@tanstack/react-query';
import { workspaceInvitationService } from '@/services/workspace-invitation.service';
import { WorkspaceInvitationListResponse } from '@/types/workspace.type';

export function useWorkspaceInvitations(
  workspaceId: string,
  page: number,
  limit: number,
  search?: string
) {
  return useQuery({
    queryKey: [
      'workspace-invitations',
      workspaceId,
      page,
      limit,
      search
    ],

    queryFn: async (): Promise<
      WorkspaceInvitationListResponse
    > => {
      const response =
        await workspaceInvitationService.getAllInvitations(
          workspaceId,
          page,
          limit,
          search
        );

      return response.data.data;
    },

    enabled: !!workspaceId,
  });
}