import { useMutation, useQueryClient } from '@tanstack/react-query';

import { workspaceService } from '@/services/workspace.service';

interface UpdateWorkspaceLogoPayload {
  file: File | null;
  logoUrl?: string | null;
}

export function useUploadWorkspaceLogo(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      logoUrl,
    }: UpdateWorkspaceLogoPayload) =>
      workspaceService.updateLogo(
        workspaceId,
        file,
        logoUrl,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['workspace', 'detail', workspaceId],
      });

      await queryClient.invalidateQueries({
        queryKey: ['workspaces'],
      });
    },
  });
}