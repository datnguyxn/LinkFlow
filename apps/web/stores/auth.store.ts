import { create } from "zustand";

import type { UserProfile } from "@/types/auth";

interface AuthState {
  user: UserProfile | null;

  loading: boolean;

  isAuthenticated: boolean;
}

interface AuthActions {
  setUser(user: UserProfile | null): void;

  setLoading(value: boolean): void;

  logout(): void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore =
  create<AuthStore>((set) => ({
    user: null,

    loading: true,

    isAuthenticated: false,

    setUser(user) {
      set({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    },

    setLoading(value) {
      set({
        loading: value,
      });
    },

    logout() {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    },
  }));