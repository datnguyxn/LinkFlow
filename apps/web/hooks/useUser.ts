import { useUserStore } from '@/stores/user.store';
import { userService } from '@/services/user.service';

export function useUser() {
  const user = useUserStore((s) => s.user);

  const loading = useUserStore((s) => s.loading);

  const updateUser = useUserStore((s) => s.updateUser);

  const setUser = useUserStore((s) => s.setUser);

  const clearUser = useUserStore((s) => s.clearUser);

  return {
    user,
    loading,

    updateUser,
    setUser,
    clearUser,
    uploadAvatar: userService.uploadAvatar.bind(userService),
    updateUserProfile: userService.updateUserProfile.bind(userService),
    deleteAccount: userService.deleteAccount.bind(userService),
    changePassword: userService.changePassword.bind(userService),
    getAvatar: userService.getAvatar.bind(userService),
  };
}
