export const RABBITMQ_EXCHANGE = {
    AUTH: "auth.events",
    ADMIN_USER: "admin.user.events",
    WORKSPACE: "workspace.events",
    URL: "url.events",
    NOTIFICATION: "notification.events",
} as const;

export const RABBITMQ_ROUTING_KEY = {
    USER_REGISTERED: "user.registered",
    USER_LOGIN: "user.login",
    USER_LOGOUT: "user.logout",
    USER_ACTION: "user.action",
    USER_BANNED: "user.banned",
    USER_UNBANNED: "user.unbanned",
    USER_ACTIVATED: "user.activated",
    USER_INACTIVED: "user.inactived",
    USER_DELETED: "user.deleted",
    USER_RESTORED: "user.restored",

    WORKSPACE_CREATED: "workspace.created",

    URL_CREATED: "url.created",
    URL_DELETED: "url.deleted",
} as const;

export const RABBITMQ_QUEUE = {
    EMAIL_USER_REGISTERED: "email.user.registered",
    EMAIL_USER_ACTION: "email.user.action",

    AUDIT_USER_REGISTERED: "audit.user.registered",
    AUDIT_USER_LOGIN: "audit.user.login",
    AUDIT_USER_LOGOUT: "audit.user.logout",

    AUDIT_USER_ACTION: "audit.user.action",
    AUDIT_USER_BANNED: "audit.user.banned",
    AUDIT_USER_UNBANNED: "audit.user.unbanned",
    AUDIT_USER_ACTIVATED: "audit.user.activated",
    AUDIT_USER_INACTIVED: "audit.user.inactived",
    AUDIT_USER_DELETED: "audit.user.deleted",
    AUDIT_USER_RESTORED: "audit.user.restored",

    NOTIFICATION_USER_REGISTERED: "notification.user.registered",

    ANALYTICS_USER_REGISTERED: "analytics.user.registered",
} as const;