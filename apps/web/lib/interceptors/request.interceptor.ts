// lib/interceptors/request.interceptor.ts

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { tokenStorage } from '../storage/token.storage';

/**
 * Attach access token to every request.
 */
export function requestSuccess(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return config;
}

/**
 * Handle request error.
 */
export function requestError(error: AxiosError) {
  return Promise.reject(error);
}
