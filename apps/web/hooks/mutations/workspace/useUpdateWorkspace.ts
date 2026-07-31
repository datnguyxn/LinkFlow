import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceService } from '@/services/workspace.service';

type UpdateWorkspaceData = {
  name: string;
};

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspaceData) => workspaceService.update(workspaceId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });

      queryClient.invalidateQueries({
        queryKey: ['workspace', 'detail', workspaceId],
      });
    },
  });
}
