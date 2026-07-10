import { queryClient } from "@/lib/query-client";

import { authApi } from "@/lib/apis/auth.api";

import { tokenStorage } from "@/lib/storage/token.storage";

import { useAuthStore } from "@/stores/auth.store";

class AuthService {
    /**
     * Login
     */
    async login(
        email: string,
        password: string,
        remember: boolean,
    ) {
        const response = await authApi.login({
            email,
            password,
            remember,
        });

        tokenStorage.setAccessToken(
            response.data.data.accessToken,
        );

        const me = await authApi.me();

        useAuthStore
            .getState()
            .setUser(me.data.data);

        queryClient.setQueryData(
            ["me"],
            me.data.data,
        );

        return me.data.data;
    }

    /**
     * Refresh token
     */
    async refresh() {
        const response =
            await authApi.refreshToken();

        tokenStorage.setAccessToken(
            response.data.data.accessToken,
        );

        return response.data.data.accessToken;
    }

    /**
     * Profile
     */
    async me() {
        const user =
            await authApi.me();

        useAuthStore
            .getState()
            .setUser(user.data.data);

        queryClient.setQueryData(
            ["me"],
            user.data.data,
        );

        queryClient.invalidateQueries({
            queryKey: ["me"],
        });

        return user;
    }

    /**
     * Logout
     */
    async logout() {
        try {
            await authApi.logout();
        } catch { }

        tokenStorage.clear();

        useAuthStore
            .getState()
            .logout();

        queryClient.clear();
    }

    /**
     * App initialize
     */
    async initialize() {
        const token =
            tokenStorage.getAccessToken();

        if (!token) {
            return;
        }

        try {
            await this.me();
        } catch {
            await this.logout();
        }
    }

    /**
     * Exchange Google Login
     */
    async exchangeGoogleLogin() {
        const response =
            await authApi.exchange();

        tokenStorage.setAccessToken(
            response.data.data.accessToken,
        );

        useAuthStore
            .getState()
            .setUser(
                response.data.data.user,
            );

        return response.data.data.user;
    }
}

export const authService =
    new AuthService();