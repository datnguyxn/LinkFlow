import { UserRepository } from './../../users/index.ts';
import { WorkspaceRepository } from '../../workspace/index.ts';
import { RefreshTokenRepository } from '../../refresh-token/index.ts';
import { EmailVerificationRepository } from '../../email-verification/index.ts';

import type { AuthResponse } from '../types/auth.type.ts';
import { hashPassword, comparePassword } from '../../../utils/password.util.ts';
import { JwtService } from './jwt.service.ts';
import { ERROR_CODE, LANGUAGE } from '../../../common/constants/index.ts';
import { ConflictError, ForbiddenError, UnauthorizedError } from '../../../common/errors/index.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import { config } from '../../../config/env/index.ts';
import type {
  UserRegisteredEvent,
  UserLoginEvent,
  UserLogoutEvent,
  PasswordResetRequestedEvent,
} from '../../../events/index.ts';
import { randomUUID } from 'node:crypto';
import { AuthPublisher } from '../../../publishers/auth/auth.publisher.ts';
import { Publisher } from '../../../infrastructure/queue/index.ts';
import { UserStatus, type User } from '@prisma/client';
import type { LoginOptions } from '../types/login-option.type.ts';
import { PasswordResetRepository } from '../../password-reset/index.ts';
import type { PasswordResetToken } from '@prisma/client';
import { parseUserAgent } from '../../../utils/user-agent.util.ts';

/**
 * AuthService handles business logic related to authentication.
 * - It interacts with repositories for data access and utilities for token generation.
 * - Keeps controller layer clean by encapsulating complex logic.
 */
export class AuthService {
  constructor(
    private userRepository = new UserRepository(),
    private workspaceRepository = new WorkspaceRepository(),
    private refreshTokenRepository = new RefreshTokenRepository(),
    private jwtService = new JwtService(),
    private transactionService = new TransactionService(),
    private emailVerificationRepository = new EmailVerificationRepository(),
    private passwordResetRepository = new PasswordResetRepository(),
    private authPublisher = new AuthPublisher(new Publisher()),
  ) {}

  /**
   * Register a new user
   * - Checks for duplicate email
   * - Hashes password
   * - Creates user and default workspace in a transaction
   * - Generates JWT tokens
   * - Publishes user registered event to RabbitMQ
   *
   * @param email - User's email
   * @param password - User's password
   * @param fullName - User's full name
   * @param ipAddress - Optional IP address of the request
   * @param userAgent - Optional user agent of the request
   * @returns AuthResponse containing access and refresh tokens
   * @throws ConflictError if the email is already registered
   */
  async registerUser(
    email: string,
    password: string,
    fullName: string,
    ipAddress?: string,
  ): Promise<void> {
    // Check duplicate email
    const existingUser = await this.userRepository.findByEmail(email);

    // If user exists and is active or email is verified, throw conflict error
    if (existingUser) {
      // Check user status and throw appropriate error if not active
      this.checkUserStatus(existingUser);

      // If the user exists but is inactive or email not verified, resend verification email
      if (existingUser.emailVerified || existingUser.status === UserStatus.ACTIVE) {
        throw new ConflictError('auth.userAlreadyExists', ERROR_CODE.USER_ALREADY_EXISTS);
      }

      // If user exists but is inactive or email not verified, resend verification email
      await this.sendVerificationEmail(existingUser, ipAddress);
      return; // Exit early after resending verification email
    }

    // Create a pending user with a verification token
    const result = await this.createPendingUser(email, password, fullName);

    // Create a user registered event to publish to RabbitMQ
    const event: UserRegisteredEvent = {
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName || '',
      verifyToken: result.verifyToken, // Using the generated verification token
      ipAddress: ipAddress, // You can set this if you have access to the request IP
    };

    // Publish the user registered event to notify other services or components
    await this.authPublisher.userRegistered(event);
  }

  /**
   * Get user information by email
   * Used for authentication / profile lookup
   *
   * @param email - User's email
   * @returns User object or null if not found
   */
  async getCurrentUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Login user with email and password
   * - Validate credentials
   * - Generate access & refresh tokens
   * - Save refresh token in DB
   * - Publish user login event to RabbitMQ
   * @param email - User's email
   * @param password - User's password
   * @param ipAddress - Optional IP address of the request
   * @param userAgent - Optional user agent of the request
   * @returns AuthResponse containing access and refresh tokens or null if login fails
   * @throws UnauthorizedError if credentials are invalid
   * @throws ConflictError if the user is not found
   * @throws Error for any unexpected issues during login
   */
  async loginUser(email: string, password: string, options: LoginOptions): Promise<AuthResponse> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError('request.validationFailed', ERROR_CODE.INVALID_CREDENTIALS);
    } else if (!user.emailVerified) {
      throw new UnauthorizedError('auth.login.emailNotVerified', ERROR_CODE.INVALID_CREDENTIALS);
    }

    this.checkUserStatus(user);

    // Validate password
    const isPasswordValid = await comparePassword(password, user.passwordHash || '');
    if (!isPasswordValid) {
      throw new UnauthorizedError('request.validationFailed', ERROR_CODE.INVALID_CREDENTIALS);
    }

    // Complete login process
    return await this.completeLogin(user, options, 'password');
  }

  /**
   * Refresh access and refresh tokens using a valid refresh token
   * - Verify the provided refresh token
   * - Check if the token is revoked or expired
   * - Generate new access and refresh tokens
   * - Save the new refresh token and revoke the old one
   * - Publish user logout event for the old token (optional)
   *
   * @param refreshToken
   * @param ipAddress
   * @param userAgent
   * @returns
   */
  async refresh(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    // Verify JWT
    const payload = this.jwtService.verifyRefreshToken(refreshToken);

    // Hash token
    const tokenHash = await this.jwtService.hashRefreshToken(refreshToken);

    console.log(
      `[AuthService.refresh] payload: ${JSON.stringify(payload)}, tokenHash: ${tokenHash}`,
    );

    // Find refresh token
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    console.log(`[AuthService.refresh] storedToken: ${JSON.stringify(storedToken)}`);

    if (!storedToken) {
      throw new UnauthorizedError(
        'auth.middleware.invalidRefreshToken',
        ERROR_CODE.INVALID_REFRESH_TOKEN,
      );
    }

    // Check revoked
    if (storedToken.revoked) {
      throw new UnauthorizedError(
        'auth.middleware.invalidRefreshToken',
        ERROR_CODE.INVALID_REFRESH_TOKEN,
      );
    }

    // Check expired
    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError(
        'auth.middleware.refreshTokenExpired',
        ERROR_CODE.REFRESH_TOKEN_EXPIRED,
      );
    }

    // Find user
    const user = await this.userRepository.findById(payload.id);

    if (!user) {
      throw new UnauthorizedError('user.userUnavailable', ERROR_CODE.USER_UNAVAILABLE);
    }

    const refreshExpiresMs = storedToken.rememberMe
      ? config.JWT_REFRESH_REMEMBER_EXPIRES_MS
      : config.JWT_REFRESH_EXPIRES_MS;

    const refreshExpiresIn = storedToken.rememberMe
      ? config.JWT_REFRESH_REMEMBER_EXPIRES_IN
      : config.JWT_REFRESH_EXPIRES_IN;

    const newSessionId = randomUUID();

    // Generate new tokens
    const accessToken = this.jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      language: user.language || LANGUAGE.EN, // default language,
      sessionId: newSessionId,
    });

    const newRefreshToken = this.jwtService.generateRefreshToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        language: user.language || LANGUAGE.EN, // default language,
        sessionId: newSessionId,
      },
      refreshExpiresIn,
    );
    // Hash new refresh token
    const newRefreshTokenHash = await this.jwtService.hashRefreshToken(newRefreshToken);

    await this.transactionService.run(async (tx) => {
      // Save new refresh token
      await this.refreshTokenRepository.create(
        {
          id: newSessionId,
          userId: user.id,
          token: {
            tokenHash: newRefreshTokenHash,
            expiresAt: new Date(Date.now() + Number(refreshExpiresMs)), // default 7 days
            user: {
              connect: {
                id: user.id,
              },
            },
          },
          ipAddress: ipAddress,
          userAgent: userAgent,
          rememberMe: storedToken.rememberMe,
        },
        tx,
      );

      // Revoke old token
      await this.refreshTokenRepository.revoke(storedToken.id, tx);
    });

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user by revoking the refresh token
   * - Hash the provided refresh token
   * - Find the token in the database
   * - Revoke the token to prevent further use
   * - Publish user logout event to RabbitMQ (optional)
   *
   * @param refreshToken - The refresh token to revoke
   * @param ipAddress - Optional IP address of the request
   * @returns void
   * @throws UnauthorizedError if the token is invalid or not found
   * @throws Error for any unexpected issues during logout
   */
  async logout(refreshToken: string, ipAddress: string): Promise<void> {
    // Hash token
    const tokenHash = await this.jwtService.hashRefreshToken(refreshToken);

    // Find refresh token
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedError(
        'auth.middleware.INVALID_REFRESH_TOKEN',
        ERROR_CODE.INVALID_REFRESH_TOKEN,
      );
    }

    // Revoke the refresh token
    await this.refreshTokenRepository.revoke(storedToken.id);

    // Create a user logout event to publish to RabbitMQ
    const event: UserLogoutEvent = {
      userId: storedToken.userId,
      ipAddress: ipAddress,
    };

    // Publish the logout event to notify other services or components
    await this.authPublisher.userLoggedOut(event);
  }

  /**
   * Check the status of a user and throw appropriate errors if the user is not active
   * - ACTIVE: Continue login flow
   * - INACTIVE: Throw ForbiddenError with USER_INACTIVE code
   * - SUSPENDED: Throw ForbiddenError with USER_SUSPENDED code
   * - DELETED: Throw ForbiddenError with USER_DELETED code
   * @param user - The user object to check status for
   * @throws ForbiddenError if the user is not active
   */
  private checkUserStatus(user: { status: UserStatus }) {
    // Check user status
    switch (user.status) {
      case UserStatus.ACTIVE:
        // Continue login flow
        return;

      case UserStatus.INACTIVE:
        throw new ForbiddenError('auth.login.userInactive', ERROR_CODE.USER_INACTIVE);

      case UserStatus.SUSPENDED:
        throw new ForbiddenError('auth.login.userSuspended', ERROR_CODE.USER_SUSPENDED);

      case UserStatus.DELETED:
        throw new ForbiddenError('auth.login.userDeleted', ERROR_CODE.USER_DELETED);

      default:
        throw new ForbiddenError('auth.login.userUnavailable', ERROR_CODE.USER_UNAVAILABLE);
    }
  }

  /**
   * Complete the login process for a user
   * - Generate access and refresh tokens
   * - Save the refresh token in the database
   * - Update the user's last login timestamp
   * - Publish a user login event to RabbitMQ
   * @param user - The user object for whom the login is being completed
   * @param ipAddress - Optional IP address of the request
   * @param userAgent - Optional user agent of the request
   * @returns A promise that resolves to an AuthResponse containing access and refresh tokens
   */
  async completeLogin(user: User, options: LoginOptions, method: string): Promise<AuthResponse> {
    // Generate new session ID for the login session
    const newSessionId = randomUUID();

    // Generate access token
    const accessToken = await this.jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      language: user.language || LANGUAGE.EN, // default language,
      sessionId: newSessionId,
    });

    // Generate refresh token
    const refreshExpiresIn = options.rememberMe
      ? config.JWT_REFRESH_REMEMBER_EXPIRES_IN
      : config.JWT_REFRESH_EXPIRES_IN;

    // Determine refresh token expiration time based on rememberMe option
    const refreshTokenMs = options.rememberMe
      ? config.JWT_REFRESH_REMEMBER_EXPIRES_MS
      : config.JWT_REFRESH_EXPIRES_MS;

    // Generate refresh token with appropriate expiration
    const refreshToken = this.jwtService.generateRefreshToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        language: user.language || LANGUAGE.EN, // default language,
        sessionId: newSessionId,
      },
      refreshExpiresIn,
    );

    // Save refresh token
    await this.refreshTokenRepository.create({
      id: newSessionId,
      userId: user.id,
      token: {
        tokenHash: await this.jwtService.hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + Number(refreshTokenMs)), // default 7 days
        user: {
          connect: {
            id: user.id,
          },
        },
      },
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      rememberMe: options.rememberMe,
    });

    // Update last login timestamp
    await this.userRepository.updateLastLogin(user.id);

    // Publish user login event to RabbitMQ
    const event: UserLoginEvent = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName || '',
      ipAddress: options.ipAddress, // You can set this if you have access to the request IP
      method: method as 'password' | 'google', // Assuming method is passed correctly
    };

    await this.authPublisher.userLoggedIn(event);

    // Return tokens to the controller for response
    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  /**
   * Exchange a valid refresh token for a new access token
   * - Verify the provided refresh token
   * - Check if the token is revoked or expired
   * - Generate a new access token
   * @param refreshToken - The refresh token to exchange
   * @returns An object containing the new access token and user information
   * @throws UnauthorizedError if the refresh token is invalid or the user is not found
   */
  async exchange(refreshToken: string) {
    // Verify the refresh token and get the payload
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    // Hash the refresh token to find it in the database
    const user = await this.userRepository.findById(payload.id);

    // Check if user exists
    if (!user) {
      throw new UnauthorizedError(
        'auth.middleware.INVALID_REFRESH_TOKEN',
        ERROR_CODE.INVALID_REFRESH_TOKEN,
      );
    }

    // Check user status
    const accessToken = this.jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      language: user.language || LANGUAGE.EN, // default language,
      sessionId: payload.sessionId,
    });

    // Return the new access token and user information
    return {
      accessToken,
      user,
    };
  }

  /**
   * Verify a user's email using a verification token
   * - Check if the token exists and is valid
   * - Update the user's status to ACTIVE and mark email as verified
   * - Create a default workspace for the user
   * - Delete the verification token after successful verification
   * - Complete the login process and return authentication tokens
   * @param verifyToken - The email verification token
   * @param ipAddress - Optional IP address of the request
   * @param userAgent - Optional user agent of the request
   * @returns AuthResponse containing access and refresh tokens
   * @throws UnauthorizedError if the token is invalid, expired, or the user is not found
   */
  async verifyEmail(
    verifyToken: string,
    ipAddress: string,
    userAgent: string | undefined,
  ): Promise<AuthResponse> {
    // Find the verification token in the database
    const verificationRecord = await this.emailVerificationRepository.findByToken(verifyToken);

    if (!verificationRecord) {
      throw new UnauthorizedError(
        'auth.verifyEmail.invalidToken',
        ERROR_CODE.INVALID_EMAIL_VERIFICATION_TOKEN,
      );
    }

    // Check if the token has expired
    if (verificationRecord.expiresAt < new Date()) {
      await this.emailVerificationRepository.delete(verificationRecord.id);

      throw new UnauthorizedError(
        'auth.verifyEmail.tokenExpired',
        ERROR_CODE.EMAIL_VERIFICATION_TOKEN_EXPIRED,
      );
    }

    // Check if the user's email is already verified
    const newUser = await this.userRepository.findById(verificationRecord.userId);

    if (!newUser) {
      throw new UnauthorizedError('user.userNotFound', ERROR_CODE.USER_UNAVAILABLE);
    }

    await this.transactionService.run(async (tx) => {
      // 1. Update user status to ACTIVE and mark email as verified
      await this.userRepository.update(
        verificationRecord.userId,
        {
          emailVerified: true,
          status: UserStatus.ACTIVE,
        },
        tx,
      );

      // 2. Create default workspace for the new user
      await this.workspaceRepository.create(tx, {
        name: newUser.fullName || 'Default Workspace',
        ownerId: newUser.id,
      });

      // 3. Delete the verification token after successful verification
      await this.emailVerificationRepository.delete(verificationRecord.id, tx);
    });

    // Publish an email verified event to notify other services or components
    await this.authPublisher.emailVerified({
      userId: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName ?? '',
      ipAddress,
    });

    return await this.completeLogin(
      newUser,
      {
        ipAddress: ipAddress,
        userAgent: userAgent,
        rememberMe: false,
      },
      'password',
    );
  }

  /**
   * Resend the email verification token to the user
   * - Generate a new verification token
   * - Delete any existing tokens for the user
   * - Create a new verification token in the database
   * - Publish a user registered event to notify other services or components
   * @param user - The user object for whom the verification email is being resent
   * @param ipAddress - Optional IP address of the request
   */
  private async sendVerificationEmail(user: User, ipAddress?: string) {
    // Generate a new verification token
    const verifyToken = randomUUID();

    // Use a transaction to ensure that the deletion of old tokens and creation of the new token are atomic
    await this.transactionService.run(async (tx) => {
      // Delete any existing verification tokens for the user
      await this.emailVerificationRepository.deleteByUserId(user.id, tx);

      // Create a new verification token for the user
      await this.emailVerificationRepository.create(tx, {
        userId: user.id,
        verifyToken,
      });
    });

    // Publish a user registered event to notify other services or components
    await this.authPublisher.userRegistered({
      userId: user.id,
      email: user.email,
      fullName: user.fullName ?? '',
      verifyToken,
      ipAddress,
    });
  }

  /**
   * Resend the verification email to a user
   * - Check if the user exists and is eligible for verification
   * - Generate a new verification token and send the email
   * @param email - The email address of the user to resend the verification email to
   * @param ipAddress - Optional IP address of the request
   * @throws ConflictError if the user is not found or not eligible for verification
   */
  async resendVerificationEmail(email: string, ipAddress?: string): Promise<void> {
    // Find the user by email
    const user = await this.userRepository.findByEmail(email);

    // Check if the user exists
    if (!user) {
      throw new ConflictError('auth.user.userNotFound', ERROR_CODE.USER_UNAVAILABLE);
    }

    // Publish an event indicating that the verification email has been resent
    await this.authPublisher.verificationEmailResent({
      userId: user.id,
      email: user.email,
      fullName: user.fullName ?? '',
      ipAddress,
    });

    // Send a new verification email to the user
    await this.sendVerificationEmail(user, ipAddress);
  }

  /**
   * Create a pending user with a verification token
   * - Hash the user's password
   * - Create the user in the database with a PENDING_VERIFICATION status
   * - Generate a unique verification token and save it in the database
   * - Return the created user and the verification token
   * @param email - The email address of the new user
   * @param password - The raw password of the new user
   * @param fullName - The full name of the new user
   * @returns An object containing the created user and the verification token
   */
  private async createPendingUser(email: string, password: string, fullName: string) {
    // Hash the user's password before saving it to the database
    const hashedPassword = await hashPassword(password);

    // Use a transaction to ensure that user creation and token generation are atomic
    return this.transactionService.run(async (tx) => {
      // Create the user in the database with a PENDING_VERIFICATION status
      const user = await this.userRepository.createUser(
        {
          email,
          passwordHash: hashedPassword,
          fullName,
          status: UserStatus.PENDING_VERIFICATION,
          language: LANGUAGE.EN,
          timezone: 'UTC',
        },
        tx,
      );

      // Delete any existing verification tokens for this user to avoid duplicates
      await this.emailVerificationRepository.deleteByUserId(user.id, tx);

      // Generate a unique verification token for email confirmation
      const verifyToken = randomUUID();

      // Save the verification token in the database
      await this.emailVerificationRepository.create(tx, {
        userId: user.id,
        verifyToken,
      });

      // Return the created user and the verification token to the caller
      return {
        user,
        verifyToken,
      };
    });
  }

  /**
   * Handle forgot password request
   * - Check if the user exists and is eligible for password reset
   * - Generate a password reset token and save it in the database
   * - Send a password reset email to the user (implementation not shown)
   * @param email - The email address of the user requesting a password reset
   * @param ipAddress - Optional IP address of the request
   */
  async forgotPassword(email: string, ipAddress?: string): Promise<void> {
    // Find the user by email
    const user = await this.userRepository.findByEmail(email);

    // Check if the user exists and is eligible for password reset
    if (!user) {
      return; // Exit early if user not found to avoid revealing user existence
    }

    // Check if the user's email is verified and status is ACTIVE
    if (!user.emailVerified) {
      return; // Exit early if email is not verified
    }

    // Generate a unique password reset token
    if (user.status !== UserStatus.ACTIVE) {
      return; // Exit early if user is not active
    }

    await this.sendResetPasswordEmail(user, ipAddress);
  }

  /**
   * Send a password reset email to the user
   * - Generate a unique password reset token
   * - Delete any existing password reset tokens for the user
   * - Save the new password reset token in the database
   * - Publish a password reset requested event to notify other services or components
   * @param user - The user object for whom the password reset email is being sent
   * @param ipAddress - Optional IP address of the request
   */
  private async sendResetPasswordEmail(user: User, ipAddress?: string): Promise<void> {
    const resetToken = randomUUID();

    // Use a transaction to ensure that the deletion of old tokens and creation of the new token are atomic
    await this.transactionService.run(async (tx) => {
      // Delete any existing password reset tokens for the user
      await this.passwordResetRepository.deleteByUserId(user.id, tx);

      // Create a new password reset token for the user
      await this.passwordResetRepository.create(tx, {
        userId: user.id,
        resetToken,
      });
    });

    // Create a send reset password email event to publish to RabbitMQ
    const event: PasswordResetRequestedEvent = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName || '',
      resetToken, // Using the generated password reset token
      ipAddress, // You can set this if you have access to the request IP
    };

    // Publish the password reset requested event to notify other services or components
    await this.authPublisher.passwordResetRequested(event);
  }

  /**
   * Reset a user's password using a valid reset token
   * - Validate the provided reset token
   * - Check if the user exists and is eligible for password reset
   * - Hash the new password and update the user's password in the database
   * - Delete the used reset token to prevent reuse
   * - Revoke any existing refresh tokens for the user to force re-authentication
   * - Publish a password reset success event to notify other services or components
   *
   * @param resetToken - The password reset token provided by the user
   * @param newPassword - The new password to set for the user
   * @param ipAddress - Optional IP address of the request
   * @throws UnauthorizedError if the reset token is invalid or expired, or if the user is not found
   * @throws ConflictError if the new password is the same as the old password
   */
  async resetPassword(resetToken: string, newPassword: string, ipAddress?: string): Promise<void> {
    // Find the password reset token in the database
    const resetRecord = await this.validatePasswordResetToken(resetToken);

    // Find the user associated with the password reset token
    const user = await this.userRepository.findById(resetRecord.userId);

    if (!user) {
      throw new UnauthorizedError('user.userNotFound', ERROR_CODE.USER_UNAVAILABLE);
    }

    // Hash the new password
    const isSamePassword = await comparePassword(newPassword, user.passwordHash || '');
    if (isSamePassword) {
      throw new ConflictError('auth.resetPassword.samePassword', ERROR_CODE.PASSWORD_SAME_AS_OLD);
    }

    // Hash the new password before saving it to the database
    const hashedPassword = await hashPassword(newPassword);

    // Use a transaction to ensure that password update and token deletion are atomic
    await this.transactionService.run(async (tx) => {
      // Update the user's password
      await this.userRepository.update(user.id, { passwordHash: hashedPassword }, tx);

      // Delete the password reset token after successful password reset
      await this.passwordResetRepository.delete(resetRecord.id);

      // Revoke all existing refresh tokens for the user to force re-authentication
      await this.refreshTokenRepository.deleteByUserId(user.id, tx);
    });

    // Audit
    await this.authPublisher.passwordResetSuccess({
      userId: user.id,
      email: user.email,
      fullName: user.fullName ?? '',
      ipAddress,
    });
  }

  /**
   * Validate a password reset token
   * - Check if the token exists in the database
   * - Check if the token has expired
   * - Return the password reset token record if valid
   * @param token - The password reset token to validate
   * @returns The password reset token record if valid
   * @throws UnauthorizedError if the token is invalid or expired
   */
  private async validatePasswordResetToken(token: string): Promise<PasswordResetToken> {
    // Find the password reset token in the database
    const resetRecord = await this.passwordResetRepository.findByToken(token);

    // Check if the reset token exists
    if (!resetRecord) {
      throw new UnauthorizedError(
        'auth.resetPassword.invalidToken',
        ERROR_CODE.INVALID_PASSWORD_RESET_TOKEN,
      );
    }

    // Check if the reset token has expired
    if (resetRecord.expiresAt < new Date()) {
      await this.passwordResetRepository.delete(resetRecord.id);

      throw new UnauthorizedError(
        'auth.resetPassword.tokenExpired',
        ERROR_CODE.PASSWORD_RESET_TOKEN_EXPIRED,
      );
    }

    // Return the password reset token record if valid
    return resetRecord;
  }

  /**
   * Validate a password reset token without returning the record
   * - This method is useful for scenarios where you only need to check the validity of the token
   * - It calls the validatePasswordResetToken method and ignores the returned record
   * @param token - The password reset token to validate
   * @returns void
   * @throws UnauthorizedError if the token is invalid or expired
   */
  async validateResetPasswordToken(token: string): Promise<void> {
    // Call the validatePasswordResetToken method to check the validity of the token
    await this.validatePasswordResetToken(token);
  }

  /**
   * Find all active sessions for a user
   * - Fetch all active sessions from the refresh token repository
   * - Parse the user agent string to extract device, OS, and browser information
   * - Return an array of session objects containing relevant session details
   * @param userId  - The unique ID of the user for whom to find active sessions
   * @returns An array of session objects containing session details such as ID, IP address, user agent, device, OS, browser, expiration time, and creation time
   * @throws UnauthorizedError if the user is not found
   */
  async findAllSessions(userId: string, sessionId: string) {
    // Fetch all active sessions for the user from the refresh token repository
    const sessions = await this.refreshTokenRepository.findActiveByUserId(userId);

    // Map the sessions to include parsed user agent information
    return sessions.map((session) => {
      // Parse the user agent string to extract device, OS, and browser information
      const device = parseUserAgent(session.userAgent || '');

      // Return an object containing session details along with parsed device information
      return {
        current: session.id === sessionId,
        id: session.id,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        device: device.device,
        os: device.os,
        browser: device.browser,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      };
    });
  }

  /**
   * Logout a specific session for a user
   * - Find the session by user ID and session ID
   * - If the session is not found, throw an UnauthorizedError
   * - Revoke the session to log the user out
   * @param userId - The unique ID of the user
   * @param sessionId - The unique ID of the session to log out
   * @returns void
   * @throws UnauthorizedError if the session is not found or invalid
   */
  async logoutSession(userId: string, sessionId: string): Promise<void> {
    // Find the session by user ID and session ID
    const session = await this.refreshTokenRepository.findActiveByIdAndUserId(sessionId, userId);

    // If the session is not found, throw an UnauthorizedError
    if (!session) {
      throw new UnauthorizedError('auth.middleware.invalidSession', ERROR_CODE.INVALID_SESSION);
    }

    // Revoke the session to log the user out
    await this.refreshTokenRepository.revoke(session.id);
  }

  /**
   * Logout all active sessions for a user
   * - Revoke all active sessions for the user to log them out from all devices
   * @param userId - The unique ID of the user
   * @returns void
   */
  async logoutAllOtherSessions(userId: string, sessionId: string): Promise<void> {
    // Revoke all active sessions for the user to log them out from all devices
    await this.refreshTokenRepository.revokeAllByUserIdExcept(userId, sessionId);
  }
}
