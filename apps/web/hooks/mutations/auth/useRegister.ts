import { useMutation } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';

export function useRegister() {
  return useMutation({
    mutationFn: ({
      email,
      password,
      fullName,
    }: {
      email: string;
      password: string;
      fullName: string;
    }) => authService.register(email, password, fullName),
  });
}
