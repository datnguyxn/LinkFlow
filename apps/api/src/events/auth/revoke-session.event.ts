export interface AuthSessionRevokedEvent {
  sessionId: string;

  userId: string;

  revokedBy: string;

  revokedAt: string;

  reason: 'USER_LOGOUT' | 'USER_REVOKE' | 'PASSWORD_CHANGED' | 'ADMIN_REVOKE' | 'ACCOUNT_DELETED';

  ipAddress?: string | null;
}
