import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceService } from '@/services/workspace.service';

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceService.create,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
    },
  });
}