export const RABBITMQ_EXCHANGE = {
  AUTH: 'auth.events',
  ADMIN_USER: 'admin.user.events',
  WORKSPACE: 'workspace.events',
  URL: 'url.events',
  NOTIFICATION: 'notification.events',
} as const;

export const RABBITMQ_ROUTING_KEY = {
  USER_REGISTERED: 'user.registered',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_ACTION: 'user.action',
  USER_BANNED: 'user.banned',
  USER_UNBANNED: 'user.unbanned',
  USER_ACTIVATED: 'user.activated',
  USER_INACTIVED: 'user.inactived',
  USER_DELETED: 'user.deleted',
  USER_RESTORED: 'user.restored',

  EMAIL_VERIFIED: 'auth.email.verified',

  VERIFICATION_EMAIL_RESENT: 'auth.email.verification.resent',

  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',

  PASSWORD_RESET_SUCCESS: 'auth.password.reset.success',

  GOOGLE_LOGIN: 'auth.google.login',

  WORKSPACE_CREATED: 'workspace.created',

  URL_CREATED: 'url.created',
  URL_DELETED: 'url.deleted',
} as const;

export const RABBITMQ_QUEUE = {
  EMAIL_USER_REGISTERED: 'email.user.registered',
  EMAIL_USER_ACTION: 'email.user.action',
  EMAIL_PASSWORD_RESET_REQUESTED: 'email.password.reset.requested',

  AUDIT_USER_REGISTERED: 'audit.user.registered',
  AUDIT_USER_LOGIN: 'audit.user.login',
  AUDIT_USER_LOGOUT: 'audit.user.logout',

  AUDIT_EMAIL_VERIFIED: 'audit.email.verified',

  AUDIT_VERIFICATION_EMAIL_RESENT: 'audit.verification.email.resent',

  AUDIT_PASSWORD_RESET_REQUESTED: 'audit.password.reset.requested',

  AUDIT_PASSWORD_RESET_SUCCESS: 'audit.password.reset.success',

  AUDIT_GOOGLE_LOGIN: 'audit.google.login',

  AUDIT_USER_ACTION: 'audit.user.action',
  AUDIT_USER_BANNED: 'audit.user.banned',
  AUDIT_USER_UNBANNED: 'audit.user.unbanned',
  AUDIT_USER_ACTIVATED: 'audit.user.activated',
  AUDIT_USER_INACTIVED: 'audit.user.inactived',
  AUDIT_USER_DELETED: 'audit.user.deleted',
  AUDIT_USER_RESTORED: 'audit.user.restored',

  NOTIFICATION_USER_REGISTERED: 'notification.user.registered',

  ANALYTICS_USER_REGISTERED: 'analytics.user.registered',
} as const;
