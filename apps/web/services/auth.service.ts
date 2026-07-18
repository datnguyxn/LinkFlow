import { authApi } from '@/lib/apis/auth.api';
import { tokenStorage } from '@/lib/storage/token.storage';

class AuthService {
  /**
   * Register
   */
  async register(email: string, password: string, fullName: string) {
    return authApi.register({
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

    return this.me();
  }

  /**
   * Refresh Token
   */
  async refresh() {
    const response = await authApi.refreshToken();

    tokenStorage.setAccessToken(response.data.data.accessToken);

    return response.data.data.accessToken;
  }

  /**
   * Current User
   */
  async me() {
    const response = await authApi.me();

    return response.data.data;
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await authApi.logout();
    } finally {
      tokenStorage.clear();
    }
  }

  /**
   * Initialize App
   */
  async initialize() {
    let accessToken = tokenStorage.getAccessToken();

    if (!accessToken) {
      accessToken = await this.refresh();
    }

    return this.me();
  }

  /**
   * Google Exchange
   */
  async exchangeGoogleLogin() {
    const response = await authApi.exchange();

    tokenStorage.setAccessToken(response.data.data.accessToken);

    return response.data.data.user;
  }

  /**
   * Verify Email
   */
  async verifyEmail(token: string) {
    const response = await authApi.verifyEmail(token);

    tokenStorage.setAccessToken(response.data.data.accessToken);

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
   * Validate Reset Password Token
   */
  async resetPasswordValidate(token: string) {
    return authApi.resetPasswordValidate(token);
  }

  /**
   * Active Sessions
   */
  async listActiveSessions() {
    const response = await authApi.listActiveSessions();

    return response.data.data;
  }

  /**
   * Sign Out Session
   */
  async signOutSession(sessionId: string) {
    return authApi.signOutSession(sessionId);
  }

  /**
   * Sign Out All Other Sessions
   */
  async signOutAllOtherSessions() {
    return authApi.signOutAllOtherSessions();
  }
}

export const authService = new AuthService();
