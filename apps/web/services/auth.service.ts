import { queryClient } from '@/lib/query-client';
import { authApi } from '@/lib/apis/auth.api';
import { tokenStorage } from '@/lib/storage/token.storage';
import { useAuthStore } from '@/stores/auth.store';
import { authEvents } from '@/events/auth.event';
import { AUTH_EVENT, createAuthChannel } from '@/lib/auth-broadcast';

class AuthService {
  /**
   * Register
   */
  async register(email: string, password: string, fullName: string) {
    await authApi.register({
      email,
      password,
      fullName,
    });
  }

  /**
   * Login
   */
  async login(email: string, password: string, remember: boolean) {
    const response = await authApi.login({
      email,
      password,
      rememberMe: remember,
    });

    tokenStorage.setAccessToken(response.data.data.accessToken);

    const me = await authApi.me();

    useAuthStore.getState().setUser(me.data.data);

    queryClient.setQueryData(['me'], me.data.data);

    return me.data.data;
  }

  /**
   * Refresh token
   */
  async refresh() {
    const response = await authApi.refreshToken();

    tokenStorage.setAccessToken(response.data.data.accessToken);

    return response.data.data.accessToken;
  }

  /**
   * Profile
   */
  async me() {
    const user = await authApi.me();

    useAuthStore.getState().setUser(user.data.data);

    queryClient.setQueryData(['me'], user.data.data);

    queryClient.invalidateQueries({
      queryKey: ['me'],
    });

    return user;
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await authApi.logout();
    } catch {}

    tokenStorage.clear();

    useAuthStore.getState().logout();

    queryClient.clear();

    authEvents.emit('logout');

    const channel = createAuthChannel();

    channel?.postMessage({
      type: AUTH_EVENT.LOGOUT,
    });

    channel?.close();
  }

  /**
   * App initialize
   */
  async initialize() {
    const authStore = useAuthStore.getState();

    authStore.setLoading(true);

    try {
      let accessToken = tokenStorage.getAccessToken();

      if (!accessToken) {
        accessToken = await this.refresh();
      }

      await this.me();
    } catch {
      await this.logout();
    } finally {
      authStore.setLoading(false);
    }
  }

  /**
   * Exchange Google Login
   */
  async exchangeGoogleLogin() {
    const response = await authApi.exchange();

    tokenStorage.setAccessToken(response.data.data.accessToken);

    useAuthStore.getState().setUser(response.data.data.user);

    return response.data.data.user;
  }

  /**
   * Verify Email
   */
  async verifyEmail(token: string) {
    const response = await authApi.verifyEmail(token);

    tokenStorage.setAccessToken(response.data.data.accessToken);

    useAuthStore.getState().setUser(response.data.data.user);

    return response.data.data.user;
  }

  /**
   * Resend Verification Email
   */
  async resendVerificationEmail(email: string) {
    const response = await authApi.resendVerificationEmail(email);

    return response.data.data;
  }

  /**
   * Forgot Password
   */
  async forgotPassword(email: string) {
    return authApi.forgotPassword({
      email,
    });
  }

  /**
   * Reset Password
   */
  async resetPassword(token: string, password: string) {
    return authApi.resetPassword({
      token,
      password,
    });
  }

  /**
   * Reset Password Validate
   */
  async resetPasswordValidate(token: string) {
    return authApi.resetPasswordValidate(token);
  }
}

export const authService = new AuthService();
