import type { AuthResponse } from '../types/auth.type.ts';
import { TransactionService } from '../../../infrastructure/database/index.ts';
import { AuthService } from './auth.service.ts';
import { GoogleProvider } from '../providers/google.provider.ts';
import { OAuthRepository } from '../../users/repository/oauth.repository.ts';
import { UserRepository } from '../../users/index.ts';
import { LANGUAGE } from '../../../common/constants/index.ts';
import type { OAuthProfile } from '../types/oauth.type.ts';
import type { User } from '@prisma/client';
import { oauthConfig } from '../../../config/oauth.config.ts';
import crypto from 'node:crypto';
import type { LoginOptions } from '../types/login-option.type.ts';
import { WorkspaceRepository } from '../../workspace/index.ts';

/**
 * OAuthService handles OAuth authentication flows for different providers.
 * - Currently supports Google OAuth.
 * - Provides methods to generate authorization URLs and handle login with authorization codes.
 */
export class OAuthService {
  // Constructor for the OAuthService class.
  constructor(
    private googleProvider = new GoogleProvider(),
    private oauthRepository = new OAuthRepository(),
    private userRepository = new UserRepository(),
    private authService = new AuthService(),
    private transactionService = new TransactionService(),
    private workspaceRepository = new WorkspaceRepository(),
  ) {}

  /**
   * Generates the Google OAuth authorization URL for user login.
   * - User clicks "Login with Google" button.
   * - Redirects to Google's OAuth consent screen.
   * - User grants permissions and is redirected back with an authorization code.
   * - The authorization code is exchanged for an access token and user info.  
   *
   * @param code - The authorization code received from Google's OAuth 2.0 authorization server.
   * @param rememberMe - Optional boolean to indicate if the user wants to stay logged in.
   * @param ipAddress - Optional IP address of the user for logging purposes.
   * @param userAgent - Optional user agent string of the user's browser for logging purposes.
   * @returns A promise that resolves to an AuthResponse containing access and refresh tokens.
   */
  async loginWithGoogle(code: string, options: LoginOptions): Promise<AuthResponse> {
    // Exchange authorization code
    const token = await this.googleProvider.exchangeCode(code);

    // Get Google profile
    const profile = await this.googleProvider.getUserInfo(token.access_token);

    // Find or create user
    const user = await this.findOrCreateUser(profile);

    // Complete login
    return this.authService.completeLogin(user, options, 'google');
  }

  /**
   * Finds an existing user by their OAuth profile or creates a new user if none exists.
   * - Checks for an existing OAuth account linked to the provider and provider account ID.
   * - If found, retrieves the associated user.
   * - If not found, checks for an existing user by email.
   * - If no user exists, creates a new user and links the OAuth account.
   * @param profile - The OAuth profile containing user information from the provider.
   * @returns A promise that resolves to the found or newly created User object.
   */
  private async findOrCreateUser(profile: OAuthProfile): Promise<User> {
    // Find OAuth account
    const oauth = await this.oauthRepository.findByProvider(profile.provider, profile.providerId);

    if (oauth) {
      const user = await this.userRepository.findById(oauth.userId);

      if (user) {
        return user;
      }
    }

    // Find by email
    const existingUser = await this.userRepository.findByEmail(profile.email);

    if (existingUser) {
      await this.oauthRepository.create({
        provider: profile.provider,
        providerAccountId: profile.providerId,
        user: {
          connect: {
            id: existingUser.id,
          },
        },
      });

      // Return the existing user if found
      return existingUser;
    }

    // New User
    return this.transactionService.run(async (tx) => {
      // Create a new user and link the OAuth account within a transaction
      const user = await this.userRepository.createOAuthUser(
        {
          email: profile.email,
          fullName: profile.fullName,
          avatarUrl: profile.avatarUrl,
          emailVerified: profile.emailVerified,
          language: LANGUAGE.EN,
          timezone: 'UTC',
        },
        tx,
      );

      await this.oauthRepository.create(
        {
          provider: profile.provider,
          providerAccountId: profile.providerId,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        tx,
      );

      await this.workspaceRepository.create(
        {
          name: profile.fullName || 'Default Workspace',
          ownerId: user.id,
        },
        tx,
      );

      return user;
    });
  }

  /**
   * Generates the Google OAuth authorization URL for user login.
   * - User clicks "Login with Google" button.
   * - Redirects to Google's OAuth consent screen.
   * - User grants permissions and is redirected back with an authorization code.
   * - The authorization code is exchanged for an access token and user info.
   * @returns The Google OAuth authorization URL as a string.
   */

  getGoogleAuthorizationUrl(): { url: string; state: string } {
    const state = crypto.randomUUID();

    const url = new URL(oauthConfig.google.authorizationUrl);

    url.searchParams.set('client_id', oauthConfig.google.clientId);

    url.searchParams.set('redirect_uri', oauthConfig.google.redirectUri);

    url.searchParams.set('response_type', 'code');

    url.searchParams.set('scope', oauthConfig.google.scopes.join(' '));

    // Request refresh token
    url.searchParams.set('access_type', 'offline');

    // Always show consent screen (optional)
    url.searchParams.set('prompt', 'consent');

    // OpenID Connect
    url.searchParams.set('include_granted_scopes', 'true');

    url.searchParams.set('state', state);

    return {
      url: url.toString(),
      state,
    };
  }
}
