import { OAuthProvider } from '@prisma/client';

export interface OAuthProfile {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  emailVerified: boolean;
}
