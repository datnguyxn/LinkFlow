export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  language: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}
