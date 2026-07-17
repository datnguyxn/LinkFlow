import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { api } from '../axios';
import { authService } from '@/services/auth.service';
import { appToast } from '@/lib/toast';
import type { ApiErrorResponse } from '@/types/api';

let isRefreshing = false;

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let failedQueue: PendingRequest[] = [];

function processQueue(error: unknown, token?: string) {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token!);
    }
  });

  failedQueue = [];
}

export function responseSuccess(response: AxiosResponse) {
  return response;
}

export async function responseError(error: AxiosError<ApiErrorResponse>) {
  const originalRequest = error.config as
    | (InternalAxiosRequestConfig & {
      _retry?: boolean;
    })
    | undefined;

  if (!originalRequest) {
    return Promise.reject(error);
  }

  if (!error.response) {
    appToast.error('Network error');
    return Promise.reject(error);
  }


  const status = error.response?.status;
  const data = error.response?.data;

  // Hiển thị toast cho lỗi business (trừ 401)
  if (status && status !== 401 && data) {
    appToast.error(data.errors?.[0]?.message ?? data.message ?? 'Something went wrong.');

    return Promise.reject(error);
  }

  // Không phải 401
  if (status !== 401) {
    return Promise.reject(error);
  }

  // Không refresh cho login/refresh/register
  const url = originalRequest.url ?? '';

  if (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/refresh-token')
  ) {
    if (data) {
      appToast.error(data.errors?.[0]?.message ?? data.message ?? 'Something went wrong.');
    }

    return Promise.reject(error);
  }

  // Đã retry rồi
  if (originalRequest._retry) {
    await authService.logout();

    return Promise.reject(error);
  }

  // Đang refresh
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token) => {
          originalRequest.headers.set('Authorization', `Bearer ${token}`);

          resolve(api(originalRequest));
        },
        reject,
      });
    });
  }

  originalRequest._retry = true;

  isRefreshing = true;

  try {
    const accessToken = await authService.refresh();

    processQueue(null, accessToken);

    originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);

    return api(originalRequest);
  } catch (err) {
    processQueue(err);

    await authService.logout();

    appToast.error('Your session has expired. Please sign in again.');

    return Promise.reject(err);
  } finally {
    isRefreshing = false;
  }
}
