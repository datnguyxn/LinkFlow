import { config } from "./env/index.ts";

/**
 * OAuth configuration for different providers.
 * - Contains client IDs, client secrets, redirect URIs, and endpoint URLs.
 * - Supports Google OAuth with specified scopes.
 */
export const oauthConfig = {
    google: {
        // Google OAuth client ID
        clientId: config.GOOGLE_CLIENT_ID,

        // Google OAuth client secret
        clientSecret: config.GOOGLE_CLIENT_SECRET,

        // Redirect URI for Google OAuth callback
        redirectUri: `${config.BASE_URL}:${config.PORT}${config.API_PREFIX}/auth${config.GOOGLE_CALLBACK_URL}`,

        // OAuth endpoint URLs for Google
        authorizationUrl: config.GOOGLE_AUTHORIZATION_URL,

        // Token endpoint URL for exchanging authorization code for access token
        tokenUrl: config.GOOGLE_TOKEN_URL,

        // User info endpoint URL for retrieving user profile information
        userInfoUrl: config.GOOGLE_USER_INFO_URL,

        // Scopes requested during the OAuth flow
        scopes: [
            "openid",
            "email",
            "profile",
        ],
    }
};