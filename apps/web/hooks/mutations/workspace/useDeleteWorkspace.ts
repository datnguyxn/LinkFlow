import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceService } from '@/services/workspace.service';

export function useDeleteWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => workspaceService.delete(workspaceId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
    },
  });
}
