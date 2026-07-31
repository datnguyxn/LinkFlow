// hooks/queries/useWorkspaceMemberRoles.ts

import { WorkspaceRole } from '@/types/workspace.type';
import { roleService } from '@/services/role.service';
import { useQuery } from '@tanstack/react-query';


export function useWorkspaceMemberRoles(
  workspaceId: string,
) {
  return useQuery({
    queryKey: [
      'workspace-member-roles',
      workspaceId,
    ],

    queryFn: async ():  Promise<WorkspaceRole[]> => {
      const response =
        await roleService.getAll();

      return response.data;
    },

    enabled: Boolean(workspaceId),

    staleTime: 5 * 60 * 1000,
  });
}