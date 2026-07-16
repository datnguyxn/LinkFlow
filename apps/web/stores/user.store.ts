import { create } from 'zustand';

import type { UserProfile } from '@/types/auth';

interface UserState {
  user: UserProfile | null;
  loading: boolean;
}

interface UserActions {
  setUser: (user: UserProfile | null) => void;

  updateUser: (data: Partial<UserProfile>) => void;

  clearUser: () => void;

  setLoading: (loading: boolean) => void;
}

type UserStore = UserState & UserActions;

export const useUserStore = create<UserStore>((set) => ({
  user: null,

  loading: true,

  setUser: (user) =>
    set({
      user,
      loading: false,
    }),

  updateUser: (data) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            ...data,
          }
        : null,
    })),

  clearUser: () =>
    set({
      user: null,
      loading: false,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),
}));
