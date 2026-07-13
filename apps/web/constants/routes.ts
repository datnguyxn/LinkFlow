export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  FORGOT_PASSWORD: '/forgot-password',
  FORGOT_PASSWORD_SUCCESS: '/forgot-password/success',

  RESET_PASSWORD: '/reset-password',
  RESET_PASSWORD_SUCCESS: '/reset-password/success',

  VERIFY_EMAIL: '/verify-email',
  REGISTER_SUCCESS: '/register/success',

  DASHBOARD: '/dashboard',
  WORKSPACE: '/workspace',
  SETTINGS: '/settings',
  ANALYTICS: '/analytics',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,

  ROUTES.FORGOT_PASSWORD,
  ROUTES.FORGOT_PASSWORD_SUCCESS,

  ROUTES.RESET_PASSWORD,
  ROUTES.RESET_PASSWORD_SUCCESS,

  ROUTES.VERIFY_EMAIL,
  ROUTES.REGISTER_SUCCESS,
] as const;

export const PROTECTED_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.WORKSPACE,
  ROUTES.SETTINGS,
  ROUTES.ANALYTICS,
] as const;

export function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) =>
    route === ROUTES.HOME ? pathname === ROUTES.HOME : pathname.startsWith(route),
  );
}

export function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}
