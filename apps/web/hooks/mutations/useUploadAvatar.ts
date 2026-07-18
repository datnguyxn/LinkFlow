import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/lib/apis/user.api';

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['avatar'],
      });
    },
  });
}
