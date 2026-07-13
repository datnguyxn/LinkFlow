export const AUTH_CHANNEL = 'linkflow-auth';

export const AUTH_EVENT = {
  GOOGLE_LOGIN_SUCCESS: 'GOOGLE_LOGIN_SUCCESS',
  GOOGLE_LOGIN_CANCELLED: 'GOOGLE_LOGIN_CANCELLED',
  LOGOUT: 'LOGOUT',
} as const;

export function createAuthChannel() {
  if (typeof window === 'undefined') {
    return null;
  }

  return new BroadcastChannel(AUTH_CHANNEL);
}
