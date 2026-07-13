import axios, { AxiosError } from 'axios';
import { oauthConfig } from '../../../config/oauth.config.ts';
import { AppError } from '../../../common/errors/index.ts';
import { HTTP_STATUS } from '../../../common/constants/index.ts';
import { OAuthProvider } from '@prisma/client';
import type { GoogleTokenResponse, GoogleUserInfo } from '../types/google.type.ts';
import type { OAuthProfile } from '../types/oauth.type.ts';

/**
 * GoogleProvider handles the OAuth flow for Google authentication.
 * - It provides a method to exchange an authorization code for an access token.
 * - The exchangeCode method sends a POST request to Google's token endpoint with the required parameters.
 * - The response includes the access token, refresh token (if applicable), and other relevant information.
 * - This class can be extended to include additional methods for interacting with Google's APIs if needed.
 */
export class GoogleProvider {
  /**
   * Exchanges an authorization code for an access token from Google's OAuth 2.0 token endpoint.
   * @param code - The authorization code received from Google's OAuth 2.0 authorization server.
   * @returns A promise that resolves to a GoogleTokenResponse containing the access token and related information.
   */
  async exchangeCode(code: string): Promise<GoogleTokenResponse> {
    // Send a POST request to Google's token endpoint with the required parameters
    const { data } = await axios.post<GoogleTokenResponse>(
      oauthConfig.google.tokenUrl,
      new URLSearchParams({
        code,
        client_id: oauthConfig.google.clientId,
        client_secret: oauthConfig.google.clientSecret,
        redirect_uri: oauthConfig.google.redirectUri,
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // Return the token response data
    return data;
  }

  /**
   * Fetches user information from Google's UserInfo endpoint using the provided access token.
   * @param accessToken - The access token obtained from the token exchange.
   * @returns A promise that resolves to an OAuthProfile containing the user's profile information.
   * @throws AppError if the request to fetch user info fails.
   */
  async getUserInfo(accessToken: string): Promise<OAuthProfile> {
    // Send a GET request to Google's UserInfo endpoint with the access token in the Authorization header
    try {
      const { data } = await axios.get<GoogleUserInfo>(oauthConfig.google.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Return the user's profile information in the expected format
      return {
        provider: OAuthProvider.GOOGLE,
        providerId: data.sub,
        email: data.email,
        fullName: data.name,
        avatarUrl: data.picture,
        emailVerified: data.email_verified,
      };
    } catch (error) {
      // Handle errors that occur while fetching user info from Google
      if (error instanceof AxiosError) {
        throw new AppError(
          HTTP_STATUS.UNAUTHORIZED,
          `Failed to fetch user info from Google: ${error.response?.data?.error_description || error.message}`,
          'GOOGLE_USER_INFO_ERROR',
        );
      }

      // If the error is not an AxiosError, rethrow it to be handled by the caller
      throw error;
    }
  }
}
