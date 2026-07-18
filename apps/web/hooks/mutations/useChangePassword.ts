import { useMutation } from '@tanstack/react-query';

import { userService } from '@/services/user.service';

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ oldPassword, newPassword }: { oldPassword: string; newPassword: string }) =>
      userService.changePassword(oldPassword, newPassword),
  });
}
