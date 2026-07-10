import type { InternalAxiosRequestConfig } from "axios";

import { tokenStorage } from "../storage/token.storage";

/**
 * Automatically attach access token to every request.
 */
export function requestInterceptor(
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {

    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
}