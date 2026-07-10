import type {
  AxiosError,
  AxiosResponse,
} from "axios";

import { api } from "../axios";
import { authService } from "@/services/auth.service";

let isRefreshing = false;

interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let failedQueue: PendingRequest[] = [];

function processQueue(
  error: unknown,
  token?: string,
) {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token!);
    }
  });

  failedQueue = [];
}

export function responseSuccess(
  response: AxiosResponse,
) {
  return response;
}

export async function responseError(
  error: AxiosError,
) {
  const originalRequest = error.config;

  if (!originalRequest) {
    return Promise.reject(error);
  }

  if (error.response?.status !== 401) {
    return Promise.reject(error);
  }

  if (originalRequest._retry) {
    return Promise.reject(error);
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token) => {
          originalRequest.headers.Authorization =
            `Bearer ${token}`;

          resolve(api(originalRequest));
        },
        reject,
      });
    });
  }

  originalRequest._retry = true;

  isRefreshing = true;

  try {
    const accessToken =
      await authService.refresh();

    processQueue(null, accessToken);

    originalRequest.headers.Authorization =
      `Bearer ${accessToken}`;

    return api(originalRequest);

  } catch (err) {

    processQueue(err);

    await authService.logout();

    return Promise.reject(err);

  } finally {

    isRefreshing = false;

  }
}