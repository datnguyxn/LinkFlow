export const RABBITMQ_EXCHANGE = {
    AUTH: "auth.events",
    WORKSPACE: "workspace.events",
    URL: "url.events",
    NOTIFICATION: "notification.events",
} as const;

export const RABBITMQ_ROUTING_KEY = {
    USER_REGISTERED: "user.registered",
    USER_LOGIN: "user.login",
    USER_LOGOUT: "user.logout",

    WORKSPACE_CREATED: "workspace.created",

    URL_CREATED: "url.created",
    URL_DELETED: "url.deleted",
} as const;

export const RABBITMQ_QUEUE = {
    EMAIL_USER_REGISTERED: "email.user.registered",

    AUDIT_USER_REGISTERED: "audit.user.registered",
    AUDIT_USER_LOGIN: "audit.user.login",

    NOTIFICATION_USER_REGISTERED: "notification.user.registered",

    ANALYTICS_USER_REGISTERED: "analytics.user.registered",
} as const;