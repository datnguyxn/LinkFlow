import { AuthService } from '../service/auth.service.ts';
import { ResponseHandler } from '../../../common/responses/handler.response.js';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { ERROR_CODE, HTTP_STATUS, cookieOptions } from '../../../common/constants/index.ts';
import type { AuthResponse } from '../types/auth.type.ts';
import type { RegisterBody } from '../validator/register.validator.ts';
import type { LoginBody } from '../validator/login.validator.ts';
import { UnauthorizedError } from '../../../common/errors/index.ts';
import { OAuthService } from '../service/oauth.service.ts';
import type { GoogleCallbackQuery } from '../types/google.type.ts';
import { config } from '../../../config/env/index.ts';
import type { ForgotPasswordBody } from '../validator/forgot-password.validator.ts';
import type { ResetPasswordBody } from '../validator/reset-password.validator.ts';

/**
 * AuthController handles incoming HTTP requests related to authentication.
 * - It delegates business logic to the AuthService and formats responses.
 */

export class AuthController {
  private authService: AuthService;
  private oauthService: OAuthService;

  constructor() {
    // Initialize service layer
    this.authService = new AuthService();
    this.oauthService = new OAuthService();
  }

  /**
   * Handle user registration request
   * Flow:
   * 1. Extract body from request
   * 2. Call service to register user
   * 3. Return error if user already exists
   * 4. Return success response with tokens
   *
   * @param request - FastifyRequest containing the registration data
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to an AuthResponse or an error response
   */
  async registerUser(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    // Extract validated input from request body
    const { email, password, fullName } = request.body;

    const ipAddress = request.ip;

    // Call service layer to handle business logic
    await this.authService.registerUser(email, password, fullName, ipAddress);

    // Successful registration
    return ResponseHandler.success(
      reply,
      null,
      request.t('auth.registerSuccess'),
      HTTP_STATUS.CREATED,
    );
  }

  /**
   * Handle user login request
   * Flow:
   * 1. Extract body from request
   * 2. Call service to login user
   * 3. Return error if credentials are invalid
   * 4. Return success response with tokens
   *
   * @param request - FastifyRequest containing the login data
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to an AuthResponse or an error response
   */
  async loginUser(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    // Extract validated input from request body
    const { email, password, rememberMe } = request.body;

    const ipAddress = request.ip;

    const userAgent = request.headers['user-agent'];

    // Call service layer to handle business logic
    const data = await this.authService.loginUser(email, password, {
      rememberMe,
      ipAddress,
      userAgent,
    });

    // Handle case: invalid credentials
    if (data === null) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.UNAUTHORIZED,
        request.t('common.invalidCredentials'),
      );
    }

    // Set refresh token in HTTP-only cookie for security
    reply.setCookie('refreshToken', data.refreshToken, cookieOptions);

    // Successful login
    return ResponseHandler.success<AuthResponse>(
      reply,
      data,
      request.t('auth.loginSuccess'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle refresh token request
   * Flow:
   * 1. Extract refresh token from cookies
   * 2. Call service to refresh tokens
   * 3. Return error if refresh token is missing or invalid
   * 4. Return success response with new tokens
   *
   * @param request - FastifyRequest containing the refresh token in cookies
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to an AuthResponse or an error response
   */
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    // Extract refresh token from cookies
    const refreshToken = request.cookies.refreshToken;

    // Handle case: missing refresh token
    if (!refreshToken) {
      throw new UnauthorizedError(
        'auth.middleware.missingRefreshToken',
        ERROR_CODE.MISSING_REFRESH_TOKEN,
      );
    }

    // Get ip address and user agent for logging or additional security checks
    const ipAddress = request.ip;

    const userAgent = request.headers['user-agent'];

    // Call service layer to handle business logic
    const data = await this.authService.refresh(refreshToken, ipAddress, userAgent);

    if (!data) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.UNAUTHORIZED,
        request.t('auth.refreshFailed'),
      );
    }

    reply.setCookie('refreshToken', data.refreshToken, cookieOptions);

    // Set new refresh token in HTTP-only cookie for security
    reply.setCookie('refreshToken', data.refreshToken, cookieOptions);

    // Successful token refresh
    return ResponseHandler.success<AuthResponse>(
      reply,
      data,
      request.t('auth.refreshSuccess'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle user logout request
   * Flow:
   * 1. Extract refresh token from cookies
   * 2. Call service to logout user
   * 3. Clear refresh token cookie
   * 4. Return success response
   *
   * @param request - FastifyRequest containing the refresh token in cookies
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to a success response or an error response
   */
  async logoutUser(request: FastifyRequest, reply: FastifyReply) {
    // Extract refresh token from cookies
    const refreshToken = request.cookies.refreshToken;

    console.log('Logout request received. Refresh token:', refreshToken);

    // Handle case: missing refresh token
    if (!refreshToken) {
      throw new UnauthorizedError(
        'auth.middleware.missingRefreshToken',
        ERROR_CODE.MISSING_REFRESH_TOKEN,
      );
    }

    // Get ip address for logging or additional security checks
    const ipAddress = request.ip;

    // Call service layer to handle business logic for logout
    await this.authService.logout(refreshToken, ipAddress);

    // Clear the refresh token cookie on logout
    reply.clearCookie('refreshToken', cookieOptions);

    // Successful logout
    return ResponseHandler.success(reply, null, request.t('auth.logoutSuccess'), HTTP_STATUS.OK);
  }

  /**
   * Handle Google OAuth login request
   * Flow:
   * 1. Extract authorization code from query parameters
   * 2. Call service to exchange code for tokens and get user info
   * 3. Return error if code is missing or invalid
   * 4. Return success response with tokens
   *
   * @param request - FastifyRequest containing the authorization code in query parameters
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to an AuthResponse or an error response
   */
  async loginWithGoogle(
    request: FastifyRequest<{ Querystring: { code: string } }>,
    reply: FastifyReply,
  ) {
    // Generate Google OAuth authorization URL and state
    const { url, state } = this.oauthService.getGoogleAuthorizationUrl();

    // Set the state in a secure, HTTP-only cookie to prevent CSRF attacks
    reply.setCookie('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 300, // 5 phút
    });

    // Redirect the user to Google's OAuth 2.0 authorization endpoint
    return reply.redirect(url);
  }

  /**
   * Handle Google OAuth callback request
   * Flow:
   * 1. Extract authorization code from query parameters
   * 2. Call service to exchange code for tokens and get user info
   * 3. Return error if code is missing or invalid
   * 4. Set refresh token in cookie and redirect to dashboard
   *
   * @param request - FastifyRequest containing the authorization code in query parameters
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to a redirect response or an error response
   */
  async googleCallback(
    request: FastifyRequest<{
      Querystring: GoogleCallbackQuery;
    }>,
    reply: FastifyReply,
  ) {
    // Extract the authorization code from the query parameters
    const { code, error, rememberMe } = request.query;

    if (error) {
      return reply.redirect(`${config.CLIENT_URL}/oauth-popup.html?error=${error}`);
    }

    if (!code) {
      return reply.redirect(`${config.CLIENT_URL}/oauth-popup.html?error=missing_code`);
    }

    // Handle case: missing authorization code
    const tokens = await this.oauthService.loginWithGoogle(code, {
      rememberMe: rememberMe,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
    });

    // Set the refresh token in a secure, HTTP-only cookie for security
    reply.setCookie('refreshToken', tokens.refreshToken, cookieOptions);

    // Redirect the user to the dashboard after successful login
    // return reply.redirect(
    //     `${config.CLIENT_URL}/oauth/success`,
    // );
    // reply.headers({
    //     "Content-Security-Policy":
    //         "default-src 'self'; script-src 'self' 'unsafe-inline'",
    //     "Cross-Origin-Opener-Policy":
    //         "unsafe-none",
    // });

    // const origin = new URL(config.CLIENT_URL).origin;

    // return reply
    //     .type("text/html")
    //     .send(`
    //             <!DOCTYPE html>
    //             <html>
    //             <body>
    //             <script>
    //             console.log("callback loaded");
    //             console.log('window.opener =', window.opener);

    //             if (window.opener) {
    //                 console.log("Sending message to opener window");
    //                 window.opener.postMessage(
    //                     {
    //                         type: "GOOGLE_LOGIN_SUCCESS"
    //                     },
    //                     "${origin}"
    //             );}

    //             console.log("Closing window");

    //             //window.close();
    //             </script>
    //             </body>
    //             </html>
    //         `);

    return reply.redirect(`${config.CLIENT_URL}/oauth-popup.html`);
  }

  /**
   * Handle token exchange request
   * Flow:
   * 1. Extract refresh token from cookies
   * 2. Call service to exchange refresh token for new access token
   * 3. Return error if refresh token is missing or invalid
   * 4. Return success response with new access token
   *
   * @param request - FastifyRequest containing the refresh token in cookies
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to an AuthResponse or an error response
   */
  async exchange(request: FastifyRequest, reply: FastifyReply) {
    // Extract refresh token from cookies
    const refreshToken = request.cookies.refreshToken;

    // Handle case: missing refresh token
    if (!refreshToken) {
      throw new UnauthorizedError(
        'auth.middleware.missingRefreshToken',
        ERROR_CODE.MISSING_REFRESH_TOKEN,
      );
    }

    // Call service layer to handle business logic for token exchange
    const result = await this.authService.exchange(refreshToken);

    // Handle case: invalid or expired refresh token
    if (!result) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.UNAUTHORIZED,
        request.t('auth.exchangeFailed'),
      );
    }

    // Set new refresh token in HTTP-only cookie for security
    return ResponseHandler.success(
      reply,
      result,
      request.t('auth.exchangeSuccess'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle email verification request
   * Flow:
   * 1. Extract verification token from query parameters
   * 2. Call service to verify email using the token
   * 3. Return error if token is missing or invalid
   * 4. Set refresh token in cookie and return success response
   *
   * @param request - FastifyRequest containing the verification token in query parameters
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to an AuthResponse or an error response
   */
  async verifyEmail(
    request: FastifyRequest<{ Querystring: { token: string } }>,
    reply: FastifyReply,
  ) {
    // Extract the verification token from the query parameters
    const { token } = request.query;

    // Handle case: missing verification token
    if (!token) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        request.t('auth.missingVerificationToken'),
      );
    }

    // Get ip address and user agent for logging or additional security checks
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    // Call service layer to handle business logic for email verification
    const data = await this.authService.verifyEmail(token, ipAddress, userAgent);

    if (!data) {
      return ResponseHandler.error(
        reply,
        HTTP_STATUS.BAD_REQUEST,
        request.t('auth.verificationFailed'),
      );
    }

    // Set refresh token in HTTP-only cookie for security
    reply.setCookie('refreshToken', data.refreshToken, cookieOptions);

    // Successful email verification
    return ResponseHandler.success<AuthResponse>(
      reply,
      data,
      request.t('auth.verificationSuccess'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle resend verification email request
   * Flow:
   * 1. Extract email from request body
   * 2. Call service to resend verification email
   * 3. Return success response
   *
   * @param request - FastifyRequest containing the email in the body
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to a success response or an error response
   */
  async resendVerificationEmail(
    request: FastifyRequest<{ Body: { email: string } }>,
    reply: FastifyReply,
  ) {
    // Extract email from request body
    const { email } = request.body;

    // Call service layer to handle business logic for resending verification email
    await this.authService.resendVerificationEmail(email);

    // Successful resend of verification email
    return ResponseHandler.success(
      reply,
      null,
      request.t('auth.verificationEmailSent'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle forgot password request
   * Flow:
   * 1. Extract email from request body
   * 2. Call service to initiate forgot password process
   * 3. Return success response
   *
   * @param request - FastifyRequest containing the email in the body
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to a success response or an error response
   */
  async forgotPassword(request: FastifyRequest<{ Body: ForgotPasswordBody }>, reply: FastifyReply) {
    // Extract email from request body
    const { email } = request.body;

    // Get ip address for logging or additional security checks
    const ipAddress = request.ip;

    // Call service layer to handle business logic for forgot password
    await this.authService.forgotPassword(email, ipAddress);

    // Successful initiation of forgot password process
    return ResponseHandler.success(
      reply,
      null,
      request.t('auth.forgotPassword.success'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle reset password request
   * Flow:
   * 1. Extract reset token and new password from request body
   * 2. Call service to reset password using the token
   * 3. Return success response
   *
   * @param request - FastifyRequest containing the reset token and new password in the body
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to a success response or an error response
   */
  async validateResetPassword(
    request: FastifyRequest<{
      Querystring: {
        token: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    // Call service layer to validate the reset password token
    await this.authService.validateResetPasswordToken(request.query.token);

    // Successful validation of reset password token
    return ResponseHandler.success(
      reply,
      null,
      request.t('auth.resetPassword.tokenValid'),
      HTTP_STATUS.OK,
    );
  }

  /**
   * Handle reset password request
   * Flow:
   * 1. Extract reset token and new password from request body
   * 2. Call service to reset password using the token
   * 3. Return success response
   *
   * @param request - FastifyRequest containing the reset token and new password in the body
   * @param reply - FastifyReply to send the response
   * @returns A promise that resolves to a success response or an error response
   */
  async resetPassword(
    request: FastifyRequest<{
      Querystring: {
        token: string;
      };
      Body: ResetPasswordBody;
    }>,
    reply: FastifyReply,
  ) {
    // Call service layer to reset the password using the provided token and new password
    await this.authService.resetPassword(request.query.token, request.body.password);

    // Successful password reset
    return ResponseHandler.success(
      reply,
      null,
      request.t('auth.resetPassword.success'),
      HTTP_STATUS.OK,
    );
  }
}
