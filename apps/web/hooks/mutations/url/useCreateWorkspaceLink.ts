import {useMutation, useQueryClient } from '@tanstack/react-query';

import { urlService } from '@/services/url.service';
import { CreateUrlInput } from '@/lib/validators/url.validator';

export function useCreateWorkspaceLink(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn( data: CreateUrlInput) {
      return urlService.create(workspaceId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['workspaces', workspaceId, 'links'],
      });
    },
  });
}