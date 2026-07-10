"use client";

import { useAuthStore } from "@/stores/auth.store";

import { authService } from "@/services/auth.service";

export function useAuth() {
  const user = useAuthStore(
    (state) => state.user,
  );

  const loading = useAuthStore(
    (state) => state.loading,
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  return {
    user,

    loading,

    isAuthenticated,

    login: authService.login.bind(
      authService,
    ),

    logout: authService.logout.bind(
      authService,
    ),

    refresh: authService.refresh.bind(
      authService,
    ),

    me: authService.me.bind(
      authService,
    ),
  };
}