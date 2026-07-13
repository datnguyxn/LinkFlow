import { config } from '@/config';

// auth.api.ts
export function loginWithGoogle() {
  const width = 520;
  const height = 700;

  const left = window.screenX + (window.outerWidth - width) / 2;

  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    `${config.NEXT_PUBLIC_API_URL}/api/v1/auth/google`,
    'google-login',
    `
    width=${width},
    height=${height},
    left=${left},
    top=${top}
    `,
  );
}

import { api } from '@/lib/axios';

import type {
  LoginResponse,
  LoginRequest,
  ProfileResponse,
  RefreshResponse,
  RegisterResponse,
  RegisterRequest,
} from '@/types/auth';

const PREFIX = '/api/v1';

export const authApi = {
  /**
   * Login
   */
  login(data: LoginRequest) {
    return api.post<LoginResponse>(`${PREFIX}/auth/login`, data);
  },

  /**
   * Register
   */
  register(data: RegisterRequest) {
    return api.post<RegisterResponse>(`${PREFIX}/auth/register`, data);
  },

  /**
   * Refresh Access Token
   */
  refreshToken() {
    return api.get<RefreshResponse>(`${PREFIX}/auth/refresh-token`);
  },

  /**
   * Logout
   */
  logout() {
    return api.get(`${PREFIX}/auth/logout`);
  },

  /**
   * Current User
   */
  me() {
    return api.get<ProfileResponse>(`${PREFIX}/user/me`);
  },

  /**
   * Exchange Refresh Token for Access Token
   */
  exchange() {
    return api.get(`${PREFIX}/auth/exchange`);
  },

  /**
   * Verify Email
   */
  verifyEmail(token: string) {
    return api.get(`${PREFIX}/auth/verify-email?token=${token}`);
  },

  /**
   * Resend Verification Email
   */
  resendVerificationEmail(email: string) {
    return api.post(`${PREFIX}/auth/resend-verification-email`, { email });
  },

  /**
   * Forgot Password
   */
  forgotPassword(data: { email: string }) {
    return api.post(`${PREFIX}/auth/forgot-password`, data);
  },

  /**
   * Reset Password Validate
   */
  resetPasswordValidate(token: string) {
    return api.get(`${PREFIX}/auth/reset-password/validate?token=${token}`);
  },

  /**
   * Reset Password
   */
  resetPassword(data: { token: string; password: string }) {
    return api.post(`${PREFIX}/auth/reset-password`, data);
  },
};
