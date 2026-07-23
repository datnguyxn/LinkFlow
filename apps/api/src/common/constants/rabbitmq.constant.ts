export const RABBITMQ_EXCHANGE = {
  AUTH: 'auth.events',
  ADMIN_USER: 'admin.user.events',
  WORKSPACE: 'workspace.events',
  URL: 'url.events',
  NOTIFICATION: 'notification.events',
  USER: 'user.events',
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
  USER_PROFILE_UPDATED: 'user.profile.updated',
  USER_PASSWORD_CHANGED: 'user.password.changed',
  USER_AVATAR_UPDATED: 'user.avatar.updated',
  USER_ACCOUNT_DELETED: 'user.account.deleted',

  EMAIL_VERIFIED: 'auth.email.verified',

  VERIFICATION_EMAIL_RESENT: 'auth.email.verification.resent',

  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',

  PASSWORD_RESET_SUCCESS: 'auth.password.reset.success',

  GOOGLE_LOGIN: 'auth.google.login',

  WORKSPACE_CREATED: 'workspace.created',
  WORKSPACE_UPDATED: 'workspace.updated',
  WORKSPACE_DELETED: 'workspace.deleted',

  URL_CREATED: 'url.created',
  URL_DELETED: 'url.deleted',

  USER_SESSION_REVOKED: 'user.session.revoked',

  WORKSPACE_INVITATION_CREATED: 'workspace.invitation.created',
  WORKSPACE_INVITATION_ACCEPTED: 'workspace.invitation.accepted',
  WORKSPACE_INVITATION_REJECTED: 'workspace.invitation.rejected',
  WORKSPACE_INVITATION_REVOKED: 'workspace.invitation.revoked',
  WORKSPACE_INVITATION_EXPIRED: 'workspace.invitation.expired',
} as const;

export const RABBITMQ_QUEUE = {
  EMAIL_USER_REGISTERED: 'email.user.registered',
  EMAIL_USER_ACTION: 'email.user.action',
  EMAIL_PASSWORD_RESET_REQUESTED: 'email.password.reset.requested',
  EMAIL_WORKSPACE_INVITATION_CREATED: 'email.workspace.invitation.created',
  EMAIL_WORKSPACE_INVITATION_ACCEPTED: 'email.workspace.invitation.accepted',
  EMAIL_WORKSPACE_INVITATION_REJECTED: 'email.workspace.invitation.rejected',
  EMAIL_WORKSPACE_INVITATION_REVOKED: 'email.workspace.invitation.revoked',
  
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
  AUDIT_USER_PROFILE_UPDATED: 'audit.user.profile.updated',
  AUDIT_USER_PASSWORD_CHANGED: 'audit.user.password.changed',
  AUDIT_USER_AVATAR_UPDATED: 'audit.user.avatar.updated',
  AUDIT_USER_ACCOUNT_DELETED: 'audit.user.account.deleted',

  NOTIFICATION_USER_REGISTERED: 'notification.user.registered',

  ANALYTICS_USER_REGISTERED: 'analytics.user.registered',

  AUDIT_SESSION_REVOKED: 'audit.session.revoked',
  
  AUDIT_WORKSPACE_CREATED: 'audit.workspace.created',
  AUDIT_WORKSPACE_UPDATED: 'audit.workspace.updated',
  AUDIT_WORKSPACE_DELETED: 'audit.workspace.deleted',

  AUDIT_WORKSPACE_INVITATION_CREATED: 'audit.workspace.invitation.created',
  AUDIT_WORKSPACE_INVITATION_ACCEPTED: 'audit.workspace.invitation.accepted',
  AUDIT_WORKSPACE_INVITATION_REJECTED: 'audit.workspace.invitation.rejected',
  AUDIT_WORKSPACE_INVITATION_REVOKED: 'audit.workspace.invitation.revoked',
  AUDIT_WORKSPACE_INVITATION_EXPIRED: 'audit.workspace.invitation.expired',


  NOTIFICATION_WORKSPACE_INVITATION_CREATED: 'notification.workspace.invitation.created',
  NOTIFICATION_WORKSPACE_INVITATION_ACCEPTED: 'notification.workspace.invitation.accepted',
  NOTIFICATION_WORKSPACE_INVITATION_REJECTED: 'notification.workspace.invitation.rejected',
  NOTIFICATION_WORKSPACE_INVITATION_REVOKED: 'notification.workspace.invitation.revoked',
} as const;
