import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      email,
      password,
      remember,
    }: {
      email: string;
      password: string;
      remember: boolean;
    }) => authService.login(email, password, remember),

    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: ['me'],
        queryFn: authService.me,
      });
    },
  });
}
