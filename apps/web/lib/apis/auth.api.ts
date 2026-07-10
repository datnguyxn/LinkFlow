import { config } from "@/config";

export function loginWithGoogle() {
    window.location.href =
        `${config.NEXT_PUBLIC_API_URL}/api/v1/auth/google`;
}


import { api } from "@/lib/axios";

import type {
    LoginResponse,
    LoginRequest,
    ProfileResponse,
    RefreshResponse,
    RegisterResponse,
    RegisterRequest,
} from "@/types/auth";

const PREFIX = "/api/v1";

export const authApi = {
    /**
     * Login
     */
    login(data: LoginRequest) {
        return api.post<LoginResponse>(
            `${PREFIX}/auth/login`,
            data,
        );
    },

    /**
     * Register
     */
    register(data: RegisterRequest) {
        return api.post<RegisterResponse>(
            `${PREFIX}/auth/register`,
            data,
        );
    },

    /**
     * Refresh Access Token
     */
    refreshToken() {
        return api.post<RefreshResponse>(
            `${PREFIX}/auth/refresh`,
        );
    },

    /**
     * Logout
     */
    logout() {
        return api.post(`${PREFIX}/auth/logout`);
    },

    /**
     * Current User
     */
    me() {
        return api.get<ProfileResponse>(
            `${PREFIX}/user/me`,
        );
    },

    /**
     * Exchange Refresh Token for Access Token
     */
    exchange() {
        return api.get(`${PREFIX}/auth/exchange`);
    },
};