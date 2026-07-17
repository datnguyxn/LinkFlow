export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  statusCode: 0;
  message: 'string';
  data: {
    accessToken: 'string';
    refreshToken: 'string';
  };
  meta: {
    timestamp: 'string';
    requestId: 'string';
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface RegisterResponse {
  success: boolean;
  statusCode: 0;
  message: 'string';
  data: {
    accessToken: 'string';
    refreshToken: 'string';
  };
  meta: {
    timestamp: 'string';
    requestId: 'string';
  };
}

export interface RefreshResponse {
  success: boolean;
  statusCode: 0;
  message: 'string';
  data: {
    accessToken: 'string';
    refreshToken: 'string';
  };
  meta: {
    timestamp: 'string';
    requestId: 'string';
  };
}

export interface UserProfile {
  email: string;
  fullName: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  emailVerified: boolean;
  theme: string;
  language: string;
  timezone: string;
  createdAt: string;
  provider: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
}

export interface ProfileResponse {
  success: boolean;
  statusCode: 0;
  message: 'string';
  data: UserProfile;
  meta: {
    timestamp: 'string';
    requestId: 'string';
  };
}
