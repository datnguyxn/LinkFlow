export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  locale?: string;
}

export interface GoogleCallbackQuery {
  code: string;
  state?: string;
  rememberMe?: boolean; // Optional boolean to indicate if the user wants to stay logged in
  error?: string; // Optional error message if the user denied access
}
