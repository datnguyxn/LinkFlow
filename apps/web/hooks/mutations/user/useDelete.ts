import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';

export function useDelete() {
  return useMutation({
    mutationFn: () => userService.deleteAccount(),
  });
}
